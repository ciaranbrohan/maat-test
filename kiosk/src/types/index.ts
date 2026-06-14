export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

export interface GymClass {
  id: string;
  name: string;
  instructorName: string;
  day: string;
  time: string;      // "09:00"
  repeat: string;
  duration: number;  // minutes
  capacity: number;
}

export interface CheckIn {
  id: string;
  memberId: string;
  classId: string;
  timestamp: string; // ISO string
  status: 'confirmed' | 'registered';
}

export type RootStackParamList = {
  Home: undefined;
  Class: { classId: string };
  MemberSearch: { classId: string };
  CheckIn: { classId: string; memberId: string };
  Success: { memberName: string; className: string };
};