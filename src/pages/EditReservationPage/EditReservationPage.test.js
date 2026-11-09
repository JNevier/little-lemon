import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import EditReservationPage from './EditReservationPage';
import { toInputDate } from '../../utils/dates';

// A date a few days ahead, so the booking is always "upcoming" whatever day the test runs.
function daysAhead(n) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return toInputDate(date);
}

// Fake bookings (not real people). Two on the same day: "mine" at 19:00 and someone else's at 20:00.
const mine = {
  id: 'mine', date: daysAhead(5), time: '19:00', guests: 4, occasion: 'Anniversary',
  seating: 'Outdoor', name: 'Test Guest', email: 'guest@example.com', requests: 'A quiet table, please.',
};
const other = { ...mine, id: 'other', time: '20:00' };
const past = { ...mine, id: 'past', date: '2020-03-14' };

// The page reads the id from the address, so it's drawn inside a route with ":id", like in Main.
function renderEditPage(id, updateForm = jest.fn()) {
  render(
    <MemoryRouter initialEntries={[`/reservations/${id}/edit`]}>
      <Routes>
        <Route
          path="/reservations/:id/edit"
          element={
            <EditReservationPage
              availableTimes={['18:00', '19:00', '20:00']}
              dispatch={jest.fn()}
              updateForm={updateForm}
              reservations={[mine, other, past]}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
  return updateForm;
}

test('shows the booking form filled in with the booking, with its own title and button', () => {
  renderEditPage('mine');

  expect(screen.getByRole('heading', { level: 1, name: 'Change your reservation' })).toHaveFocus();
  expect(document.title).toBe('Change your reservation | Little Lemon');
  expect(screen.getByRole('form', { name: 'Change your reservation' })).toBeInTheDocument();
  expect(screen.getByLabelText('Choose date')).toHaveValue(mine.date);
  expect(screen.getByLabelText('Choose time')).toHaveValue('19:00');
  expect(screen.getByLabelText('Number of guests')).toHaveValue(4);
  expect(screen.getByLabelText('Occasion')).toHaveValue('Anniversary');
  expect(screen.getByRole('radio', { name: 'Outdoor' })).toBeChecked();
  expect(screen.getByLabelText('Full name')).toHaveValue('Test Guest');
  expect(screen.getByLabelText('Email')).toHaveValue('guest@example.com');
  expect(screen.getByLabelText('Special requests (optional)')).toHaveValue('A quiet table, please.');
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Confirm reservation' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /back to my reservations/i })).toHaveAttribute('href', '/my-reservations');
});

test('the booking\'s own time stays available, but another booking\'s time is hidden', () => {
  renderEditPage('mine');

  const offered = [...screen.getByLabelText('Choose time').options].map((o) => o.value);
  // 19:00 is this booking's own slot: still offered. 20:00 belongs to the other booking: hidden.
  expect(offered).toEqual(['18:00', '19:00']);
});

test('saving sends the changes for this booking\'s id', () => {
  const updateForm = renderEditPage('mine');

  fireEvent.change(screen.getByLabelText('Choose time'), { target: { value: '18:00' } });
  fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

  expect(updateForm).toHaveBeenCalledTimes(1);
  expect(updateForm).toHaveBeenCalledWith('mine', {
    date: mine.date,
    time: '18:00',
    guests: 2,
    occasion: 'Anniversary',
    seating: 'Outdoor',
    name: 'Test Guest',
    email: 'guest@example.com',
    requests: 'A quiet table, please.',
  });
});

test('an unknown id shows a friendly card with a way back, not a blank page', () => {
  renderEditPage('no-such-booking');

  expect(screen.getByRole('heading', { level: 1, name: "We couldn't find that reservation" })).toHaveFocus();
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to my reservations' })).toHaveAttribute('href', '/my-reservations');
});

test('a past booking can\'t be changed', () => {
  renderEditPage('past');

  expect(screen.getByRole('heading', { level: 1, name: "This reservation is in the past and can't be changed" })).toBeInTheDocument();
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
});
