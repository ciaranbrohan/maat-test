import { Platform } from 'react-native';
import { GymClass, Member, CheckIn } from '../types';

// Android emulator routes to host via 10.0.2.2; iOS simulator uses localhost
const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

const API_KEY = 'kiosk-dev-key';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...((options?.headers as Record<string, string>) ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  getClasses: () => request<GymClass[]>('/classes'),
  getMembers: () => request<Member[]>('/members'),
  getCheckIns: () => request<CheckIn[]>('/checkins'),
  postCheckIn: (memberId: string, classId: string) =>
    request<CheckIn>('/checkins', {
      method: 'POST',
      body: JSON.stringify({ memberId, classId, timestamp: new Date().toISOString() }),
    }),
  deleteCheckIn: (id: string) =>
    request<void>(`/checkins/${id}`, { method: 'DELETE' }),
};
