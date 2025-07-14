import { UniqueEntityID } from '@/core/unique-entity-id'
import { TransactionProps, Transaction } from '@/domain/entities/transaction'
import { PrismaTransactionMapper } from '@/infra/database/prisma/mappers/prisma-transaction-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma-service'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makeTransaction(
  override: Partial<TransactionProps> = {},
  id?: UniqueEntityID,
) {
  const transaction = Transaction.create(
    {
      coupleId: new UniqueEntityID(faker.string.uuid()),
      description: faker.lorem.sentence(),
      amountInCents: faker.number.int({ min: 100, max: 100000 }),
      type: faker.helpers.arrayElement(['income', 'expense']),
      category: faker.helpers.arrayElement([
        'food',
        'transport',
        'entertainment',
        'bills',
        'health',
        'other',
      ]),
      date: faker.date.past(),
      paidBy: [
        {
          userId: new UniqueEntityID(faker.string.uuid()),
          amountInCents: faker.number.int({ min: 100, max: 100000 }),
        },
        {
          userId: new UniqueEntityID(faker.string.uuid()),
          amountInCents: faker.number.int({ min: 100, max: 100000 }),
        },
      ],
      createdAt: new Date(),
      updatedAt: null,
      ...override,
    },
    id,
  )

  return transaction
}

@Injectable()
export class TransactionFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaTransaction(
    data: Partial<TransactionProps> = {},
  ): Promise<Transaction> {
    const transaction = makeTransaction(data)

    await this.prisma.transaction.create({
      data: PrismaTransactionMapper.toPrisma(transaction),
    })

    const payers = transaction.paidBy

    await Promise.all(
      payers.map(async (payer) => {
        await this.prisma.transactionPayer.create({
          data: {
            amountInCents: payer.amountInCents,
            userId: payer.userId.toString(),
            transactionId: transaction.id.toString(),
          },
        })
      }),
    )

    return transaction
  }
}
