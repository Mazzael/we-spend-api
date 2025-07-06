import { Optional } from '@/core/types/optional'
import { Entity } from './base-entity'
import { UniqueEntityID } from '@/core/unique-entity-id'

export type InvitationStatus = 'pending' | 'accepted' | 'rejected'

export interface InvitationProps {
  coupleId: UniqueEntityID
  inviterUserId: UniqueEntityID
  inviteeEmail: string
  token: string
  status: InvitationStatus
  createdAt: Date
  updatedAt?: Date | null
}

export class Invitation extends Entity<InvitationProps> {
  get coupleId() {
    return this.props.coupleId
  }

  get inviterUserId() {
    return this.props.inviterUserId
  }

  get inviteeEmail() {
    return this.props.inviteeEmail
  }

  get token() {
    return this.props.token
  }

  get status() {
    return this.props.status
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  updateStatus(status: InvitationStatus) {
    this.props.status = status
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<InvitationProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Invitation(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
