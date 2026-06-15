import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MemberSearchScreen from './MemberSearchScreen';
import { useAppStore } from '../store/useAppStore';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { classId: 'c1' } }),
}));

const members = [
  { id: 'm1', firstName: 'Anna', lastName: 'Rossi', profilePicture: '' },
  { id: 'm2', firstName: 'Marco', lastName: 'Lopez', profilePicture: '' },
];

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
    if (typeof msg === 'string' && msg.includes('not wrapped in act')) return;
    console.error(msg, ...args);
  });
  mockNavigate.mockClear();
  mockGoBack.mockClear();
  useAppStore.setState({
    classes: [],
    members,
    checkIns: [],
    loading: false,
    error: null,
  });
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

it('renders the search input', async () => {
  const { getByPlaceholderText } = await render(<MemberSearchScreen />);
  expect(getByPlaceholderText('Search members...')).toBeTruthy();
});

it('renders all eligible members', async () => {
  const { getByText } = await render(<MemberSearchScreen />);
  expect(getByText('Anna Rossi')).toBeTruthy();
  expect(getByText('Marco Lopez')).toBeTruthy();
});

it('filters members by name as query changes', async () => {
  const { getByText, queryByText, getByPlaceholderText } = await render(<MemberSearchScreen />);
  fireEvent.changeText(getByPlaceholderText('Search members...'), 'anna');
  await waitFor(() => expect(queryByText('Marco Lopez')).toBeNull());
  expect(getByText('Anna Rossi')).toBeTruthy();
});

it('shows "No members found" when search matches nothing', async () => {
  const { getByText, getByPlaceholderText } = await render(<MemberSearchScreen />);
  fireEvent.changeText(getByPlaceholderText('Search members...'), 'zzz');
  await waitFor(() => expect(getByText('No members found')).toBeTruthy());
});

it('excludes members already checked in to the class', async () => {
  useAppStore.setState({
    classes: [],
    members,
    checkIns: [
      { id: 'ci1', memberId: 'm1', classId: 'c1', timestamp: '2026-01-01T10:00:00Z', status: 'confirmed' as const },
    ],
    loading: false,
    error: null,
  });
  const { queryByText, getByText } = await render(<MemberSearchScreen />);
  expect(queryByText('Anna Rossi')).toBeNull();
  expect(getByText('Marco Lopez')).toBeTruthy();
});

it('shows "All members are checked in" when all are excluded', async () => {
  useAppStore.setState({
    classes: [],
    members,
    checkIns: [
      { id: 'ci1', memberId: 'm1', classId: 'c1', timestamp: '2026-01-01T10:00:00Z', status: 'confirmed' as const },
      { id: 'ci2', memberId: 'm2', classId: 'c1', timestamp: '2026-01-01T10:05:00Z', status: 'confirmed' as const },
    ],
    loading: false,
    error: null,
  });
  const { getByText } = await render(<MemberSearchScreen />);
  expect(getByText('All members are checked in')).toBeTruthy();
});

it('navigates to CheckIn on member tap', async () => {
  const { getByText } = await render(<MemberSearchScreen />);
  fireEvent.press(getByText('Anna Rossi'));
  expect(mockNavigate).toHaveBeenCalledWith('CheckIn', { classId: 'c1', memberId: 'm1' });
});

it('calls goBack when back button is pressed', async () => {
  const { getByText } = await render(<MemberSearchScreen />);
  fireEvent.press(getByText('← Back'));
  expect(mockGoBack).toHaveBeenCalledTimes(1);
});
