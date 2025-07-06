import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidInvitationAnswerError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Invalid answer.')
  }
}
