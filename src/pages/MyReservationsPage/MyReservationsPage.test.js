import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ReservationsProvider } from '../../context/ReservationsContext';
import MyReservationsPage from './MyReservationsPage';

// Fake saved bookings, deliberately out of order, so we can check the sorting.
// They're in 2099, so they stay "upcoming" whatever day the tests run.
const saved = [
  { id: 'b', date: '2099-10-10', time: '19:00', guests: 2, occasion: 'Anniversary' },
  { id: 'c', date: '2099-10-09', time: '20:00', guests: 1, occasion: 'Birthday' },
  { id: 'a', date: '2099-10-09', time: '18:00', guests: 4, occasion: 'Birthday' },
];

// Bookings that are always in the past.
const past = [
  { id: 'old1', date: '2020-03-14', time: '19:00', guests: 2, occasion: 'Birthday' },
  { id: 'old2', date: '2021-06-01', time: '18:00', guests: 3, occasion: 'Anniversary' },
];

beforeEach(() => {
  localStorage.clear();
});

// The page reads Context, and its empty state has a link, so it needs both the provider and a router.
function renderPage() {
  render(
    <MemoryRouter initialEntries={['/my-reservations']}>
      <ReservationsProvider>
        <MyReservationsPage />
      </ReservationsProvider>
    </MemoryRouter>
  );
}

function save(reservations) {
  localStorage.setItem('little-lemon-reservations', JSON.stringify(reservations));
}

// The reservation cards (the chips inside them are list items too, so they're filtered out).
function cards() {
  return screen.getAllByRole('listitem').filter((item) => item.classList.contains('reservation-card'));
}

test('with no reservations, says so and links to the booking page', () => {
  renderPage();

  expect(screen.getByRole('heading', { level: 1, name: 'My Reservations' })).toBeInTheDocument();
  expect(screen.getByText("You don't have any reservations yet.")).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservations');
  expect(document.title).toBe('My Reservations | Little Lemon');
});

test('has tabs to switch to the booking form, with this page marked as current', () => {
  renderPage();

  const tabs = screen.getByRole('navigation', { name: 'Reservations' });
  expect(within(tabs).getByRole('link', { name: 'My reservations' })).toHaveAttribute('aria-current', 'page');
  expect(within(tabs).getByRole('link', { name: 'Book a table' })).toHaveAttribute('href', '/reservations');
  expect(within(tabs).getByRole('link', { name: 'Book a table' })).not.toHaveAttribute('aria-current');
});

test('lists saved reservations by date, then time, with their details', () => {
  save(saved);
  renderPage();

  const rows = cards();
  expect(rows).toHaveLength(3);
  // Oct 9 at 18:00, then Oct 9 at 20:00, then Oct 10.
  expect(within(rows[0]).getByText('18:00')).toBeInTheDocument();
  expect(within(rows[0]).getByRole('list', { name: 'Details' })).toHaveTextContent('4 guestsBirthday');
  expect(within(rows[1]).getByText('20:00')).toBeInTheDocument();
  expect(within(rows[1]).getByText('1 guest')).toBeInTheDocument();
  expect(within(rows[2]).getByRole('heading', { name: 'Saturday, October 10, 2099' })).toBeInTheDocument();
});

test('splits bookings into Upcoming and Past, with the most recent past booking first', () => {
  save([...past, saved[0]]);
  renderPage();

  const upcoming = screen.getByRole('region', { name: 'Upcoming' });
  const pastGroup = screen.getByRole('region', { name: 'Past' });
  expect(within(upcoming).getByRole('heading', { name: 'Saturday, October 10, 2099' })).toBeInTheDocument();

  const pastDates = within(pastGroup).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
  expect(pastDates).toEqual(['Tuesday, June 1, 2021', 'Saturday, March 14, 2020']);
  // Past bookings are a record: they can't be cancelled.
  expect(within(pastGroup).queryByRole('button')).not.toBeInTheDocument();
});

test('with only past bookings, Upcoming offers to book a table', () => {
  save(past);
  renderPage();

  const upcoming = screen.getByRole('region', { name: 'Upcoming' });
  expect(within(upcoming).getByText('No upcoming reservations.')).toBeInTheDocument();
  expect(within(upcoming).getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservations');
});

test('Cancel asks first, and "Keep it" keeps the booking and returns focus to Cancel', () => {
  save(saved);
  renderPage();

  const cancel = screen.getByRole('button', { name: 'Cancel reservation for Friday, October 9, 2099 at 18:00' });
  fireEvent.click(cancel);

  // The question replaces the button, and focus goes to the safe answer.
  const question = screen.getByRole('group', { name: 'Cancel this reservation?' });
  expect(within(question).getByRole('button', { name: 'Keep it' })).toHaveFocus();
  // Nothing has been cancelled yet.
  expect(cards()).toHaveLength(3);

  fireEvent.click(within(question).getByRole('button', { name: 'Keep it' }));

  expect(screen.queryByRole('group', { name: 'Cancel this reservation?' })).not.toBeInTheDocument();
  expect(cards()).toHaveLength(3);
  expect(screen.getByRole('button', { name: 'Cancel reservation for Friday, October 9, 2099 at 18:00' })).toHaveFocus();
});

test('"Yes, cancel" removes that reservation, announces it and moves focus to the heading', () => {
  save(saved);
  renderPage();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel reservation for Friday, October 9, 2099 at 18:00' }));
  fireEvent.click(screen.getByRole('button', { name: 'Yes, cancel' }));

  expect(cards()).toHaveLength(2);
  expect(screen.queryByRole('button', { name: /at 18:00$/ })).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Reservation cancelled.');
  expect(screen.getByRole('heading', { level: 1, name: 'My Reservations' })).toHaveFocus();
  // The cancel is saved too, so it lasts after a reload.
  const stored = JSON.parse(localStorage.getItem('little-lemon-reservations'));
  expect(stored.map((r) => r.id)).toEqual(['b', 'c']);
});

test('cancelling the last reservation shows the empty message', () => {
  save([saved[0]]);
  renderPage();

  fireEvent.click(screen.getByRole('button', { name: /^Cancel reservation for/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Yes, cancel' }));

  expect(screen.getByText("You don't have any reservations yet.")).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Reservation cancelled.');
});

test('shows the name and seating when a booking has them', () => {
  save([{ ...saved[0], name: 'Test Guest', email: 'guest@example.com', seating: 'Indoor', requests: '' }]);
  renderPage();

  expect(screen.getByText('Booked for Test Guest')).toBeInTheDocument();
  expect(within(cards()[0]).getByRole('list', { name: 'Details' })).toHaveTextContent('Indoor');
});

test('a booking with "No special occasion" gets no occasion pill', () => {
  save([{ ...saved[0], occasion: 'No special occasion', seating: 'Indoor' }]);
  renderPage();

  const details = within(cards()[0]).getByRole('list', { name: 'Details' });
  expect(details).toHaveTextContent('2 guestsIndoor');
  expect(details).not.toHaveTextContent('No special occasion');
});
