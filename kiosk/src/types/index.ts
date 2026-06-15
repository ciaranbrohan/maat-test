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
  time: string;
  repeat: string;
  duration: number;
  capacity: number;
  tags: string[];
}

export interface CheckIn {
  id: string;
  memberId: string;
  classId: string;
  timestamp: string;
  status: 'confirmed' | 'registered';
}

export interface PendingCheckIn {
  localId: string;
  memberId: string;
  classId: string;
  timestamp: string;
}

export type RootStackParamList = {
  Home: undefined;
  Class: { classId: string };
  MemberSearch: { classId: string };
  CheckIn: { classId: string; memberId: string };
  Success: { memberName: string; className: string };
};
