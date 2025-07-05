import { Invitation } from '@/domain/entities/invitation'

export abstract class InvitationsRepository {
  abstract findById(id: string): Promise<Invitation | null>
  abstract findByToken(token: string): Promise<Invitation | null>
  abstract findManyByInviteeEmail(inviteeEmail: string): Promise<Invitation[]>
  abstract create(invitation: Invitation): Promise<void>
  abstract save(invitation: Invitation): Promise<void>
  abstract delete(invitation: Invitation): Promise<void>
}
