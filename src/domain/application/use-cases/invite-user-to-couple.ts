import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { Invitation } from '@/domain/entities/invitation'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { CouplesRepository } from '../repositories/couples-repository'
import { InvitationsRepository } from '../repositories/invitations-repository'
import { UserNotCoupleMemberError } from './errors/user-not-couple-member-error'
import { UniqueEntityID } from '@/core/unique-entity-id'

interface InviteUserToCoupleUseCaseRequest {
  inviterUserId: string
  coupleId: string
  inviteeEmail: string
}

type InviteUserToCoupleUseCaseResponse = Either<
  ResourceNotFoundError | UserNotCoupleMemberError,
  {
    invitation: Invitation
  }
>

@Injectable()
export class InviteUserToCoupleUseCase {
  constructor(
    private couplesRepository: CouplesRepository,
    private usersRepository: UsersRepository,
    private invitationsRepository: InvitationsRepository,
  ) {}

  async execute({
    inviterUserId,
    coupleId,
    inviteeEmail,
  }: InviteUserToCoupleUseCaseRequest): Promise<InviteUserToCoupleUseCaseResponse> {
    const inviter = await this.usersRepository.findById(inviterUserId)

    if (!inviter) {
      return left(new ResourceNotFoundError())
    }

    const couple = await this.couplesRepository.findById(coupleId)

    if (!couple) {
      return left(new ResourceNotFoundError())
    }

    const isInviterOnCouple = couple.members.some(
      (member) => member.toString() === inviterUserId,
    )

    if (!isInviterOnCouple) {
      return left(new UserNotCoupleMemberError())
    }

    const invitedUser = await this.usersRepository.findByEmail(inviteeEmail)

    if (!invitedUser) {
      return left(new ResourceNotFoundError())
    }

    const token = new UniqueEntityID().toString()

    const invitation = Invitation.create({
      coupleId: couple.id,
      inviterUserId: new UniqueEntityID(inviterUserId),
      inviteeEmail: invitedUser.email,
      token,
    })

    await this.invitationsRepository.create(invitation)

    return right({ invitation })
  }
}
