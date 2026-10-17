import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: () => 'TodoRepository',
}));

describe('TodosController', () => {
  let controller: TodosController;
  const mockTodosService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 1, title: 'Test', status: 'TODO', starred: false, order: 0 }),
    create: jest.fn().mockResolvedValue({ id: 1, title: 'Test', status: 'TODO', starred: false, order: 0 }),
    update: jest.fn().mockResolvedValue({ id: 1, title: 'Test', status: 'DONE', starred: true, order: 0 }),
    remove: jest.fn().mockResolvedValue(undefined),
    bulkUpdate: jest.fn().mockResolvedValue([]),
    bulkRemove: jest.fn().mockResolvedValue({ success: true, count: 1 }),
    reorder: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: mockTodosService,
        },
      ],
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
