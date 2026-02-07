import { Module, Global } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [DiscordController],
    providers: [DiscordService],
    exports: [DiscordService],
})
export class DiscordModule { }
