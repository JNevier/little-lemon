// Small pure functions: each takes a value and returns true (valid) or false.
// "Pure" means the same input always gives the same answer and nothing else is changed,
// which makes them easy to test.

// The choice for a booking that isn't for anything special. It comes first and is the default,
// because most bookings are just dinner. Pages that show a booking leave it out (it isn't news).
export const NO_OCCASION = 'No special occasion';

// The occasions the form offers. The form builds its options from this same list.
export const OCCASIONS = [NO_OCCASION, 'Birthday', 'Anniversary'];

// The seating choices the form offers as radio buttons. Same idea as OCCASIONS.
export const SEATING_OPTIONS = ['Indoor', 'Outdoor', 'No preference'];

// A 'YYYY-MM-DD' date from today up to lastDay. Both days are passed in, so tests can use fixed days.
// lastDay is optional: without it, any later date is fine (as before).
// 'YYYY-MM-DD' text compares in date order as plain text, so >= and <= work.
export function isValidDate(date, today, lastDay) {
  // The exact shape a date input gives: 4 digits, dash, 2 digits, dash, 2 digits.
  const looksLikeDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const notTooFar = lastDay === undefined || date <= lastDay;
  return looksLikeDate && date >= today && notTooFar;
}

// One of the times the API offered for that day.
export function isValidTime(time, availableTimes) {
  return availableTimes.includes(time);
}

// A whole number from 1 to 10. The input gives a string, so convert it first.
export function isValidGuests(guests) {
  const count = Number(guests);
  return Number.isInteger(count) && count >= 1 && count <= 10;
}

// One of the occasions in the list above.
export function isValidOccasion(occasion) {
  return OCCASIONS.includes(occasion);
}

// A name with at least 2 characters once the spaces at both ends are removed,
// so "  " (only spaces) or a single letter doesn't count.
export function isValidName(name) {
  return name.trim().length >= 2;
}

// A BASIC email check: something, then @, then something, a dot, and something, with no spaces.
// It catches typos like "a@b" or "name.example.com". It can't tell if the address really exists;
// only sending an email could prove that.
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// One of the seating choices in the list above.
export function isValidSeating(seating) {
  return SEATING_OPTIONS.includes(seating);
}
