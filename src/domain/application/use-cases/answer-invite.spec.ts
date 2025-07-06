import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { InMemoryInvitationsRepository } from 'test/repositories/in-memory-invitations-repository'
import { InMemoryCouplesRepository } from 'test/repositories/in-memory-couples-repository'
import { AnswerInvitationUseCase } from './answer-invite'
import { makeInvitation } from 'test/factories/make-invitation'
import { makeCouple } from 'test/factories/make-couple'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { InvitationAlreadyAnsweredError } from './errors/invitation-already-answered-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { UserAlreadyInCoupleError } from './errors/user-already-in-couple-error'
import { InvalidInvitationAnswerError } from './errors/invalid-invitation-answer-error'
import { UniqueEntityID } from '@/core/unique-entity-id'

describe('Answer Invitation', () => {
  let inMemoryInvitationsRepository: InMemoryInvitationsRepository
  let inMemoryUsersRepository: InMemoryUsersRepository
  let inMemoryCouplesRepository: InMemoryCouplesRepository

  let sut: AnswerInvitationUseCase

  beforeEach(() => {
    inMemoryInvitationsRepository = new InMemoryInvitationsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryCouplesRepository = new InMemoryCouplesRepository()

    sut = new AnswerInvitationUseCase(
      inMemoryInvitationsRepository,
      inMemoryUsersRepository,
      inMemoryCouplesRepository,
    )
  })

  it('should accept an invitation successfully', async () => {
    const inviter = makeUser({})

    await inMemoryUsersRepository.create(inviter)

    const invitedUser = makeUser({})

    await inMemoryUsersRepository.create(invitedUser)

    const couple = makeCouple({
      members: [inviter.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const invitation = makeInvitation({
      inviteeEmail: invitedUser.email,
      coupleId: couple.id,
      status: 'pending',
    })

    await inMemoryInvitationsRepository.create(invitation)

    const result = await sut.execute({
      answer: 'accept',
      token: invitation.token,
      userId: invitedUser.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.couple).toBeDefined()
      expect(result.value.couple.id).toEqual(couple.id)
      expect(result.value.couple.members).toHaveLength(2)
      expect(result.value.couple.members).toContain(inviter.id)
      expect(result.value.couple.members).toContain(invitedUser.id)
      expect(invitation.status).toBe('accepted')
      expect(invitedUser.coupleId).toEqual(couple.id)
    }
  })

  it('should reject an invitation successfully', async () => {
    const inviter = makeUser({})

    await inMemoryUsersRepository.create(inviter)

    const invitedUser = makeUser({
      coupleId: null,
    })

    await inMemoryUsersRepository.create(invitedUser)

    const couple = makeCouple({
      members: [inviter.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const invitation = makeInvitation({
      inviteeEmail: invitedUser.email,
      coupleId: couple.id,
      status: 'pending',
    })

    await inMemoryInvitationsRepository.create(invitation)

    const result = await sut.execute({
      answer: 'reject',
      token: invitation.token,
      userId: invitedUser.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value).toBeNull()
      expect(couple.members).toHaveLength(1)
      expect(couple.members).toContain(inviter.id)
      expect(invitation.status).toBe('rejected')
      expect(invitedUser.coupleId).toBeNull()
    }
  })

  it('should not be able to answer a non existing invitation', async () => {
    const inviter = makeUser({})

    await inMemoryUsersRepository.create(inviter)

    const invitedUser = makeUser({})

    await inMemoryUsersRepository.create(invitedUser)

    const couple = makeCouple({
      members: [inviter.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const invitation = makeInvitation({
      inviteeEmail: invitedUser.email,
      coupleId: couple.id,
      status: 'pending',
    })

    await inMemoryInvitationsRepository.create(invitation)

    const result = await sut.execute({
      answer: 'accept',
      token: 'non-existing-token',
      userId: invitedUser.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to answer an already answered invitation', async () => {
    const inviter = makeUser({})

    await inMemoryUsersRepository.create(inviter)

    const invitedUser = makeUser({})

    await inMemoryUsersRepository.create(invitedUser)

    const couple = makeCouple({
      members: [inviter.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const invitation = makeInvitation({
      inviteeEmail: invitedUser.email,
      inviterUserId: inviter.id,
      coupleId: couple.id,
      status: 'accepted',
    })

    await inMemoryInvitationsRepository.create(invitation)

    const result = await sut.execute({
      answer: 'accept',
      token: invitation.token,
      userId: invitedUser.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvitationAlreadyAnsweredError)
  })

  it('should not be able to answer an invitation for another user', async () => {
    const inviter = makeUser({})

    await inMemoryUsersRepository.create(inviter)

    const invitedUser = makeUser({})

    await inMemoryUsersRepository.create(invitedUser)

    const wrongUser = makeUser({})

    await inMemoryUsersRepository.create(wrongUser)

    const couple = makeCouple({
      members: [inviter.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const invitation = makeInvitation({
      inviteeEmail: invitedUser.email,
      inviterUserId: inviter.id,
      coupleId: couple.id,
      status: 'pending',
    })

    await inMemoryInvitationsRepository.create(invitation)

    const result = await sut.execute({
      answer: 'accept',
      token: invitation.token,
      userId: wrongUser.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to answer an invitation if user is already member of a couple', async () => {
    const inviter = makeUser({})

    await inMemoryUsersRepository.create(inviter)

    const invitedUser = makeUser({
      coupleId: new UniqueEntityID('other-couple-id'),
    })

    await inMemoryUsersRepository.create(invitedUser)

    const couple = makeCouple({
      members: [inviter.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const otherCouple = makeCouple(
      {
        members: [invitedUser.id],
      },
      new UniqueEntityID('other-couple-id'),
    )

    await inMemoryCouplesRepository.create(otherCouple)

    const invitation = makeInvitation({
      inviteeEmail: invitedUser.email,
      inviterUserId: inviter.id,
      coupleId: couple.id,
      status: 'pending',
    })

    await inMemoryInvitationsRepository.create(invitation)

    const result = await sut.execute({
      answer: 'accept',
      token: invitation.token,
      userId: invitedUser.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyInCoupleError)
  })

  it('should not be able to answer an invitation with an invalid answer', async () => {
    const inviter = makeUser({})

    await inMemoryUsersRepository.create(inviter)

    const invitedUser = makeUser({})

    await inMemoryUsersRepository.create(invitedUser)

    const couple = makeCouple({
      members: [inviter.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const invitation = makeInvitation({
      inviteeEmail: invitedUser.email,
      coupleId: couple.id,
      status: 'pending',
    })

    await inMemoryInvitationsRepository.create(invitation)

    const result = await sut.execute({
      // @ts-expect-error
      answer: 'random-answer',
      token: invitation.token,
      userId: invitedUser.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidInvitationAnswerError)
  })
})
