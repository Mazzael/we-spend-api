import { UniqueEntityID } from '@/core/unique-entity-id'
import { InvitationProps, Invitation } from '@/domain/entities/invitation'
import { faker } from '@faker-js/faker'

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
