import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma-service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CoupleFactory } from 'test/factories/make-couple'
import { UserFactory } from 'test/factories/make-user'

describe('Create Transaction (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let coupleFactory: CoupleFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CoupleFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)
    coupleFactory = moduleRef.get(CoupleFactory)
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /couples/:coupldId/transactions', async () => {
    const member1 = await userFactory.makePrismaUser()
    const member2 = await userFactory.makePrismaUser()

    const couple = await coupleFactory.makePrismaCouple({
      members: [member1.id, member2.id],
    })

    const accessToken = jwt.sign({ sub: member1.id.toString() })

    const response = await request(app.getHttpServer())
      .post(`/couples/${couple.id.toString()}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'New Transaction',
        amountInCents: 1500,
        type: 'expense',
        category: 'rent',
        date: '2025-01-01',
        paidBy: [
          {
            userId: member1.id.toString(),
            amountInCents: 1500,
          },
        ],
      })

    expect(response.statusCode).toBe(201)

    const transactionOnDatabase = await prisma.transaction.findFirst({
      where: {
        coupleId: couple.id.toString(),
      },
    })

    expect(transactionOnDatabase).toBeTruthy()

    const transactionPayer = await prisma.transactionPayer.findFirst({
      where: {
        transactionId: transactionOnDatabase?.id,
      },
    })
    expect(transactionPayer?.userId).toBe(member1.id.toString())
  })
})
