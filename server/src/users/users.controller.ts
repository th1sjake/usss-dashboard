import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly prisma: PrismaService
    ) { }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.usersService.findAll({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            orderBy: { rankLink: { weight: 'desc' } }
        });
    }

    @Get('ranks')
    async getRanks() {
        return this.prisma.rank.findMany({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            orderBy: { weight: 'asc' }
        });
    }

    @Get('me')
    async getMe(@Request() req) {
        return this.usersService.findOne({ id: req.user.userId });
    }

    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body() data: any) {
        const user = req.user;
        // Allow if admin or if updating self
        if (user.role !== Role.ADMIN && user.userId !== id) {
            throw new ForbiddenException('Вы можете редактировать только свой профиль');
        }

        const updateData: any = {
            nickname: data.nickname,
            departmentId: data.departmentId ? Number(data.departmentId) : undefined,
            rankId: data.rankId ? Number(data.rankId) : undefined,
        };

        if (data.password) {
            updateData.password = data.password;
        }

        // Only admins can change Role or StaticID
        if (user.role === Role.ADMIN) {
            if (data.role) updateData.role = data.role;
            if (data.staticId) updateData.staticId = data.staticId;
        }

        return this.usersService.updateUser({
            where: { id },
            data: updateData
        });
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.deleteUser({ id });
    }
}
