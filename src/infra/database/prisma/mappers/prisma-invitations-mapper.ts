import { UniqueEntityID } from '@/core/unique-entity-id'
import { Invitation, InvitationStatus } from '@/domain/entities/invitation'
import {
  InvitationStatus as PrismaInvitationStatus,
  Invitation as PrismaInvitation,
} from '@prisma/client'

export class PrismaInvitationMapper {
  static toDomain(raw: PrismaInvitation): Invitation {
    return Invitation.create(
      {
        coupleId: new UniqueEntityID(raw.coupleId),
        inviteeEmail: raw.inviteeEmail,
        inviterUserId: new UniqueEntityID(raw.inviterUserId),
        status: passPrismaStatusToDomain(raw.status),
        token: raw.token,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(invitation: Invitation): PrismaInvitation {
    return {
      id: invitation.id.toString(),
      coupleId: invitation.coupleId.toString(),
      inviterUserId: invitation.inviterUserId.toString(),
      inviteeEmail: invitation.inviteeEmail,
      token: invitation.token,
      status: passDomainStatusToPrisma(invitation.status),
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt ?? new Date(),
    }
  }
}

function passPrismaStatusToDomain(
  status: PrismaInvitationStatus,
): InvitationStatus {
  switch (status) {
    case 'PENDING':
      return 'pending'
    case 'ACCEPTED':
      return 'accepted'
    case 'REJECTED':
      return 'rejected'
    default:
      throw new Error(`Unknown status: ${status}`)
  }
}

function passDomainStatusToPrisma(
  status: InvitationStatus,
): PrismaInvitationStatus {
  switch (status) {
    case 'pending':
      return 'PENDING'
    case 'accepted':
      return 'ACCEPTED'
    case 'rejected':
      return 'REJECTED'
    default:
      throw new Error(`Unknown status: ${status}`)
  }
}
