import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { CouplesRepository } from '../repositories/couples-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { UniqueEntityID } from '@/core/unique-entity-id'
import { Transaction } from '@/domain/entities/transaction'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { InvalidTransactionError } from './errors/invalid-transaction-error'

interface CreateTransactionUseCaseRequest {
  coupleId: string
  description: string
  amountInCents: number
  type: 'income' | 'expense'
  category: string
  date: Date
  paidBy: {
    userId: string
    amountInCents: number
  }[]
}

type CreateTransactionUseCaseResponse = Either<
  ResourceNotFoundError | InvalidTransactionError,
  { transaction: Transaction }
>

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private couplesRepository: CouplesRepository,
    private transactionsRepository: TransactionsRepository,
  ) {}

  async execute({
    coupleId,
    description,
    amountInCents,
    type,
    category,
    date,
    paidBy,
  }: CreateTransactionUseCaseRequest): Promise<CreateTransactionUseCaseResponse> {
    const couple = await this.couplesRepository.findById(coupleId)

    if (!couple) {
      return left(new ResourceNotFoundError())
    }

    const memberIds = couple.members.map((member) => member.toString())

    const areAllPayersValid = paidBy.every((payer) =>
      memberIds.includes(payer.userId),
    )

    if (!areAllPayersValid) {
      return left(
        new InvalidTransactionError(
          'One or more payers are not part of the couple',
        ),
      )
    }

    const transaction = Transaction.create({
      coupleId: new UniqueEntityID(coupleId),
      description,
      amountInCents,
      type,
      category,
      date,
      paidBy: paidBy.map((payer) => ({
        userId: new UniqueEntityID(payer.userId),
        amountInCents: payer.amountInCents,
      })),
    })

    if (!transaction.isTotalPaidValid()) {
      return left(
        new InvalidTransactionError(
          'Total paid does not match the transaction amount',
        ),
      )
    }

    await this.transactionsRepository.create(transaction)

    return right({ transaction })
  }
}
