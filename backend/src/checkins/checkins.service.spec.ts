import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CheckInsService } from './checkins.service';
import { CheckInEntity } from './checkin.entity';

describe('CheckInsService', () => {
  let service: CheckInsService;

  const mockRepo = {
    find:    jest.fn(),
    findOne: jest.fn(),
    save:    jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInsService,
        { provide: getRepositoryToken(CheckInEntity), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<CheckInsService>(CheckInsService);
  });

  it('returns all check-ins from the database', async () => {
    mockRepo.find.mockResolvedValue([{ memberId: 'm1', classId: 'c1', status: 'confirmed' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('creates a check-in when none exists for that member+class', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue({ memberId: 'm1', classId: 'c1', status: 'confirmed', timestamp: new Date().toISOString() });
    const result = await service.create({ memberId: 'm1', classId: 'c1' });
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('confirmed');
  });

  it('returns the existing record without inserting a duplicate', async () => {
    const existing = { memberId: 'm1', classId: 'c1', status: 'confirmed', timestamp: '2026-06-13T09:00:00Z' };
    mockRepo.findOne.mockResolvedValue(existing);
    const result = await service.create({ memberId: 'm1', classId: 'c1' });
    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(result).toEqual(existing);
  });

  it('allows the same member to check in to a different class', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue({ memberId: 'm1', classId: 'c2', status: 'confirmed', timestamp: new Date().toISOString() });
    await service.create({ memberId: 'm1', classId: 'c2' });
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('findOne is called with correct member+class combination', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue({});
    await service.create({ memberId: 'm3', classId: 'c1' });
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { memberId: 'm3', classId: 'c1' },
    });
  });
});