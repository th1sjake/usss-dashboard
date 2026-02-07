import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscordService {
    private readonly logger = new Logger(DiscordService.name);
    private webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    constructor(private prisma: PrismaService) { }

    async updateLeaderboard() {
        // 1. Get config from DB first
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let config = await this.prisma.discordConfig.findFirst({ where: { id: 1 } });

        let webhookUrl = config?.webhookUrl || this.webhookUrl;
        let messageId = config?.messageId;

        if (!webhookUrl) {
            this.logger.warn('No Discord Webhook URL configured (neither in DB nor Env)');
            return;
        }

        // 2. Fetch data
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const users = await this.prisma.user.findMany({
            include: {
                reports: {
                    where: { status: 'APPROVED' }
                },
                rankLink: true,
                departmentLink: true
            },
        });

        // 3. Calculate points (same logic)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const day = now.getDay() || 7;
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1 - day);
        startOfWeek.setHours(0, 0, 0, 0);

        const leaderboard = users.map(u => {
            const reports = u.reports;
            const pointsDay = reports.filter(r => r.date >= startOfDay).reduce((sum, r) => sum + r.points, 0);
            const pointsWeek = reports.filter(r => r.date >= startOfWeek).reduce((sum, r) => sum + r.points, 0);
            const pointsTotal = reports.reduce((sum, r) => sum + r.points, 0);

            return {
                name: u.nickname,
                staticId: u.staticId,
                rank: u.rankLink ? u.rankLink.name : 'Unk',
                dept: u.departmentLink ? u.departmentLink.name : '-',
                pointsDay,
                pointsWeek,
                pointsTotal
            };
        }).sort((a, b) => b.pointsTotal - a.pointsTotal);

        // 4. Build Embeds        // Pre-calculate max lengths for better alignment (with caps)
        const MAX_NAME = 10;
        const MAX_RANK = 10;
        const MAX_DEPT = 4;
        const MAX_ID = 6;

        const pad = (str: string | number, len: number) => {
            const s = String(str);
            return s.length > len ? s.substring(0, len - 1) + '.' : s.padEnd(len);
        };
        const padNum = (num: number, len: number) => String(num).padStart(len);

        const CHUNK_SIZE = 15; // Fits nicely in one screen
        const embeds: any[] = [];

        if (leaderboard.length === 0) {
            embeds.push({
                title: "🛡️ USSS Agent Leaderboard",
                description: "Данные отсутствуют или еще нет одобренных отчетов.",
                color: 0x2b2d31, // Dark theme
                timestamp: new Date().toISOString(),
                footer: { text: "Majestic RP USSS • Automatic Update" }
            });
        } else {
            for (let i = 0; i < leaderboard.length; i += CHUNK_SIZE) {
                const chunk = leaderboard.slice(i, i + CHUNK_SIZE);

                // Header line
                // #   NAME      ID     RANK       DEPT DAY  WK   TOT
                const header = `${pad("#", 3)} ${pad("NAME", MAX_NAME)} ${pad("ID", MAX_ID)} ${pad("RANK", MAX_RANK)} ${pad("DEPT", MAX_DEPT)} ${pad("DAY", 4)} ${pad("WK", 4)} ${pad("TOT", 5)}`;
                const divider = "─".repeat(header.length);

                const rows = chunk.map((u, idx) => {
                    const pos = i + idx + 1;
                    let posStr = String(pos) + ".";

                    // Simple medal indicators
                    if (pos === 1) posStr = "1.🥇";
                    if (pos === 2) posStr = "2.🥈";
                    if (pos === 3) posStr = "3.🥉";

                    // Remove # from staticId for display if needed or keep it short
                    // u.staticId includes # usually? If so, truncate or keep.
                    // Assuming staticId is like "123456" or "#123456". Let's just output it.
                    // If DB stores "#1", pad("#"+u.staticId) -> "##1" which is weird. 
                    // Let's assume u.staticId contains # if user entered it.
                    // Actually, looking at seed, staticId: '#1'.
                    // So we should just use u.staticId directly.

                    return `${pad(posStr, 3)} ${pad(u.name, MAX_NAME)} ${pad(u.staticId, MAX_ID)} ${pad(u.rank, MAX_RANK)} ${pad(u.dept, MAX_DEPT)} ${padNum(u.pointsDay, 4)} ${padNum(u.pointsWeek, 4)} ${padNum(u.pointsTotal, 5)}`;
                }).join("\n");

                const description = "```text\n" + header + "\n" + divider + "\n" + rows + "\n```";

                embeds.push({
                    title: i === 0 ? "🛡️ USSS Agent Leaderboard" : undefined,
                    description: description,
                    color: 0x2b2d31, // Dark clean look
                    timestamp: i === 0 ? new Date().toISOString() : undefined,
                    footer: { text: `Страница ${Math.floor(i / CHUNK_SIZE) + 1} из ${Math.ceil(leaderboard.length / CHUNK_SIZE)} • Обновлено` }
                });
            }
        }

        // Cap embeds at 10
        if (embeds.length > 10) {
            embeds.length = 10;
        }

        const body = { embeds };

        // 5. Send or Update
        let sent = false;

        if (messageId) {
            try {
                // If we have a message ID, try to edit it
                const res = await fetch(`${webhookUrl}/messages/${messageId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    sent = true;
                    this.logger.log(`Updated Discord message ${messageId}`);
                } else {
                    this.logger.warn(`Failed to update Discord message: ${res.status} ${res.statusText}`);
                    if (res.status === 404) {
                        // Message deleted, clear it so we create a new one next time (or now)
                        messageId = undefined;
                        await this.prisma.discordConfig.update({ where: { id: 1 }, data: { messageId: null } });
                    }
                }
            } catch (e) {
                this.logger.error("Error updating discord message", e);
            }
        }

        if (!sent && !messageId) {
            try {
                // Create new message
                const res = await fetch(`${webhookUrl}?wait=true`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    const data: any = await res.json();
                    if (data.id) {
                        this.logger.log(`Created new Discord message ${data.id}`);
                        await this.prisma.discordConfig.upsert({
                            where: { id: 1 },
                            update: { messageId: data.id, webhookUrl: webhookUrl },
                            create: { id: 1, messageId: data.id, webhookUrl: webhookUrl }
                        });
                    }
                } else {
                    this.logger.error(`Failed to create Discord message: ${res.status} ${res.statusText}`);
                }
            } catch (e) {
                this.logger.error("Error sending discord message", e);
            }
        }
    }
}
