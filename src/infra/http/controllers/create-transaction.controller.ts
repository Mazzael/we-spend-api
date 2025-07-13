import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { CreateTransactionUseCase } from '@/domain/application/use-cases/create-transaction'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found'
import { InvalidTransactionError } from '@/domain/application/use-cases/errors/invalid-transaction-error'

const createTransactionBodySchema = z.object({
  description: z.string(),
  amountInCents: z.number(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
  date: z.string(),
  paidBy: z.array(
    z.object({
      userId: z.string(),
      amountInCents: z.number(),
    }),
  ),
})

type CreateTransactionBodySchema = z.infer<typeof createTransactionBodySchema>
@Controller('/couples/:coupleId/transactions')
export class CreateTransactionController {
  constructor(private createTransactionUseCase: CreateTransactionUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createTransactionBodySchema))
    body: CreateTransactionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('coupleId') coupleId: string,
  ) {
    const { description, amountInCents, type, category, date, paidBy } = body

    const result = await this.createTransactionUseCase.execute({
      coupleId,
      description,
      amountInCents,
      type,
      category,
      date: new Date(date),
      paidBy,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case InvalidTransactionError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
