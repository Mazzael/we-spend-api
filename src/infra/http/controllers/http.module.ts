import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { CreateUserController } from './create-user.controller'
import { CreateUserUseCase } from '@/domain/application/use-cases/create-user'
import { AuthenticateUserController } from './authenticate-user.controller'
import { AuthenticateUserUseCase } from '@/domain/application/use-cases/authenticate-user'
import { CreateCoupleController } from './create-couple.controller'
import { CreateCoupleUseCase } from '@/domain/application/use-cases/create-couple'
import { InviteUserToCoupleController } from './invite-user-to-couple.controller'
import { InviteUserToCoupleUseCase } from '@/domain/application/use-cases/invite-user-to-couple'
import { AnswerInviteController } from './answer-invite.controller'
import { AnswerInvitationUseCase } from '@/domain/application/use-cases/answer-invite'
import { CreateTransactionController } from './create-transaction.controller'
import { CreateTransactionUseCase } from '@/domain/application/use-cases/create-transaction'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateUserController,
    AuthenticateUserController,
    CreateCoupleController,
    InviteUserToCoupleController,
    AnswerInviteController,
    CreateTransactionController,
  ],
  providers: [
    CreateUserUseCase,
    AuthenticateUserUseCase,
    CreateCoupleUseCase,
    InviteUserToCoupleUseCase,
    AnswerInvitationUseCase,
    CreateTransactionUseCase,
  ],
})
export class HttpModule {}
