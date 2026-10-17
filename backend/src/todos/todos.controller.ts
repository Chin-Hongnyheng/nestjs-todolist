import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { BulkUpdateTodoDto } from './dto/bulk-update-todo.dto';
import { BulkDeleteTodoDto } from './dto/bulk-delete-todo.dto';
import { ReorderTodosDto } from './dto/reorder-todos.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

@Controller(['api/todos', 'todos'])
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  findAll(@Query() query: QueryTodoDto) {
    return this.todos.findAll(query);
  }

  @Patch('bulk')
  bulkUpdate(@Body() dto: BulkUpdateTodoDto) {
    return this.todos.bulkUpdate(dto);
  }

  @Delete('bulk')
  @HttpCode(204)
  async bulkRemove(@Body() dto: BulkDeleteTodoDto) {
    await this.todos.bulkRemove(dto.ids);
  }

  @Patch('order')
  reorder(@Body() dto: ReorderTodosDto) {
    return this.todos.reorder(dto.ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todos.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTodoDto) {
    return this.todos.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTodoDto) {
    return this.todos.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.todos.remove(id);
  }
}

