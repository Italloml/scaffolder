import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  list() { return this.prisma.category.findMany({ orderBy: { title: 'asc' }, include: { _count: { select: { tasks: true } } } }); }
  create(data: { title: string; description?: string; color?: string }) {
    return this.prisma.category.create({ data: { title: data.title.trim(), description: data.description?.trim() || null, color: data.color || '#2563eb' } });
  }
  async update(id: string, data: { title?: string; description?: string; color?: string }) {
    const found = await this.prisma.category.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Categoria não encontrada.');
    return this.prisma.category.update({ where: { id }, data: { ...(data.title !== undefined ? { title: data.title.trim() } : {}), ...(data.description !== undefined ? { description: data.description.trim() || null } : {}), ...(data.color !== undefined ? { color: data.color } : {}) } });
  }
  async remove(id: string) {
    const found = await this.prisma.category.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Categoria não encontrada.');
    await this.prisma.category.delete({ where: { id } });
  }
}
