import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma-service'
import { UsersRepository } from '@/domain/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'
import { CouplesRepository } from '@/domain/application/repositories/couples-repository'
import { PrismaCouplesRepository } from './prisma/repositories/prisma-couples-repository'
import { InvitationsRepository } from '@/domain/application/repositories/invitations-repository'
import { PrismaInvitationsRepository } from './prisma/repositories/prisma-invitations-repository'
import { TransactionsRepository } from '@/domain/application/repositories/transactions-repository'
import { PrismaTransactionsRepository } from './prisma/repositories/prisma-transactions-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: CouplesRepository,
      useClass: PrismaCouplesRepository,
    },
    {
      provide: InvitationsRepository,
      useClass: PrismaInvitationsRepository,
    },
    {
      provide: TransactionsRepository,
      useClass: PrismaTransactionsRepository,
    },
  ],
  exports: [
    PrismaService,
    UsersRepository,
    CouplesRepository,
    InvitationsRepository,
    TransactionsRepository,
  ],
})
export class DatabaseModule {}
