import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma-service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CoupleFactory } from 'test/factories/make-couple'
import { UserFactory } from 'test/factories/make-user'

describe('Invite User To Couple (E2E)', () => {
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

  test('[POST] /couples/invites/:id', async () => {
    const inviter = await userFactory.makePrismaUser()

    await userFactory.makePrismaUser({
      email: 'johndoe2@example.com',
    })

    const couple = await coupleFactory.makePrismaCouple({
      members: [inviter.id],
    })

    const accessToken = jwt.sign({ sub: inviter.id.toString() })

    const response = await request(app.getHttpServer())
      .post(`/couples/invites/${couple.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        inviteeEmail: 'johndoe2@example.com',
      })

    expect(response.statusCode).toBe(201)

    const coupleOnDatabase = await prisma.couple.findFirst({
      where: {
        name: couple.name,
      },
      include: {
        User: true,
      },
    })

    expect(coupleOnDatabase).toBeTruthy()
    expect(coupleOnDatabase.User[0].id).toBe(inviter.id.toString())

    const inviteOnDatabase = await prisma.invitation.findFirst({
      where: {
        coupleId: couple.id.toString(),
      },
    })

    expect(inviteOnDatabase).toBeTruthy()
  })
})
