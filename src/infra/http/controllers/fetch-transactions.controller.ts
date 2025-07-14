import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found'
import { InvalidTransactionError } from '@/domain/application/use-cases/errors/invalid-transaction-error'
import { FetchTransactionsUseCase } from '@/domain/application/use-cases/fetch-transactions'

const fetchTransactionsQuerySchema = z.object({
  page: z.string().default('0').transform(Number),
  limit: z.string().default('10').transform(Number),
  userId: z.string().optional(),
  type: z
    .enum(['income', 'expense'])
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  category: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === null || val === '' ? undefined : val)),
  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => new Date(val ?? new Date().toISOString())),
})

type FetchTransactionsQuerySchema = z.infer<typeof fetchTransactionsQuerySchema>

@Controller('/couples/:coupleId/transactions')
export class FetchTransactionsController {
  constructor(private fetchTransactionsUseCase: FetchTransactionsUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(fetchTransactionsQuerySchema))
    query: FetchTransactionsQuerySchema,
    @CurrentUser() user: UserPayload,
    @Param('coupleId') coupleId: string,
  ) {
    const { page, limit, userId, type, category, startDate, endDate } = query

    const result = await this.fetchTransactionsUseCase.execute({
      userId,
      coupleId,
      page,
      limit,
      type,
      category,
      startDate,
      endDate,
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

    return {
      transactions: result.value.transactions,
    }
  }
}
