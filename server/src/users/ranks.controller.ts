import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ranks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RanksController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.prisma.rank.findMany({ orderBy: { weight: 'asc' } });
    }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() data: { name: string; weight: number }) {
        return this.prisma.rank.create({
            data: {
                name: data.name,
                weight: Number(data.weight)
            }
        });
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() data: { name?: string; weight?: number }) {
        return this.prisma.rank.update({
            where: { id: Number(id) },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.weight !== undefined && { weight: Number(data.weight) })
            }
        });
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.prisma.rank.delete({ where: { id: Number(id) } });
    }
}
