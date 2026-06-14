import { GymClass, Member, CheckIn } from '../types';

const BASE_URL = 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
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
};
