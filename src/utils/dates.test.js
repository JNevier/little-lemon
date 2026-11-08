import { toInputDate, fromInputDate, formatLongDate } from './dates';

test('toInputDate and fromInputDate convert both ways without shifting the day', () => {
  const date = fromInputDate('2026-10-09');
  expect(date.getFullYear()).toBe(2026);
  expect(date.getMonth()).toBe(9); // months count from 0, so 9 is October
  expect(date.getDate()).toBe(9);
  expect(toInputDate(date)).toBe('2026-10-09');
});

test('formatLongDate writes the date out in full', () => {
  expect(formatLongDate('2026-10-09')).toBe('Friday, October 9, 2026');
  // The first day of a month is a common place for off-by-one-day bugs.
  expect(formatLongDate('2027-01-01')).toBe('Friday, January 1, 2027');
});
