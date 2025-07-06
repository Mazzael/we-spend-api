import { UseCaseError } from '@/core/errors/use-case-error'

export class InvitationAlreadyAnsweredError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Invitation already answered.')
  }
}
