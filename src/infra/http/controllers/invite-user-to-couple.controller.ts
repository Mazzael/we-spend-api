import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { InviteUserToCoupleUseCase } from '@/domain/application/use-cases/invite-user-to-couple'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found'
import { UserNotCoupleMemberError } from '@/domain/application/use-cases/errors/user-not-couple-member-error'

const inviteUserToCoupleBodySchema = z.object({
  inviteeEmail: z.string(),
})

type InviteUserToCoupleBodySchema = z.infer<typeof inviteUserToCoupleBodySchema>
@Controller('/couples/invites/:id')
export class InviteUserToCoupleController {
  constructor(private inviteUserToCoupleUseCase: InviteUserToCoupleUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(inviteUserToCoupleBodySchema))
    body: InviteUserToCoupleBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') coupleId: string,
  ) {
    const { inviteeEmail } = body

    const userId = user.sub

    const result = await this.inviteUserToCoupleUseCase.execute({
      inviterUserId: userId,
      coupleId,
      inviteeEmail,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case UserNotCoupleMemberError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
