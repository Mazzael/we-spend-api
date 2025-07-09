import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { CreateUserController } from './create-user.controller'
import { CreateUserUseCase } from '@/domain/application/use-cases/create-user'
import { AuthenticateUserController } from './authenticate-user.controller'
import { AuthenticateUserUseCase } from '@/domain/application/use-cases/authenticate-user'
import { CreateCoupleController } from './create-couple.controller'
import { CreateCoupleUseCase } from '@/domain/application/use-cases/create-couple'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateUserController,
    AuthenticateUserController,
    CreateCoupleController,
  ],
  providers: [CreateUserUseCase, AuthenticateUserUseCase, CreateCoupleUseCase],
})
export class HttpModule {}
