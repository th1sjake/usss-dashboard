import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('discord')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscordController {
    constructor(
        private readonly discordService: DiscordService,
        private readonly prisma: PrismaService
    ) { }

    @Get('config')
    @Roles(Role.ADMIN)
    async getConfig() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.prisma.discordConfig.findFirst({ where: { id: 1 } }) || {};
    }

    @Post('config')
    @Roles(Role.ADMIN)
    async updateConfig(@Body() body: { webhookUrl: string; messageId?: string }) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.prisma.discordConfig.upsert({
            where: { id: 1 },
            update: { webhookUrl: body.webhookUrl, messageId: body.messageId },
            create: { id: 1, webhookUrl: body.webhookUrl, messageId: body.messageId }
        });
    }

    @Post('update-leaderboard')
    @Roles(Role.ADMIN)
    async forceUpdate() {
        await this.discordService.updateLeaderboard();
        return { success: true };
    }
}
