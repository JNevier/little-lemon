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

// Wrap part of the app in <ReservationsProvider> to give it access to the reservations.
// "children" is everything placed between the opening and closing tags.
export function ReservationsProvider({ children }) {
  const [saved, setSaved] = useLocalStorage(STORAGE_KEY, []);
  const reservations = asList(saved);

  // Adds a booking and gives it an id. The functional update (current => ...) always starts
  // from the latest list, even if two updates happen quickly one after the other.
  function addReservation(booking) {
    const reservation = { ...booking, id: makeId() };
    setSaved((current) => [...asList(current), reservation]);
    return reservation;
  }

  // Keeps every reservation except the one with this id.
  function cancelReservation(id) {
    setSaved((current) => asList(current).filter((reservation) => reservation.id !== id));
  }

  // Everything inside the provider can read this value with useReservations().
  const value = { reservations, addReservation, cancelReservation };
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
