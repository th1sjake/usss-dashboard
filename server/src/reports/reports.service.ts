import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordService } from '../discord/discord.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private discordService: DiscordService,
    ) { }

    async create(userId: string, dto: CreateReportDto) {
        const task = await this.prisma.taskType.findUnique({ where: { id: dto.typeId } });
        if (!task) throw new NotFoundException('Task type not found');

        const report = await this.prisma.report.create({
            data: {
                userId,
                typeId: dto.typeId,
                proofUrl: dto.proofUrl,
                date: new Date(dto.date),
                points: task.points,
                status: 'PENDING',
            },
            include: { type: true },
        });

        return report;
    }

    async findAll() {
        return this.prisma.report.findMany({
            include: { user: { include: { rankLink: true } }, type: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findMy(userId: string) {
        return this.prisma.report.findMany({
            where: { userId },
            include: { type: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: string, userId: string, role: string, dto: Partial<CreateReportDto>) {
        const report = await this.prisma.report.findUnique({ where: { id } });
        if (!report) throw new NotFoundException('Report not found');

        if (role !== 'ADMIN' && report.userId !== userId) {
            throw new NotFoundException('Report not found'); // Hide existence
        }

        if (role !== 'ADMIN' && report.status !== 'PENDING') {
            throw new ForbiddenException('Cannot edit processed report');
        }

        let points = report.points;
        if (dto.typeId && dto.typeId !== report.typeId) {
            const task = await this.prisma.taskType.findUnique({ where: { id: dto.typeId } });
            if (task) points = task.points;
        }

        const updated = await this.prisma.report.update({
            where: { id },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
                points,
            },
        });

        // If status or points changed, update leaderboard
        if (report.status === 'APPROVED') {
            await this.discordService.updateLeaderboard();
        }

        return updated;
    }

    async updateStatus(id: string, status: ReportStatus) {
        const report = await this.prisma.report.update({
            where: { id },
            data: { status },
        });

        await this.discordService.updateLeaderboard();
        return report;
    }

    async getLeaderboardData() {
        const users = await this.prisma.user.findMany({
            include: {
                reports: { where: { status: 'APPROVED' } },
                rankLink: true
            },
        });

        return users.map(u => ({
            name: u.nickname,
            staticId: u.staticId,
            rank: u.rankLink ? u.rankLink.name : 'Unknown',
            points: u.reports.reduce((sum, r) => sum + r.points, 0)
        })).sort((a, b) => b.points - a.points);
    }
    async getDashboardStats(userId: string, weekOffset: number = 0) {
        const now = new Date();
        // Adjust "now" by weekOffset (subtract 7 days * offset)
        now.setDate(now.getDate() - (weekOffset * 7));

        const day = now.getDay() || 7; // Mon=1, Sun=7
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - day + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7); // Start of next week

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Today's start (only relevant if offset=0)

        const reports = await this.prisma.report.findMany({
            where: { userId },
            orderBy: { date: 'asc' }
        });

        const approved = reports.filter(r => r.status === 'APPROVED');
        const pending = reports.filter(r => r.status === 'PENDING').length;
        const rejected = reports.filter(r => r.status === 'REJECTED').length;

        const pointsTotal = approved.reduce((acc, r) => acc + r.points, 0);

        // Points for the specific week range
        const pointsWeek = approved
            .filter(r => r.date >= startOfWeek && r.date < endOfWeek)
            .reduce((acc, r) => acc + r.points, 0);

        // Points for today (only valid if offset is 0, otherwise 0)
        let pointsDay = 0;
        if (weekOffset === 0) {
            pointsDay = approved.filter(r => r.date >= startOfDay).reduce((acc, r) => acc + r.points, 0);
        }

        // Calculate chart for the specific week (Mon-Sun)
        const chartData: { name: string; points: number }[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const dayPoints = approved
                .filter(r => r.date >= date && r.date < nextDate)
                .reduce((acc, r) => acc + r.points, 0);

            chartData.push({
                name: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
                points: dayPoints
            });
        }

        return {
            pointsDay,
            pointsWeek,
            pointsTotal,
            pending,
            rejected,
            chartData,
            weekStart: startOfWeek.toISOString(),
            weekEnd: endOfWeek.toISOString()
        };
    }

    async getAdminStats() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Get count of pending reports
        const pendingCount = await this.prisma.report.count({ where: { status: 'PENDING' } });

        // Get approved today count
        const approvedToday = await this.prisma.report.count({
            where: {
                status: 'APPROVED',
                updatedAt: { gte: startOfDay } // Note: using updatedAt for approval time approximation
            }
        });

        // Get active agents count (who submitted report in last 7 days)
        const date7DaysAgo = new Date();
        date7DaysAgo.setDate(date7DaysAgo.getDate() - 7);
        const activeAgents = await this.prisma.report.groupBy({
            by: ['userId'],
            where: { date: { gte: date7DaysAgo } },
        });

        // Chart Data (Last 7 Days - Organization Total Points)
        const reports7Days = await this.prisma.report.findMany({
            where: {
                status: 'APPROVED',
                date: { gte: date7DaysAgo }
            }
        });

        const chartData: { name: string; points: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const dayPoints = reports7Days
                .filter(r => r.date >= date && r.date < nextDate)
                .reduce((acc, r) => acc + r.points, 0);

            chartData.push({
                name: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
                points: dayPoints
            });
        }

        return {
            pendingCount,
            approvedToday,
            activeAgents: activeAgents.length,
            chartData
        };
    }
}
