// A date has two shapes in this app: the 'YYYY-MM-DD' string a date input uses,
// and the Date object fetchAPI uses. Both helpers work in LOCAL time (the visitor's
// own calendar day), never UTC, so the day can't shift by time zone.

// Date -> 'YYYY-MM-DD'
export function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 'YYYY-MM-DD' -> Date at local midnight
export function fromInputDate(text) {
  const [year, month, day] = text.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// True only for a complete 'YYYY-MM-DD' date: 4 digits, dash, 2 digits, dash, 2 digits.
// A cleared ('') or half-typed date fails, so callers can skip it.
export function isInputDate(text) {
  return /^\d{4}-\d{2}-\d{2}$/.test(text);
}

// 'YYYY-MM-DD' -> "Friday, October 9, 2026"
// Built from parts in local time (never new Date('YYYY-MM-DD')), so the day can't shift.
// 'en-US' keeps the wording the same on every computer.
export function formatLongDate(text) {
  return fromInputDate(text).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// 'YYYY-MM-DD' + a number of days -> 'YYYY-MM-DD', counted on the calendar in local time.
// For example addDays('2026-11-09', 90) gives '2027-02-07'.
// setDate() past the end of a month rolls over to the next month on its own.
export function addDays(text, days) {
  const day = fromInputDate(text);
  day.setDate(day.getDate() + days);
  return toInputDate(day);
}

// True when a time on a date has already passed (or is happening right now), so it can't be booked.
// Only "today" can have past times: any other date is either all in the future, or blocked elsewhere.
// `now` defaults to the current moment; tests pass in a fixed one so they work at any hour.
// 'HH:MM' text compares in the right order as plain text ('09:30' < '17:00' < '23:00').
export function isPastTime(date, time, now = new Date()) {
  if (date !== toInputDate(now)) {
    return false;
  }
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  // "Not later than now": a 19:00 table can't be booked at 19:00 either.
  return time <= `${hours}:${minutes}`;
}
