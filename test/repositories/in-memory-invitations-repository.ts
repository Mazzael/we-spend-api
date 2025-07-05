import { Invitation } from '@/domain/entities/invitation'
import { InvitationsRepository } from '@/domain/application/repositories/invitations-repository'

export class InMemoryInvitationsRepository implements InvitationsRepository {
  public items: Invitation[] = []

  async findById(id: string) {
    const invitation = this.items.find((item) => item.id.toString() === id)

    if (!invitation) {
      return null
    }

    return invitation
  }

  async findByToken(token: string) {
    const invitation = this.items.find((item) => item.token === token)

    if (!invitation) {
      return null
    }

    return invitation
  }

  async findManyByInviteeEmail(inviteeEmail: string) {
    return this.items.filter((item) => item.inviteeEmail === inviteeEmail)
  }

  async create(invitation: Invitation) {
    this.items.push(invitation)
  }

  async save(invitation: Invitation) {
    const index = this.items.findIndex((item) => item.id.equals(invitation.id))
    if (index >= 0) {
      this.items[index] = invitation
    }
  }

  async delete(invitation: Invitation) {
    this.items = this.items.filter((item) => !item.id.equals(invitation.id))
  }
}
