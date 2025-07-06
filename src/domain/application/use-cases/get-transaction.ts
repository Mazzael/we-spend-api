import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { Transaction } from '@/domain/entities/transaction'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface GetTransactionUseCaseRequest {
  transactionId: string
}

type GetTransactionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    transaction: Transaction
  }
>

@Injectable()
export class GetTransactionUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    transactionId,
  }: GetTransactionUseCaseRequest): Promise<GetTransactionUseCaseResponse> {
    const transaction =
      await this.transactionsRepository.findById(transactionId)

    if (!transaction) {
      return left(new ResourceNotFoundError())
    }

    return right({ transaction })
  }
}
