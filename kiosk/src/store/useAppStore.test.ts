import { useAppStore } from './useAppStore';

const mockClasses = [
  { id: '1', name: 'BJJ', instructorName: 'Coach', day: 'Monday',
    time: '10:00', repeat: 'weekly', duration: 60, capacity: 20, tags: ['BJJ'] },
];
const mockMembers = [
  { id: 'm1', firstName: 'Anna', lastName: 'Rossi', profilePicture: '' },
];
const mockCheckIns = [
  { id: 'c1', memberId: 'm1', classId: '1', timestamp: '2026-01-01T10:00:00Z', status: 'confirmed' as const },
];

beforeEach(() => {
  global.fetch = jest.fn();
  useAppStore.setState({ classes: [], members: [], checkIns: [], loading: false, error: null });
});

it('starts with empty state', () => {
  const state = useAppStore.getState();
  expect(state.classes).toEqual([]);
  expect(state.loading).toBe(false);
  expect(state.error).toBeNull();
});

it('loadInitialData sets classes, members, and checkIns', async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => mockClasses })
    .mockResolvedValueOnce({ ok: true, json: async () => mockMembers })
    .mockResolvedValueOnce({ ok: true, json: async () => mockCheckIns });

  await useAppStore.getState().loadInitialData();

  const state = useAppStore.getState();
  expect(state.classes).toEqual(mockClasses);
  expect(state.members).toEqual(mockMembers);
  expect(state.checkIns).toEqual(mockCheckIns);
  expect(state.loading).toBe(false);
  expect(state.error).toBeNull();
});

it('loadInitialData sets error on failure', async () => {
  (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

  await useAppStore.getState().loadInitialData();

  const state = useAppStore.getState();
  expect(state.error).toBe('Network error');
  expect(state.loading).toBe(false);
});

it('addCheckIn appends to checkIns', () => {
  useAppStore.setState({ checkIns: mockCheckIns });

  const newCheckIn = { id: 'c2', memberId: 'm2', classId: '1',
    timestamp: '2026-01-01T11:00:00Z', status: 'confirmed' as const };

  useAppStore.getState().addCheckIn(newCheckIn);

  const state = useAppStore.getState();
  expect(state.checkIns).toHaveLength(2);
  expect(state.checkIns[1]).toEqual(newCheckIn);
});
