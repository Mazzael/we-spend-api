import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CoupleFactory } from 'test/factories/make-couple'
import { TransactionFactory } from 'test/factories/make-transaction'
import { UserFactory } from 'test/factories/make-user'

describe('Fetch Transactions (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let coupleFactory: CoupleFactory
  let transactionFactory: TransactionFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CoupleFactory, TransactionFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)
    coupleFactory = moduleRef.get(CoupleFactory)
    transactionFactory = moduleRef.get(TransactionFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /couples/:coupldId/transactions', async () => {
    const user = await userFactory.makePrismaUser()
    const member2 = await userFactory.makePrismaUser()

    const couple = await coupleFactory.makePrismaCouple({
      members: [user.id, member2.id],
    })

    await transactionFactory.makePrismaTransaction({
      paidBy: [
        {
          userId: user.id,
          amountInCents: 500,
        },
      ],
      amountInCents: 500,
      coupleId: couple.id,
    })

    await transactionFactory.makePrismaTransaction({
      paidBy: [
        {
          userId: user.id,
          amountInCents: 500,
        },
        {
          userId: member2.id,
          amountInCents: 700,
        },
      ],
      amountInCents: 1200,
      coupleId: couple.id,
    })

    await transactionFactory.makePrismaTransaction({
      paidBy: [
        {
          userId: user.id,
          amountInCents: 600,
        },
        {
          userId: member2.id,
          amountInCents: 300,
        },
      ],
      amountInCents: 900,
      coupleId: couple.id,
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .get(`/couples/${couple.id.toString()}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.body.transactions).toHaveLength(3)
    expect(response.body).toEqual({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          props: expect.objectContaining({
            amountInCents: 500,
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            amountInCents: 1200,
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            amountInCents: 900,
          }),
        }),
      ]),
    })
  })

  test('[GET] /couples/:coupldId/transactions?page=1&limit=3&startDate=2025-01-01', async () => {
    const user = await userFactory.makePrismaUser()
    const member2 = await userFactory.makePrismaUser()

    const couple = await coupleFactory.makePrismaCouple({
      members: [user.id, member2.id],
    })

    for (let i = 0; i < 10; i++) {
      await transactionFactory.makePrismaTransaction({
        paidBy: [
          {
            userId: user.id,
            amountInCents: 100,
          },
        ],
        coupleId: couple.id,
        date: new Date('2024-12-31'),
      })
    }

    await transactionFactory.makePrismaTransaction({
      paidBy: [
        {
          userId: user.id,
          amountInCents: 500,
        },
      ],
      amountInCents: 500,
      coupleId: couple.id,
      date: new Date('2025-07-13'),
    })

    await transactionFactory.makePrismaTransaction({
      paidBy: [
        {
          userId: user.id,
          amountInCents: 500,
        },
        {
          userId: member2.id,
          amountInCents: 700,
        },
      ],
      amountInCents: 1200,
      coupleId: couple.id,
      date: new Date('2025-06-07'),
    })

    await transactionFactory.makePrismaTransaction({
      paidBy: [
        {
          userId: user.id,
          amountInCents: 600,
        },
        {
          userId: member2.id,
          amountInCents: 300,
        },
      ],
      amountInCents: 900,
      coupleId: couple.id,
      date: new Date('2025-06-06'),
    })

    await transactionFactory.makePrismaTransaction({
      paidBy: [
        {
          userId: user.id,
          amountInCents: 1000,
        },
        {
          userId: member2.id,
          amountInCents: 2300,
        },
      ],
      amountInCents: 3300,
      coupleId: couple.id,
      date: new Date('2025-05-10'),
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .get(
        `/couples/${couple.id.toString()}/transactions?page=1&limit=3&startDate=2025-01-01`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.body.transactions).toHaveLength(1)
    expect(response.body).toEqual({
      transactions: expect.arrayContaining([
        expect.objectContaining({
          props: expect.objectContaining({
            amountInCents: 3300,
          }),
        }),
      ]),
    })
  })
})
