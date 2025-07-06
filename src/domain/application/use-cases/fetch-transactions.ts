import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { Transaction } from '@/domain/entities/transaction'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { UsersRepository } from '../repositories/users-repository'

interface FetchTransactionsUseCaseRequest {
  coupleId: string
  page: number
  limit: number
  type?: 'income' | 'expense'
  category?: string
  startDate?: Date
  endDate: Date
  userId?: string
}

type FetchTransactionsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    transactions: Transaction[]
  }
>

@Injectable()
export class FetchTransactionsUseCase {
  constructor(
    private transactionsRepository: TransactionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    coupleId,
    page,
    limit,
    type,
    category,
    startDate,
    endDate,
    userId,
  }: FetchTransactionsUseCaseRequest): Promise<FetchTransactionsUseCaseResponse> {
    if (!userId) {
      const transactions = await this.transactionsRepository.findManyByCoupleId(
        coupleId,
        { type, category, startDate, endDate, page, limit },
      )
      return right({ transactions })
    }

    const user = await this.usersRepository.findById(userId)

    if (!user || user.coupleId.toString() !== coupleId) {
      return left(new ResourceNotFoundError())
    }

    const transactions = await this.transactionsRepository.findManyByCoupleId(
      coupleId,
      {
        type,
        category,
        startDate,
        endDate,
        page,
        limit,
        userId: user.id.toString(),
      },
    )
    return right({ transactions })
  }
}
