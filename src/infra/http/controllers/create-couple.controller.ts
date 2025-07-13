import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { CreateCoupleUseCase } from '@/domain/application/use-cases/create-couple'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found'
import { CoupleAlreadyExistsError } from '@/domain/application/use-cases/errors/couple-already-exists-error'

const createCoupleBodySchema = z.object({
  name: z.string(),
})

type CreateCoupleBodySchema = z.infer<typeof createCoupleBodySchema>
@Controller('/couples')
export class CreateCoupleController {
  constructor(private createCoupleUseCase: CreateCoupleUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createCoupleBodySchema))
    body: CreateCoupleBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name } = body

    const userId = user.sub

    const result = await this.createCoupleUseCase.execute({
      userId,
      name,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case CoupleAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
