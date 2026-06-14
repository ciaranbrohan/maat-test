import { render, fireEvent } from '@testing-library/react-native';
import ClassScreen from './ClassScreen';
import { useAppStore } from '../store/useAppStore';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { classId: '1' } }),
}));

const gymClass = {
  id: '1',
  name: 'Mixed Level BJJ',
  instructorName: 'Ciaran Brohan',
  day: 'Monday',
  time: '18:30',
  repeat: 'weekly',
  duration: 75,
  capacity: 25,
  tags: ['BJJ', 'MMA'],
};

const member = {
  id: 'm1',
  firstName: 'Anna',
  lastName: 'Rossi',
  profilePicture: '',
};

const checkIn = {
  id: 'ci1',
  memberId: 'm1',
  classId: '1',
  timestamp: '2026-01-01T10:00:00Z',
  status: 'confirmed' as const,
};

beforeEach(() => {
  mockNavigate.mockClear();
  mockGoBack.mockClear();
  useAppStore.setState({
    classes: [gymClass],
    members: [member],
    checkIns: [],
    loading: false,
    error: null,
  });
});

it('renders class name and time range', async () => {
  const { getByText } = await render(<ClassScreen />);
  expect(getByText('Mixed Level BJJ')).toBeTruthy();
  expect(getByText('18:30—19:45h')).toBeTruthy();
});

it('renders instructor name', async () => {
  const { getByText } = await render(<ClassScreen />);
  expect(getByText('Ciaran Brohan')).toBeTruthy();
});

it('renders capacity line', async () => {
  const { getByText } = await render(<ClassScreen />);
  expect(getByText('0/25 attendees')).toBeTruthy();
});

it('renders tags', async () => {
  const { getByText } = await render(<ClassScreen />);
  expect(getByText('BJJ')).toBeTruthy();
  expect(getByText('MMA')).toBeTruthy();
});

it('shows "No check-ins yet" when attendee list is empty', async () => {
  const { getByText } = await render(<ClassScreen />);
  expect(getByText('No check-ins yet')).toBeTruthy();
});

it('renders attendee name and status when check-in exists', async () => {
  useAppStore.setState({
    classes: [gymClass],
    members: [member],
    checkIns: [checkIn],
    loading: false,
    error: null,
  });
  const { getByText } = await render(<ClassScreen />);
  expect(getByText('Anna Rossi')).toBeTruthy();
  expect(getByText('confirmed')).toBeTruthy();
});

it('navigates to MemberSearch when Add Check-In is pressed', async () => {
  const { getByText } = await render(<ClassScreen />);
  fireEvent.press(getByText('Add Check-In'));
  expect(mockNavigate).toHaveBeenCalledWith('MemberSearch', { classId: '1' });
});

it('calls goBack when back button is pressed', async () => {
  const { getByText } = await render(<ClassScreen />);
  fireEvent.press(getByText('← Back'));
  expect(mockGoBack).toHaveBeenCalledTimes(1);
});

it('shows "Class not found" when classId does not match any class', async () => {
  useAppStore.setState({
    classes: [],
    members: [],
    checkIns: [],
    loading: false,
    error: null,
  });
  const { getByText } = await render(<ClassScreen />);
  expect(getByText('Class not found')).toBeTruthy();
});
