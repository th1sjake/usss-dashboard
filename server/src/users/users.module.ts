import { Module, Global } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { RanksController } from './ranks.controller';
import { DepartmentsController } from './departments.controller';

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [UsersController, RanksController, DepartmentsController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
