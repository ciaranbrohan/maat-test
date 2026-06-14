import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CheckInScreen from './CheckInScreen';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { classId: 'c1', memberId: 'm1' } }),
}));

jest.mock('../services/api', () => ({
  api: { postCheckIn: jest.fn() },
}));

const member = {
  id: 'm1', firstName: 'Anna', lastName: 'Rossi', profilePicture: '',
};
const gymClass = {
  id: 'c1', name: 'Mixed Level BJJ', instructorName: 'Ciaran Brohan',
  day: 'Monday', time: '18:30', repeat: 'weekly', duration: 75, capacity: 25, tags: ['BJJ'],
};
const checkIn = {
  id: 'ci1', memberId: 'm1', classId: 'c1',
  timestamp: '2026-06-14T18:30:00Z', status: 'confirmed' as const,
};

beforeEach(() => {
  mockNavigate.mockClear();
  mockGoBack.mockClear();
  (api.postCheckIn as jest.Mock).mockResolvedValue(checkIn);
  useAppStore.setState({
    classes: [gymClass], members: [member], checkIns: [],
    loading: false, error: null,
  });
});

it('renders member name', async () => {
  const { getByText } = await render(<CheckInScreen />);
  expect(getByText('Anna Rossi')).toBeTruthy();
});

it('renders today\'s date', async () => {
  const { getByText } = await render(<CheckInScreen />);
  expect(getByText(/\d+(ST|ND|RD|TH)/)).toBeTruthy();
});

it('renders Check In button', async () => {
  const { getByText } = await render(<CheckInScreen />);
  expect(getByText('Check In')).toBeTruthy();
});

it('calls api.postCheckIn with correct params on button press', async () => {
  const { getByText } = await render(<CheckInScreen />);
  fireEvent.press(getByText('Check In'));
  await waitFor(() => {
    expect(api.postCheckIn).toHaveBeenCalledWith('m1', 'c1');
  });
});

it('navigates to Success after successful check-in', async () => {
  const { getByText } = await render(<CheckInScreen />);
  fireEvent.press(getByText('Check In'));
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('Success', {
      memberName: 'Anna Rossi',
      className: 'Mixed Level BJJ',
    });
  });
});

it('shows error text when check-in fails', async () => {
  (api.postCheckIn as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
  const { getByText } = await render(<CheckInScreen />);
  fireEvent.press(getByText('Check In'));
  await waitFor(() => {
    expect(getByText('Network error')).toBeTruthy();
  });
});

it('calls goBack when back button is pressed', async () => {
  const { getByText } = await render(<CheckInScreen />);
  fireEvent.press(getByText('← Back'));
  expect(mockGoBack).toHaveBeenCalledTimes(1);
});

it('shows "Member not found" when member is missing from store', async () => {
  useAppStore.setState({
    classes: [gymClass], members: [], checkIns: [],
    loading: false, error: null,
  });
  const { getByText } = await render(<CheckInScreen />);
  expect(getByText('Member not found')).toBeTruthy();
});

it('shows "Class not found" when class is missing from store', async () => {
  useAppStore.setState({
    classes: [], members: [member], checkIns: [],
    loading: false, error: null,
  });
  const { getByText } = await render(<CheckInScreen />);
  expect(getByText('Class not found')).toBeTruthy();
});
