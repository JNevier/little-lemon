import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Context lets any component inside the provider read the reservations directly,
// instead of passing them down as props through every component in between ("prop drilling").
// null means "no provider around this component", which useReservations checks for below.
const ReservationsContext = createContext(null);

// The key the reservations are saved under in the browser's storage.
const STORAGE_KEY = 'little-lemon-reservations';

// A unique id for each reservation, so Cancel removes exactly the right one.
// Date.now() is the time in milliseconds; the random part covers two bookings in the same millisecond.
// (crypto.randomUUID would be nicer, but it doesn't exist in the test environment.)
function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Saved data could be anything (an old version, or edited by hand). Only trust a list.
function asList(value) {
  return Array.isArray(value) ? value : [];
}

// One entry in that list could be anything too: null, a number, an empty object.
// A real reservation is an object with a text id, date and time; anything else is ignored.
// (Without this, one bad entry like [null] crashed My Reservations and the booking page:
// reading null.date throws an error, and React showed a blank page.)
// typeof null is "object" in JavaScript, so null needs its own check.
function isReservation(entry) {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    typeof entry.id === 'string' &&
    typeof entry.date === 'string' &&
    typeof entry.time === 'string'
  );
}

// Wrap part of the app in <ReservationsProvider> to give it access to the reservations.
// "children" is everything placed between the opening and closing tags.
export function ReservationsProvider({ children }) {
  const [saved, setSaved] = useLocalStorage(STORAGE_KEY, []);
  // The pages only ever see real reservations. The saved text itself isn't rewritten when it's read;
  // bad entries are simply skipped.
  const reservations = asList(saved).filter(isReservation);

  // Adds a booking and gives it an id. The functional update (current => ...) always starts
  // from the latest list, even if two updates happen quickly one after the other.
  function addReservation(booking) {
    const reservation = { ...booking, id: makeId() };
    setSaved((current) => [...asList(current), reservation]);
    return reservation;
  }

  // Keeps every reservation except the one with this id.
  function cancelReservation(id) {
    // Bad entries are kept as they are (they're not this reservation); isReservation is checked first,
    // so a null entry never gets asked for its .id.
    setSaved((current) =>
      asList(current).filter((reservation) => !isReservation(reservation) || reservation.id !== id)
    );
  }

  // Changes one booking in place: the same id, with the new details on top of the old ones.
  // { ...old, ...changes, id } copies the old booking, overwrites every field that changed,
  // and puts the id back last, so a change can never give the booking a different id.
  // map() returns a new list in the same order, with only that one entry replaced.
  function updateReservation(id, changes) {
    setSaved((current) =>
      asList(current).map((reservation) =>
        isReservation(reservation) && reservation.id === id ? { ...reservation, ...changes, id } : reservation
      )
    );
  }

  // Everything inside the provider can read this value with useReservations().
  const value = { reservations, addReservation, cancelReservation, updateReservation };
  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
}

// A custom hook, so components write useReservations() instead of useContext(ReservationsContext).
export function useReservations() {
  const context = useContext(ReservationsContext);
  // A clear message beats a confusing "cannot read properties of null" error later.
  if (context === null) {
    throw new Error('useReservations must be used inside a <ReservationsProvider>.');
  }
  return context;
}
