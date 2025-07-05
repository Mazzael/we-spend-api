import { UniqueEntityID } from '@/core/unique-entity-id'
import { UserProps, User } from '@/domain/entities/user'
import { faker } from '@faker-js/faker'

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      coupleId: null,
      createdAt: new Date(),
      updatedAt: null,
      ...override,
    },
    id,
  )

  return user
}
