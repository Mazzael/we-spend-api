import { UniqueEntityID } from '@/core/unique-entity-id'
import { InvitationProps, Invitation } from '@/domain/entities/invitation'
import { PrismaInvitationMapper } from '@/infra/database/prisma/mappers/prisma-invitations-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma-service'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makeInvitation(
  override: Partial<InvitationProps> = {},
  id?: UniqueEntityID,
) {
  const invitation = Invitation.create(
    {
      coupleId: new UniqueEntityID(faker.string.uuid()),
      inviterUserId: new UniqueEntityID(faker.string.uuid()),
      inviteeEmail: faker.internet.email(),
      token: faker.string.uuid(),
      status: 'pending',
      ...override,
    },
    id,
  )

  return invitation
}

@Injectable()
export class InvitationFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaInvitation(
    data: Partial<InvitationProps> = {},
  ): Promise<Invitation> {
    const invitation = makeInvitation(data)

    await this.prisma.invitation.create({
      data: PrismaInvitationMapper.toPrisma(invitation),
    })

    return invitation
  }
}
