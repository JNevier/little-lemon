// Small pure functions: each takes a value and returns true (valid) or false.
// "Pure" means the same input always gives the same answer and nothing else is changed,
// which makes them easy to test.

// The occasions the form offers. The form builds its options from this same list.
export const OCCASIONS = ['Birthday', 'Anniversary'];

// The seating choices the form offers as radio buttons. Same idea as OCCASIONS.
export const SEATING_OPTIONS = ['Indoor', 'Outdoor', 'No preference'];

// A 'YYYY-MM-DD' date that is today or later. "today" is passed in, so tests can use a fixed day.
export function isValidDate(date, today) {
  // The exact shape a date input gives: 4 digits, dash, 2 digits, dash, 2 digits.
  const looksLikeDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  return looksLikeDate && date >= today;
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
