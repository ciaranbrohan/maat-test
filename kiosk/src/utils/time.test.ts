import { formatTimeRange, formatDate } from './time';

describe('formatTimeRange', () => {
  it('formats a range with no hour overflow', () => {
    expect(formatTimeRange('10:00', 60)).toBe('10:00—11:00h');
  });

  it('formats a range that crosses the hour boundary', () => {
    expect(formatTimeRange('19:45', 60)).toBe('19:45—20:45h');
  });

  it('formats a range with non-zero minutes in duration', () => {
    expect(formatTimeRange('18:30', 75)).toBe('18:30—19:45h');
  });
});

describe('formatDate', () => {
  it('formats a date with ST suffix', () => {
    const date = new Date(2026, 5, 1); // June 1
    expect(formatDate(date)).toBe('MONDAY, 1ST JUNE');
  });

  it('formats a date with ND suffix', () => {
    const date = new Date(2026, 5, 2); // June 2
    expect(formatDate(date)).toBe('TUESDAY, 2ND JUNE');
  });

  it('formats a date with RD suffix', () => {
    const date = new Date(2026, 5, 3); // June 3
    expect(formatDate(date)).toBe('WEDNESDAY, 3RD JUNE');
  });

  it('formats a date with TH suffix', () => {
    const date = new Date(2026, 5, 4); // June 4
    expect(formatDate(date)).toBe('THURSDAY, 4TH JUNE');
  });

  it('formats 11th with TH (not ST)', () => {
    const date = new Date(2026, 5, 11); // June 11
    expect(formatDate(date)).toBe('THURSDAY, 11TH JUNE');
  });

  it('formats 21st with ST', () => {
    const date = new Date(2026, 5, 21); // June 21
    expect(formatDate(date)).toBe('SUNDAY, 21ST JUNE');
  });
});
