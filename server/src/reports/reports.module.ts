import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
    imports: [PrismaModule, DiscordModule],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
