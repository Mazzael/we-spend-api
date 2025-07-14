import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { InvitationsRepository } from '../repositories/invitations-repository'
import { UsersRepository } from '../repositories/users-repository'
import { CouplesRepository } from '../repositories/couples-repository'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { Couple } from '@/domain/entities/couple'
import { InvitationAlreadyAnsweredError } from './errors/invitation-already-answered-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { UserAlreadyInCoupleError } from './errors/user-already-in-couple-error'
import { InvalidInvitationAnswerError } from './errors/invalid-invitation-answer-error'

interface AnswerInvitationUseCaseRequest {
  token: string
  userId: string
  answer: 'accept' | 'reject'
}

type AnswerInvitationUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvitationAlreadyAnsweredError
  | NotAllowedError
  | UserAlreadyInCoupleError,
  {
    couple: Couple
  } | null
>

@Injectable()
export class AnswerInvitationUseCase {
  constructor(
    private invitationsRepository: InvitationsRepository,
    private usersRepository: UsersRepository,
    private couplesRepository: CouplesRepository,
  ) {}

  async execute({
    token,
    userId,
    answer,
  }: AnswerInvitationUseCaseRequest): Promise<AnswerInvitationUseCaseResponse> {
    const invitation = await this.invitationsRepository.findByToken(token)
    if (!invitation) {
      return left(new ResourceNotFoundError())
    }

    if (invitation.status !== 'pending') {
      return left(new InvitationAlreadyAnsweredError())
    }

    const user = await this.usersRepository.findById(userId)
    if (!user) {
      return left(new ResourceNotFoundError())
    }

    if (user.email !== invitation.inviteeEmail) {
      return left(new NotAllowedError())
    }

    const couple = await this.couplesRepository.findById(
      invitation.coupleId.toString(),
    )
    if (!couple) {
      return left(new ResourceNotFoundError())
    }

    const isUserAlreadyAnotherCoupleMember = user.coupleId !== null

    if (isUserAlreadyAnotherCoupleMember) {
      return left(new UserAlreadyInCoupleError())
    }

    switch (answer) {
      case 'accept': {
        couple.addMember(user.id)
        invitation.updateStatus('accepted')
        await this.couplesRepository.save(couple)

        user.enterOnCouple(couple.id)
        await this.usersRepository.save(user)

        break
      }

      case 'reject': {
        invitation.updateStatus('rejected')
        return right(null)
      }

      default: {
        return left(new InvalidInvitationAnswerError())
      }
    }

    await this.invitationsRepository.save(invitation)

    return right({ couple })
  }
}
