import { render, fireEvent } from '@testing-library/react-native';
import ClassCard from './ClassCard';
import { GymClass } from '../types';

const gymClass: GymClass = {
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

it('renders class name and instructor', async () => {
  const result = await render(<ClassCard gymClass={gymClass} attendeeCount={5} onPress={() => {}} />);
  expect(result.getByText('Mixed Level BJJ')).toBeTruthy();
  expect(result.getByText('Ciaran Brohan')).toBeTruthy();
});

it('renders formatted time range', async () => {
  const result = await render(<ClassCard gymClass={gymClass} attendeeCount={5} onPress={() => {}} />);
  expect(result.getByText('18:30—19:45h')).toBeTruthy();
});

it('renders attendee count', async () => {
  const result = await render(<ClassCard gymClass={gymClass} attendeeCount={5} onPress={() => {}} />);
  expect(result.getByText('5/25 attendees')).toBeTruthy();
});

it('renders each tag', async () => {
  const result = await render(<ClassCard gymClass={gymClass} attendeeCount={5} onPress={() => {}} />);
  expect(result.getByText('BJJ')).toBeTruthy();
  expect(result.getByText('MMA')).toBeTruthy();
});

it('calls onPress when tapped', async () => {
  const onPress = jest.fn();
  const result = await render(<ClassCard gymClass={gymClass} attendeeCount={5} onPress={onPress} />);
  fireEvent.press(result.getByText('Mixed Level BJJ'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
