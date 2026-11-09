import { renderHook, act } from '@testing-library/react';
import { ReservationsProvider, useReservations } from './ReservationsContext';

// Fake booking data (not a real person).
const booking = { date: '2026-10-09', time: '18:00', guests: 2, occasion: 'Birthday' };

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// renderHook's "wrapper" puts the provider around the hook, like App does around the pages.
function renderReservations() {
  return renderHook(() => useReservations(), { wrapper: ReservationsProvider });
}

test('starts with no reservations', () => {
  const { result } = renderReservations();
  expect(result.current.reservations).toEqual([]);
});

test('addReservation saves the booking with an id, also in the browser storage', () => {
  const { result } = renderReservations();

  act(() => {
    result.current.addReservation(booking);
  });

  expect(result.current.reservations).toHaveLength(1);
  expect(result.current.reservations[0]).toMatchObject(booking);
  expect(typeof result.current.reservations[0].id).toBe('string');
  const saved = JSON.parse(localStorage.getItem('little-lemon-reservations'));
  expect(saved).toEqual(result.current.reservations);
});

test('cancelReservation removes only that reservation', () => {
  const { result } = renderReservations();
  act(() => {
    result.current.addReservation(booking);
    result.current.addReservation({ ...booking, time: '19:00' });
  });
  const [first, second] = result.current.reservations;
  // Two bookings added in the same moment still get different ids.
  expect(first.id).not.toBe(second.id);

  act(() => {
    result.current.cancelReservation(first.id);
  });

  expect(result.current.reservations).toEqual([second]);
});

test('updateReservation changes one booking in place and keeps its id', () => {
  const { result } = renderReservations();
  act(() => {
    result.current.addReservation(booking);
    result.current.addReservation({ ...booking, time: '19:00' });
  });
  const [first, second] = result.current.reservations;

  act(() => {
    // Even if the changes carry a different id, the booking keeps its own.
    result.current.updateReservation(first.id, { time: '20:30', guests: 4, id: 'something-else' });
  });

  const [updated, untouched] = result.current.reservations;
  expect(updated).toEqual({ ...first, time: '20:30', guests: 4 });
  expect(updated.id).toBe(first.id);
  // The other booking is exactly as it was, and the order is kept.
  expect(untouched).toEqual(second);
  // The change is saved in the browser too.
  expect(JSON.parse(localStorage.getItem('little-lemon-reservations'))).toEqual([updated, second]);
});

test('ignores saved data that is not a list', () => {
  localStorage.setItem('little-lemon-reservations', JSON.stringify({ not: 'a list' }));
  const { result } = renderReservations();
  expect(result.current.reservations).toEqual([]);
});

test('useReservations throws a clear error outside the provider', () => {
  // React logs the thrown error to the console; hide it so the test output stays clean.
  jest.spyOn(console, 'error').mockImplementation(() => {});

  expect(() => renderHook(() => useReservations())).toThrow(
    'useReservations must be used inside a <ReservationsProvider>.'
  );
});
