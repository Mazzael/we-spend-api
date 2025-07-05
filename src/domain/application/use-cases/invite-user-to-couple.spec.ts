import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryCouplesRepository } from 'test/repositories/in-memory-couples-repository'
import { InMemoryInvitationsRepository } from 'test/repositories/in-memory-invitations-repository'
import { InviteUserToCoupleUseCase } from './invite-user-to-couple'
import { makeUser } from 'test/factories/make-user'
import { makeCouple } from 'test/factories/make-couple'
import { ResourceNotFoundError } from './errors/resource-not-found'

describe('Create User', () => {
  let inMemoryCouplesRepository: InMemoryCouplesRepository
  let inMemoryUsersRepository: InMemoryUsersRepository
  let inMemoryInvitationsRepository: InMemoryInvitationsRepository

  let sut: InviteUserToCoupleUseCase

  beforeEach(() => {
    inMemoryCouplesRepository = new InMemoryCouplesRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryInvitationsRepository = new InMemoryInvitationsRepository()

    sut = new InviteUserToCoupleUseCase(
      inMemoryCouplesRepository,
      inMemoryUsersRepository,
      inMemoryInvitationsRepository,
    )
  })

  it('should invite a user to couple', async () => {
    const user = makeUser({})

    await inMemoryUsersRepository.create(user)

    const couple = makeCouple({
      members: [user.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const invitedUser = makeUser({
      email: 'johndoe@example.com',
    })

    await inMemoryUsersRepository.create(invitedUser)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      inviterUserId: user.id.toString(),
      inviteeEmail: invitedUser.email,
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.invitation).toBeDefined()
      expect(result.value.invitation.inviteeEmail).toBe(invitedUser.email)
      expect(result.value.invitation.coupleId.toString()).toBe(
        couple.id.toString(),
      )
      expect(result.value.invitation.token).toBeDefined()
      expect(result.value.invitation.status).toBe('pending')
      expect(inMemoryInvitationsRepository.items).toHaveLength(1)
    }
  })

  it('should not create an invite if inviter doesnt exist', async () => {
    const couple = makeCouple({
      members: [],
    })

    await inMemoryCouplesRepository.create(couple)

    const invitedUser = makeUser({
      email: 'johndoe@example.com',
    })

    await inMemoryUsersRepository.create(invitedUser)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      inviterUserId: 'non-existing-user-id',
      inviteeEmail: 'johndoe@example.com',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(inMemoryInvitationsRepository.items).toHaveLength(0)
  })

  it('should not create an invite if couple doesnt exist', async () => {
    const inviterUser = makeUser({})

    await inMemoryUsersRepository.create(inviterUser)

    const invitedUser = makeUser({
      email: 'johndoe@example.com',
    })

    await inMemoryUsersRepository.create(invitedUser)

    const result = await sut.execute({
      coupleId: 'non-existing-couple-id',
      inviterUserId: inviterUser.id.toString(),
      inviteeEmail: 'johndoe@example.com',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(inMemoryInvitationsRepository.items).toHaveLength(0)
  })

  it('should not create an invite if invited user doesnt exist', async () => {
    const inviterUser = makeUser({})

    await inMemoryUsersRepository.create(inviterUser)

    const couple = makeCouple({
      members: [inviterUser.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      inviterUserId: inviterUser.id.toString(),
      inviteeEmail: 'non-existing-invitee',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(inMemoryInvitationsRepository.items).toHaveLength(0)
  })
})
