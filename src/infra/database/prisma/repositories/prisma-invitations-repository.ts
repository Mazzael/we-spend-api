import { InvitationsRepository } from '@/domain/application/repositories/invitations-repository'
import { Invitation } from '@/domain/entities/invitation'
import { PrismaInvitationMapper } from '../mappers/prisma-invitations-mapper'
import { PrismaService } from '../prisma-service'

export class PrismaInvitationsRepository implements InvitationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(invitation: Invitation) {
    const data = PrismaInvitationMapper.toPrisma(invitation)

    await this.prisma.invitation.create({
      data,
    })
  }

  async findById(id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: {
        id,
      },
    })

    if (!invitation) {
      return null
    }

    return PrismaInvitationMapper.toDomain(invitation)
  }

  async findByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: {
        token,
      },
    })

    if (!invitation) {
      return null
    }

    return PrismaInvitationMapper.toDomain(invitation)
  }

  async findManyByInviteeEmail(inviteeEmail: string) {
    const invitations = await this.prisma.invitation.findMany({
      where: {
        inviteeEmail,
      },
    })

    return invitations.map(PrismaInvitationMapper.toDomain)
  }

  async save(invitation: Invitation) {
    const data = PrismaInvitationMapper.toPrisma(invitation)

    await this.prisma.invitation.update({
      where: {
        id: invitation.id.toString(),
      },
      data,
    })
  }

  async delete(invitation: Invitation) {
    await this.prisma.invitation.delete({
      where: {
        id: invitation.id.toString(),
      },
    })
  }
}
