import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { BulkUpdateTodoDto } from './dto/bulk-update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

@Injectable()
export class TodosService implements OnModuleInit {
  constructor(
    @InjectRepository(Todo)
    private readonly repo: Repository<Todo>,
  ) {}

  async onModuleInit() {
    try {
      await this.repo.query(`
        ALTER TABLE "todo" ADD COLUMN IF NOT EXISTS "starred" boolean NOT NULL DEFAULT false;
        ALTER TABLE "todo" ADD COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0;
      `);
    } catch (err: unknown) {
      // Table might not exist yet before migrations or in unit tests
    }
  }

  findAll(query?: QueryTodoDto) {
    const where: FindOptionsWhere<Todo> = {};

    if (query?.status) {
      where.status = query.status.toUpperCase();
    }

    if (query?.q) {
      where.title = ILike(`%${query.q}%`);
    }

    return this.repo.find({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: { order: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const todo = await this.repo.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async create(dto: CreateTodoDto) {
    const normalizedDto = {
      ...dto,
      status: dto.status ? dto.status.toUpperCase() : 'TODO',
      starred: dto.starred ?? false,
      order: dto.order ?? (await this.repo.count()),
    };
    const todo = this.repo.create(normalizedDto);
    return this.repo.save(todo);
  }

  async update(id: number, dto: UpdateTodoDto) {
    const todo = await this.findOne(id);
    const updates: Partial<Todo> = { ...dto };
    if (dto.status) {
      updates.status = dto.status.toUpperCase();
    }
    Object.assign(todo, updates);
    return this.repo.save(todo);
  }

  async remove(id: number) {
    const todo = await this.findOne(id);
    await this.repo.remove(todo);
  }

  async bulkUpdate(dto: BulkUpdateTodoDto) {
    if (!dto.ids || dto.ids.length === 0) {
      return [];
    }

    if (dto.action === 'delete') {
      await this.bulkRemove(dto.ids);
      return { success: true, count: dto.ids.length, deleted: true };
    }

    const updates: Partial<Todo> = {};
    if (dto.status) {
      updates.status = dto.status.toUpperCase();
    }
    if (dto.starred !== undefined) {
      updates.starred = dto.starred;
    }

    if (Object.keys(updates).length > 0) {
      await this.repo.update({ id: In(dto.ids) }, updates);
    }

    return this.repo.find({
      where: { id: In(dto.ids) },
      order: { order: 'ASC', id: 'ASC' },
    });
  }

  async bulkRemove(ids: number[]) {
    if (!ids || ids.length === 0) {
      return { success: true, count: 0 };
    }
    await this.repo.delete({ id: In(ids) });
    return { success: true, count: ids.length };
  }

  async reorder(ids: number[]) {
    if (!ids || ids.length === 0) {
      return [];
    }
    await Promise.all(
      ids.map((id, index) => this.repo.update(id, { order: index })),
    );
    return this.repo.find({
      where: { id: In(ids) },
      order: { order: 'ASC', id: 'ASC' },
    });
  }
}

