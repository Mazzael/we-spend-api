import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma-service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CoupleFactory } from 'test/factories/make-couple'
import { InvitationFactory } from 'test/factories/make-invitation'
import { UserFactory } from 'test/factories/make-user'

describe('Answer Invite (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let coupleFactory: CoupleFactory
  let invitationFactory: InvitationFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CoupleFactory, InvitationFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)
    coupleFactory = moduleRef.get(CoupleFactory)
    invitationFactory = moduleRef.get(InvitationFactory)
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PATCH] /couple/invite/answer/:token', async () => {
    const inviter = await userFactory.makePrismaUser()
    const user = await userFactory.makePrismaUser()

    const couple = await coupleFactory.makePrismaCouple({
      members: [inviter.id],
    })

    const invite = await invitationFactory.makePrismaInvitation({
      coupleId: couple.id,
      inviteeEmail: user.email,
      inviterUserId: inviter.id,
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .patch(`/couple/invite/answer/${invite.token}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        answer: 'accept',
      })

    expect(response.statusCode).toBe(200)

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
    expect(coupleOnDatabase.User[1].id).toBe(user.id.toString())

    const inviteOnDatabase = await prisma.invitation.findFirst({
      where: {
        coupleId: couple.id.toString(),
      },
    })

    expect(inviteOnDatabase.status).toBe('ACCEPTED')
  })
})
