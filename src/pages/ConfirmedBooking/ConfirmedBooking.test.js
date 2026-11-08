import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ConfirmedBooking from './ConfirmedBooking';

// A fixed booking, so the test never depends on today's date.
const booking = { date: '2026-10-09', time: '18:00', guests: 4, occasion: 'Birthday' };

// Renders the page as if we arrived at /confirmed. Pass a booking to fake a real submit;
// leave it out to fake typing the URL directly.
function setupPage(state) {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/confirmed', state }]}>
      <ConfirmedBooking />
    </MemoryRouter>
  );
}

describe('after a real booking', () => {
  test('shows the booking details', () => {
    setupPage({ booking });
    expect(screen.getByText('Friday, October 9, 2026')).toBeInTheDocument();
    expect(screen.getByText('18:00')).toBeInTheDocument();
    expect(screen.getByText('4 guests')).toBeInTheDocument();
  });

  test('moves focus to the heading and sets the tab title', () => {
    setupPage({ booking });
    expect(screen.getByRole('heading', { level: 1, name: 'Booking Confirmed' })).toHaveFocus();
    expect(document.title).toBe('Booking Confirmed | Little Lemon');
  });
});

describe('on a direct visit', () => {
  test('says no booking was made and links to the booking page', () => {
    setupPage(); // no state at all
    expect(screen.getByRole('heading', { level: 1, name: 'You haven\'t made a booking yet' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservations');
    expect(screen.queryByText(/your table at little lemon is reserved/i)).not.toBeInTheDocument();
  });
});

describe('with contact details', () => {
  test('thanks the guest by name and shows the seating and request', () => {
    // Fake details (not a real person).
    setupPage({
      booking: { ...booking, name: 'Test Guest', email: 'guest@example.com', seating: 'Outdoor', requests: 'A high chair, please.' },
    });
    expect(screen.getByText(/thank you, test guest!/i)).toBeInTheDocument();
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
    expect(screen.getByText('Your request: A high chair, please.')).toBeInTheDocument();
  });

  test('an older booking without a name still reads naturally', () => {
    setupPage({ booking });
    expect(screen.getByText(/^thank you! your table/i)).toBeInTheDocument();
    expect(screen.queryByText(/seating/i)).not.toBeInTheDocument();
  });
});
