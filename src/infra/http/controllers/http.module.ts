import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { CreateUserController } from './create-user.controller'
import { CreateUserUseCase } from '@/domain/application/use-cases/create-user'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [CreateUserController],
  providers: [CreateUserUseCase],
})
export class HttpModule {}
