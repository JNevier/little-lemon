import { toInputDate, fromInputDate, formatLongDate, addDays, isPastTime } from './dates';

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

test('addDays counts calendar days, across months and years', () => {
  expect(addDays('2026-11-09', 1)).toBe('2026-11-10');
  expect(addDays('2026-11-09', 90)).toBe('2027-02-07');
  expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
});

describe('isPastTime', () => {
  // A fixed "now": Monday, November 9, 2026 at 19:00, in local time.
  const now = new Date(2026, 10, 9, 19, 0);

  test('on today, a time before now has passed', () => {
    expect(isPastTime('2026-11-09', '17:00', now)).toBe(true);
  });

  test('on today, a time equal to now counts as passed (it is too late to book it)', () => {
    expect(isPastTime('2026-11-09', '19:00', now)).toBe(true);
  });

  test('on today, a later time has not passed', () => {
    expect(isPastTime('2026-11-09', '19:30', now)).toBe(false);
  });

  test('on any other date, nothing counts as passed', () => {
    expect(isPastTime('2026-11-10', '17:00', now)).toBe(false);
    expect(isPastTime('2026-11-08', '23:00', now)).toBe(false);
  });
});
