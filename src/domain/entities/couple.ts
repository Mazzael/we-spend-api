import { Optional } from '@/core/types/optional'
import { Entity } from './base-entity'
import { UniqueEntityID } from '@/core/unique-entity-id'

export interface CoupleProps {
  name: string
  members: UniqueEntityID[]
  createdAt: Date
  updatedAt?: Date | null
}

export class Couple extends Entity<CoupleProps> {
  get name() {
    return this.props.name
  }

  get members() {
    return this.props.members
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  addMember(userId: UniqueEntityID) {
    if (!this.props.members.includes(userId)) {
      this.props.members.push(userId)
      this.touch()
    }
  }

  removeMember(userId: UniqueEntityID) {
    this.props.members = this.props.members.filter((id) => !id.equals(userId))
    this.touch()
  }

  isMember(userId: UniqueEntityID) {
    return this.props.members.some((id) => id.equals(userId))
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  changeName(newName: string) {
    this.props.name = newName
    this.touch()
  }

  static create(
    props: Optional<CoupleProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const couple = new Couple(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return couple
  }
}
