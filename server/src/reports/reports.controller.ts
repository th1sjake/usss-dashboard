import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReportStatus, Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post()
    create(@Request() req, @Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(req.user.userId, createReportDto);
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.reportsService.findAll();
    }

    @Get('my')
    findMy(@Request() req) {
        return this.reportsService.findMy(req.user.userId);
    }

    @Get('stats')
    getStats(@Request() req, @Query('offset') offset?: string) {
        return this.reportsService.getDashboardStats(req.user.userId, offset ? parseInt(offset) : 0);
    }

    @Get('admin-stats')
    @Roles(Role.ADMIN)
    getAdminStats() {
        return this.reportsService.getAdminStats();
    }

    @Get('stats/:userId')
    @Roles(Role.ADMIN)
    getUserStats(@Param('userId') userId: string, @Query('offset') offset?: string) {
        return this.reportsService.getDashboardStats(userId, offset ? parseInt(offset) : 0);
    }

    @Get('leaderboard')
    getLeaderboard() {
        return this.reportsService.getLeaderboardData();
    }


    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateReportDto>) {
        // Users can edit their own report if pending? Or only admin?
        // Let's allow update if same user or admin. Ideally separate service logic.
        return this.reportsService.update(id, req.user.userId, req.user.role, dto);
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN)
    updateStatus(@Param('id') id: string, @Body('status') status: ReportStatus) {
        return this.reportsService.updateStatus(id, status);
    }
}
