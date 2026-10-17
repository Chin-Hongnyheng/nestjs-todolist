import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { Repository } from 'typeorm';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: () => 'TodoRepository',
}));

describe('TodosService Bonus Features', () => {
  let service: TodosService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      query: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: Repository,
          useValue: mockRepo,
        },
        {
          provide: 'TodoRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('should filter by status (GET /api/todos?status=DONE)', async () => {
    mockRepo.find.mockResolvedValue([{ id: 1, title: 'Test', status: 'DONE' }]);
    const result = await service.findAll({ status: 'DONE' });
    expect(mockRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'DONE' }),
      }),
    );
    expect(result).toHaveLength(1);
  });

  it('should search by title (GET /api/todos?q=milk)', async () => {
    mockRepo.find.mockResolvedValue([{ id: 2, title: 'Buy milk', status: 'TODO' }]);
    const result = await service.findAll({ q: 'milk' });
    expect(mockRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ title: expect.anything() }),
      }),
    );
    expect(result).toHaveLength(1);
  });

  it('should handle drag-and-drop order (PATCH /api/todos/order { ids })', async () => {
    mockRepo.update.mockResolvedValue({ affected: 1 });
    mockRepo.find.mockResolvedValue([
      { id: 2, title: 'Second', order: 0 },
      { id: 1, title: 'First', order: 1 },
    ]);
    const result = await service.reorder([2, 1]);
    expect(mockRepo.update).toHaveBeenCalledWith(2, { order: 0 });
    expect(mockRepo.update).toHaveBeenCalledWith(1, { order: 1 });
    expect(result).toHaveLength(2);
  });

  it('should update priority/starred (PATCH /api/todos/:id { starred })', async () => {
    const existing = { id: 1, title: 'Test', status: 'TODO', starred: false };
    mockRepo.findOneBy.mockResolvedValue(existing);
    mockRepo.save.mockImplementation((todo) => Promise.resolve(todo));

    const updated = await service.update(1, { starred: true });
    expect(updated.starred).toBe(true);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should bulk update status (PATCH /api/todos/bulk { ids, status })', async () => {
    mockRepo.update.mockResolvedValue({ affected: 2 });
    mockRepo.find.mockResolvedValue([
      { id: 1, status: 'DONE' },
      { id: 2, status: 'DONE' },
    ]);
    const result = await service.bulkUpdate({ ids: [1, 2], status: 'DONE' });
    expect(mockRepo.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: 'DONE' }),
    );
    expect(result).toHaveLength(2);
  });

  it('should bulk delete (DELETE /api/todos/bulk { ids })', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 2 });
    const result = await service.bulkRemove([1, 2]);
    expect(mockRepo.delete).toHaveBeenCalledWith(expect.anything());
    expect(result.count).toBe(2);
  });
});
