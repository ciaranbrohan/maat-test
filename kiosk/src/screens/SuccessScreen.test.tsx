import { render } from '@testing-library/react-native';
import SuccessScreen from './SuccessScreen';

const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ reset: mockReset }),
  useRoute: () => ({
    params: { memberName: 'Anna Rossi', className: 'Mixed Level BJJ' },
  }),
}));

beforeEach(() => {
  mockReset.mockClear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('renders the checkmark', async () => {
  const { getByText } = await render(<SuccessScreen />);
  expect(getByText('✓')).toBeTruthy();
});

it('renders member name', async () => {
  const { getByText } = await render(<SuccessScreen />);
  expect(getByText('Anna Rossi')).toBeTruthy();
});

it('renders class name', async () => {
  const { getByText } = await render(<SuccessScreen />);
  expect(getByText('checked into Mixed Level BJJ')).toBeTruthy();
});

it('auto-navigates to Home after 3 seconds', async () => {
  await render(<SuccessScreen />);
  expect(mockReset).not.toHaveBeenCalled();
  jest.advanceTimersByTime(3000);
  expect(mockReset).toHaveBeenCalledWith({
    index: 0,
    routes: [{ name: 'Home' }],
  });
});

it('does not navigate before 3 seconds', async () => {
  await render(<SuccessScreen />);
  jest.advanceTimersByTime(2999);
  expect(mockReset).not.toHaveBeenCalled();
});
