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

test('ignores entries that are not real reservations, and keeps the good ones', () => {
  const good = { id: 'good', date: '2026-10-09', time: '18:00', guests: 2, occasion: 'Birthday' };
  const saved = [null, 5, {}, { id: 7, date: '2026-10-09', time: '18:00' }, good];
  localStorage.setItem('little-lemon-reservations', JSON.stringify(saved));

  const { result } = renderReservations();

  expect(result.current.reservations).toEqual([good]);
  // Reading doesn't rewrite what's saved.
  expect(JSON.parse(localStorage.getItem('little-lemon-reservations'))).toEqual(saved);
});

test('cancel and update still work when a bad entry is saved next to a good one', () => {
  const good = { id: 'good', date: '2026-10-09', time: '18:00', guests: 2, occasion: 'Birthday' };
  localStorage.setItem('little-lemon-reservations', JSON.stringify([null, good]));
  const { result } = renderReservations();

  act(() => {
    result.current.updateReservation('good', { time: '19:00' });
  });
  expect(result.current.reservations).toEqual([{ ...good, time: '19:00' }]);

  act(() => {
    result.current.cancelReservation('good');
  });
  expect(result.current.reservations).toEqual([]);
});

test('a booking made in another tab is kept when this tab books too', () => {
  // This tab and "another tab" both start with no bookings.
  const { result } = renderReservations();
  const fromOtherTab = { ...booking, id: 'other-tab', time: '20:00' };

  // The other tab saves its booking; the browser tells this tab with a storage event.
  act(() => {
    localStorage.setItem('little-lemon-reservations', JSON.stringify([fromOtherTab]));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'little-lemon-reservations',
      newValue: JSON.stringify([fromOtherTab]),
    }));
  });
  // Now this tab books as well.
  act(() => {
    result.current.addReservation(booking);
  });

  // Both bookings are kept, in this tab and in storage.
  const saved = JSON.parse(localStorage.getItem('little-lemon-reservations'));
  expect(saved.map((r) => r.time)).toEqual(['20:00', '18:00']);
  expect(result.current.reservations).toHaveLength(2);
});

test('useReservations throws a clear error outside the provider', () => {
  // React logs the thrown error to the console; hide it so the test output stays clean.
  jest.spyOn(console, 'error').mockImplementation(() => {});

  expect(() => renderHook(() => useReservations())).toThrow(
    'useReservations must be used inside a <ReservationsProvider>.'
  );
});
