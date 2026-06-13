import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import { MemberEntity } from './member.entity';


const mockMembers: MemberEntity[] = [
  { "id": "cb9cc18d-53cb-4fac-8f16-a13536c327c0", "firstName": "Anna",      "lastName": "Rossi",     "profilePicture": "https://i.pravatar.cc/150?img=1" },
  { "id": "09e25ddb-3022-42d9-a2f0-64696e7341f3", "firstName": "Marco",     "lastName": "Lopez",     "profilePicture": "https://i.pravatar.cc/150?img=2" },
];


const mockMemberRepo = {
    find: jest.fn().mockResolvedValue(mockMembers),
    count: jest.fn().mockResolvedValue(2),
    save:  jest.fn()
}

describe('MembersService', () => { 
    let service: MembersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MembersService,
                {
                    provide: getRepositoryToken(MemberEntity),
                    useValue: mockMemberRepo
                }
            ]
        }).compile();

        service = module.get<MembersService>(MembersService);
    });


    it('returns all members from the database', async () => {
        const result = await service.findAll();
        expect(result).toHaveLength(2);
        expect(mockMemberRepo.find).toHaveBeenCalledTimes(1);
    });

      it('each member has id, firstName, lastName, profilePicture', async () => {
    const result = await service.findAll();
    result.forEach(m => {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('firstName');
      expect(m).toHaveProperty('lastName');
      expect(m).toHaveProperty('profilePicture');
    });
  });
});