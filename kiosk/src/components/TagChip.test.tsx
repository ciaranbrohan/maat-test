import { render } from '@testing-library/react-native';
import TagChip from './TagChip';

it('renders the label', async () => {
  const result = await render(<TagChip label="BJJ" />);
  expect(result.getByText('BJJ')).toBeTruthy();
});

it('renders an unknown label without crashing', async () => {
  const result = await render(<TagChip label="WRESTLING" />);
  expect(result.getByText('WRESTLING')).toBeTruthy();
});
