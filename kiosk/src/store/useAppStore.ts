import { create } from 'zustand';
import { GymClass, Member, CheckIn } from '../types';
import { api } from '../services/api';

interface AppState {
  classes: GymClass[];
  members: Member[];
  checkIns: CheckIn[];
  loading: boolean;
  error: string | null;
  loadInitialData: () => Promise<void>;
  addCheckIn: (checkIn: CheckIn) => void;
}

export const useAppStore = create<AppState>((set) => ({
  classes: [],
  members: [],
  checkIns: [],
  loading: false,
  error: null,

  loadInitialData: async () => {
    set({ loading: true, error: null });
    try {
      const [classes, members, checkIns] = await Promise.all([
        api.getClasses(),
        api.getMembers(),
        api.getCheckIns(),
      ]);
      set({ classes, members, checkIns, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addCheckIn: (checkIn) =>
    set((state) => ({ checkIns: [...state.checkIns, checkIn] })),
}));
