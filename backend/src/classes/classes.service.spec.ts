import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassEntity } from './class.entity';


const mockClasses: ClassEntity[] = [
 {
    "id": "8f18b27c-dfa7-4f5d-be97-ae72e712e001",
    "name": "Essentials Jiu-Jitsu",
    "instructorName": "Ciaran Brohan",
    "day": "Tuesday",
    "time": "19:45",
    "repeat": "weekly",
    "duration": 60,
    "capacity": 20
  }, 
  {
    "id": "643e173b-9374-4f48-941e-fb2ca812478a",
    "name": "Essentials Jiu-Jitsu",
    "instructorName": "Ciaran Brohan",
    "day": "Wednesday",
    "time": "12:00",
    "repeat": "weekly",
    "duration": 60,
    "capacity": 20
  }
];

const mockClassRepo = {
  find:  jest.fn().mockResolvedValue(mockClasses),
  count: jest.fn().mockResolvedValue(2),
  save:  jest.fn(),
};

describe('ClassesService', () => {
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: getRepositoryToken(ClassEntity), useValue: mockClassRepo },
      ],
    }).compile();
    service = module.get<ClassesService>(ClassesService);
  });

  it('returns all classes from the database', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(2);
    expect(mockClassRepo.find).toHaveBeenCalledTimes(1);
  });

  it('each class has required fields', async () => {
    const result = await service.findAll();
    result.forEach(c => {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('instructorName');
      expect(c).toHaveProperty('time');
      expect(c).toHaveProperty('duration');
      expect(c).toHaveProperty('capacity');
    });
  });
});