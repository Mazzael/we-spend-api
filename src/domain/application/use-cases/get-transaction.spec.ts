import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { makeTransaction } from 'test/factories/make-transaction'
import { GetTransactionUseCase } from './get-transaction'
import { ResourceNotFoundError } from './errors/resource-not-found'

describe('Get Transaction', () => {
  let inMemoryTransactionsRepository: InMemoryTransactionsRepository

  let sut: GetTransactionUseCase

  beforeEach(() => {
    inMemoryTransactionsRepository = new InMemoryTransactionsRepository()

    sut = new GetTransactionUseCase(inMemoryTransactionsRepository)
  })

  it('should get a transaction', async () => {
    const transaction = makeTransaction({})

    await inMemoryTransactionsRepository.create(transaction)

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction).toEqual(transaction)
    }
  })

  it('should not get a transaction with wrong id', async () => {
    const result = await sut.execute({
      transactionId: 'wrong-id',
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
