import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Main, { initializeTimes, updateTimes } from './Main';
import { fetchAPI, submitAPI } from '../../api';
import { toInputDate } from '../../utils/dates';
import { ReservationsProvider } from '../../context/ReservationsContext';

// Replace the course API with a fake, so these tests don't depend on today's date.
jest.mock('../../api');
// CRA wipes every mock (its answers and its call history) before each test,
// so each test sets its own answer with mockReturnValue.

test('initializeTimes asks the API about today and returns its times', () => {
  fetchAPI.mockReturnValue(['17:00', '18:00']);

  const times = initializeTimes();

  expect(times).toEqual(['17:00', '18:00']);
  // "Today" is checked against today, so this passes on any day you run it.
  const askedDate = fetchAPI.mock.calls[0][0];
  expect(toInputDate(askedDate)).toBe(toInputDate(new Date()));
});

test('updateTimes asks the API about the picked date and returns its times', () => {
  fetchAPI.mockReturnValue(['19:00', '20:30']);
  const state = ['17:00'];
  const action = { type: 'DATE_CHANGED', date: '2026-10-09' };

  const result = updateTimes(state, action);

  expect(result).toEqual(['19:00', '20:30']);
  // It must ask about Oct 9 in local time, not a day off.
  expect(toInputDate(fetchAPI.mock.calls[0][0])).toBe('2026-10-09');
});

test('updateTimes leaves the times alone for an action it does not know', () => {
  const state = ['17:00'];

  expect(updateTimes(state, { type: 'RESET' })).toBe(state);
  expect(fetchAPI).not.toHaveBeenCalled();
});

test('a booking that is not saved shows an error and stays on the form', () => {
  fetchAPI.mockReturnValue(['17:00', '18:00']);
  submitAPI.mockReturnValue(false);
  // Main reads the saved reservations from Context, so it needs the provider around it (App.js has it).
  render(
    <MemoryRouter initialEntries={['/reservations']}>
      <ReservationsProvider>
        <Main />
      </ReservationsProvider>
    </MemoryRouter>
  );

  fireEvent.click(screen.getByRole('button', { name: 'Make Your reservation' }));

  expect(screen.getByRole('alert')).toHaveTextContent('We couldn\'t save your booking. Please try again.');
  // Still on the booking page: the confirmation heading never appeared.
  expect(screen.getByRole('heading', { level: 1, name: 'Reserve a Table' })).toBeInTheDocument();
});

test('updateTimes gives no times for a cleared or incomplete date, without asking the API', () => {
  ['', '2026-10', '2026-1-5'].forEach((date) => {
    const result = updateTimes(['17:00'], { type: 'DATE_CHANGED', date });
    expect(result).toEqual([]);
  });
  expect(fetchAPI).not.toHaveBeenCalled();
});
