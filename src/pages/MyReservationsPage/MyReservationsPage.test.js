import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ReservationsProvider } from '../../context/ReservationsContext';
import MyReservationsPage from './MyReservationsPage';

// Fake saved bookings, deliberately out of order, so we can check the sorting.
const saved = [
  { id: 'b', date: '2026-10-10', time: '19:00', guests: 2, occasion: 'Anniversary' },
  { id: 'c', date: '2026-10-09', time: '20:00', guests: 1, occasion: 'Birthday' },
  { id: 'a', date: '2026-10-09', time: '18:00', guests: 4, occasion: 'Birthday' },
];

beforeEach(() => {
  localStorage.clear();
});

// The page reads Context, and its empty state has a link, so it needs both the provider and a router.
function renderPage() {
  render(
    <MemoryRouter>
      <ReservationsProvider>
        <MyReservationsPage />
      </ReservationsProvider>
    </MemoryRouter>
  );
}

test('with no reservations, says so and links to the booking page', () => {
  renderPage();

  expect(screen.getByRole('heading', { level: 1, name: 'My Reservations' })).toBeInTheDocument();
  expect(screen.getByText("You don't have any reservations yet.")).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservations');
  expect(document.title).toBe('My Reservations | Little Lemon');
});

test('lists saved reservations by date, then time, with their details', () => {
  localStorage.setItem('little-lemon-reservations', JSON.stringify(saved));
  renderPage();

  const rows = screen.getAllByRole('listitem');
  expect(rows).toHaveLength(3);
  // Oct 9 at 18:00, then Oct 9 at 20:00, then Oct 10.
  expect(within(rows[0]).getByText('18:00 · 4 guests · Birthday')).toBeInTheDocument();
  expect(within(rows[1]).getByText('20:00 · 1 guest · Birthday')).toBeInTheDocument();
  expect(within(rows[2]).getByRole('heading', { name: 'Saturday, October 10, 2026' })).toBeInTheDocument();
});

test('Cancel removes that reservation, announces it and moves focus to the heading', () => {
  localStorage.setItem('little-lemon-reservations', JSON.stringify(saved));
  renderPage();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel reservation for Friday, October 9, 2026 at 18:00' }));

  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.queryByRole('button', { name: /at 18:00$/ })).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Reservation cancelled.');
  expect(screen.getByRole('heading', { level: 1, name: 'My Reservations' })).toHaveFocus();
  // The cancel is saved too, so it lasts after a reload.
  const stored = JSON.parse(localStorage.getItem('little-lemon-reservations'));
  expect(stored.map((r) => r.id)).toEqual(['b', 'c']);
});

test('cancelling the last reservation shows the empty message', () => {
  localStorage.setItem('little-lemon-reservations', JSON.stringify([saved[0]]));
  renderPage();

  fireEvent.click(screen.getByRole('button', { name: /^Cancel reservation for/ }));

  expect(screen.getByText("You don't have any reservations yet.")).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Reservation cancelled.');
});

test('shows the name and seating when a booking has them', () => {
  localStorage.setItem(
    'little-lemon-reservations',
    JSON.stringify([{ ...saved[0], name: 'Test Guest', email: 'guest@example.com', seating: 'Indoor', requests: '' }])
  );
  renderPage();

  expect(screen.getByText('Test Guest · Indoor')).toBeInTheDocument();
});
