import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { GymClass, Member, CheckIn, PendingCheckIn } from '../types';
import { api } from '../services/api';

const PENDING_KEY = 'pending_checkins';

interface AppState {
  classes: GymClass[];
  members: Member[];
  checkIns: CheckIn[];
  pendingCheckIns: PendingCheckIn[];
  loading: boolean;
  error: string | null;
  loadInitialData: () => Promise<void>;
  addCheckIn: (checkIn: CheckIn) => void;
  replaceCheckIn: (localId: string, checkIn: CheckIn) => void;
  removeCheckIn: (id: string) => void;
  addPendingCheckIn: (pending: PendingCheckIn) => Promise<void>;
  loadPendingCheckIns: () => Promise<void>;
  flushPendingCheckIns: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  classes: [],
  members: [],
  checkIns: [],
  pendingCheckIns: [],
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

  replaceCheckIn: (localId, checkIn) =>
    set((state) => ({
      checkIns: state.checkIns.map((ci) => (ci.id === localId ? checkIn : ci)),
    })),

  removeCheckIn: (id) =>
    set((state) => ({ checkIns: state.checkIns.filter((ci) => ci.id !== id) })),

  addPendingCheckIn: async (pending) => {
    const next = [...get().pendingCheckIns, pending];
    set({ pendingCheckIns: next });
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(next));
  },

  loadPendingCheckIns: async () => {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    if (raw) set({ pendingCheckIns: JSON.parse(raw) });
  },

  flushPendingCheckIns: async () => {
    const { pendingCheckIns, replaceCheckIn } = get();
    if (pendingCheckIns.length === 0) return;

    const remaining: PendingCheckIn[] = [];
    for (const pending of pendingCheckIns) {
      try {
        const result = await api.postCheckIn(pending.memberId, pending.classId);
        replaceCheckIn(pending.localId, result);
      } catch {
        remaining.push(pending);
      }
    }

    set({ pendingCheckIns: remaining });
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
  },
}));
