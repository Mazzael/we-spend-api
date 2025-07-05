import { UniqueEntityID } from '@/core/unique-entity-id'
import { CoupleProps, Couple } from '@/domain/entities/couple'
import { faker } from '@faker-js/faker'

export function makeCouple(
  override: Partial<CoupleProps> = {},
  id?: UniqueEntityID,
) {
  const couple = Couple.create(
    {
      name: faker.person.fullName(),
      members: [
        new UniqueEntityID(faker.string.uuid()),
        new UniqueEntityID(faker.string.uuid()),
      ],
      createdAt: new Date(),
      updatedAt: null,
      ...override,
    },
    id,
  )

  return couple
}
