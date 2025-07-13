import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found'
import { AnswerInvitationUseCase } from '@/domain/application/use-cases/answer-invite'
import { NotAllowedError } from '@/domain/application/use-cases/errors/not-allowed-error'
import { InvitationAlreadyAnsweredError } from '@/domain/application/use-cases/errors/invitation-already-answered-error'
import { UserAlreadyInCoupleError } from '@/domain/application/use-cases/errors/user-already-in-couple-error'

const answerInviteBodySchema = z.object({
  answer: z.enum(['accept', 'reject']),
})

type AnswerInviteBodySchema = z.infer<typeof answerInviteBodySchema>
@Controller('/couples/invites/answers/:token')
export class AnswerInviteController {
  constructor(private answerInviteUseCase: AnswerInvitationUseCase) {}

  @Patch()
  async handle(
    @Body(new ZodValidationPipe(answerInviteBodySchema))
    body: AnswerInviteBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('token') token: string,
  ) {
    const { answer } = body

    const userId = user.sub

    const result = await this.answerInviteUseCase.execute({
      answer,
      token,
      userId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        case InvitationAlreadyAnsweredError:
          throw new ConflictException(error.message)
        case UserAlreadyInCoupleError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
