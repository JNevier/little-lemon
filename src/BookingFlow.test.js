import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';
import { fetchAPI, submitAPI } from './api';
import { toInputDate } from './utils/dates';

// One test that walks through the whole booking journey, the way a visitor would.
// The course API is replaced by a fake, so the times don't depend on today's date.
jest.mock('./api');

beforeEach(() => {
  localStorage.clear();
});

function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

// Tomorrow as 'YYYY-MM-DD' (always a valid, future date).
function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toInputDate(date);
}

// The time options the form currently offers.
function offeredTimes() {
  return [...screen.getByLabelText('Choose time').options].map((option) => option.value);
}

test('book a table, see it after a reload, cancel it, and get the time back', () => {
  // CRA resets mocks before each test, so the answers are set here.
  fetchAPI.mockReturnValue(['17:00', '18:00']);
  submitAPI.mockReturnValue(true);
  const date = tomorrow();

  // 1. Book tomorrow at 18:00.
  const firstVisit = renderAppAt('/reservations');
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: date } });
  fireEvent.change(screen.getByLabelText('Choose time'), { target: { value: '18:00' } });
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test Guest' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'guest@example.com' } });
  fireEvent.click(screen.getByRole('radio', { name: 'Indoor' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));
  expect(screen.getByRole('heading', { level: 1, name: "You're booked" })).toBeInTheDocument();

  // 2. "Reload": throw the whole app away and start it again. The booking comes back from storage.
  firstVisit.unmount();
  renderAppAt('/my-reservations');
  const rows = screen.getAllByRole('listitem').filter((row) => row.classList.contains('reservation-card'));
  expect(rows).toHaveLength(1);
  expect(within(rows[0]).getByText(/18:00/)).toBeInTheDocument();

  // 3. On the booking form, 18:00 is gone for that date.
  // "Reserve a Table" can appear more than once on a page (header, empty state); the first one is in the header.
  fireEvent.click(screen.getAllByRole('link', { name: 'Reserve a Table' })[0]);
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: date } });
  expect(offeredTimes()).toEqual(['17:00']);

  // 4. Cancel it on My Reservations (switch with the tab, then confirm the cancel).
  fireEvent.click(screen.getByRole('link', { name: 'My reservations' }));
  fireEvent.click(screen.getByRole('button', { name: /^Cancel reservation for .* at 18:00$/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Yes, cancel' }));
  expect(screen.getByRole('status')).toHaveTextContent('Reservation cancelled.');
  expect(screen.getByText("You don't have any reservations yet.")).toBeInTheDocument();

  // 5. Back on the form, 18:00 is offered again.
  fireEvent.click(screen.getAllByRole('link', { name: 'Reserve a Table' })[0]);
  fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: date } });
  expect(offeredTimes()).toEqual(['17:00', '18:00']);
});

test('a direct visit to /confirmed still says no booking was made', () => {
  fetchAPI.mockReturnValue(['17:00']);
  renderAppAt('/confirmed');
  expect(screen.getByRole('heading', { level: 1, name: "You haven't made a booking yet" })).toBeInTheDocument();
});

test('broken saved data does not crash the app', () => {
  fetchAPI.mockReturnValue(['17:00']);
  localStorage.setItem('little-lemon-reservations', '{broken');

  renderAppAt('/my-reservations');

  expect(screen.getByText("You don't have any reservations yet.")).toBeInTheDocument();
});

describe('the time list always matches the date the form shows', () => {
  // Today and every other day get different times, so stale times are easy to spot.
  const todayTimes = ['17:00', '18:00'];
  const otherDayTimes = ['20:00', '21:00'];

  beforeEach(() => {
    const today = toInputDate(new Date());
    fetchAPI.mockImplementation((date) => (toInputDate(date) === today ? todayTimes : otherDayTimes));
    submitAPI.mockReturnValue(true);
  });

  test('after booking a later date, "Book another table" shows today with today\'s times', () => {
    renderAppAt('/reservations');
    fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: tomorrow() } });
    expect(offeredTimes()).toEqual(otherDayTimes);
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test Guest' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'guest@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));

    fireEvent.click(screen.getByRole('link', { name: 'Book another table' }));

    expect(screen.getByLabelText('Choose date')).toHaveValue(toInputDate(new Date()));
    expect(offeredTimes()).toEqual(todayTimes);
  });

  test('after picking a later date, going to the Menu and back shows today with today\'s times', () => {
    // The Menu page loads its dishes with fetch. This fake never answers: no menu data is needed here.
    global.fetch = jest.fn(() => new Promise(() => {}));
    renderAppAt('/reservations');
    fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: tomorrow() } });
    expect(offeredTimes()).toEqual(otherDayTimes);

    fireEvent.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Menu' }));
    fireEvent.click(screen.getAllByRole('link', { name: 'Reserve a Table' })[0]);

    expect(screen.getByLabelText('Choose date')).toHaveValue(toInputDate(new Date()));
    expect(offeredTimes()).toEqual(todayTimes);
    delete global.fetch;
  });
});
