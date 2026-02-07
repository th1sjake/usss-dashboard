import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.taskType.findMany();
    }

    async create(dto: CreateTaskDto) {
        return this.prisma.taskType.create({ data: dto });
    }

    async update(id: string, dto: Partial<CreateTaskDto>) {
        return this.prisma.taskType.update({ where: { id }, data: dto });
    }

    async delete(id: string) {
        return this.prisma.taskType.delete({ where: { id } });
    }
}
