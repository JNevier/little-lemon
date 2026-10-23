import './ConfirmedBooking.css';
import { useLocation } from 'react-router';
import LinkButton from '../../components/LinkButton/LinkButton';
import { fromInputDate } from '../../utils/dates';

// A section, not <main>: Main already wraps every page in the site's one <main>.
function ConfirmedBooking() {
  // The booking that Main sent with navigate(). Typing /confirmed into the address bar sends nothing.
  const location = useLocation();
  const booking = location.state?.booking;

  // Direct visit: no booking was made, so don't claim one was.
  if (!booking) {
    return (
      <section className="confirmed-booking">
        {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
        <title>No Booking Yet | Little Lemon</title>
        <h1 tabIndex={-1} ref={(heading) => heading?.focus()}>You haven't made a booking yet</h1>
        <p>Please go to the reservations page to make a booking.</p>
        <LinkButton to="/reservations">Reserve a Table</LinkButton>
      </section>
    );
  }

  // Built from parts in local time (never new Date('YYYY-MM-DD')), so the day can't shift.
  // 'en-US' keeps the wording the same on every computer, e.g. "Friday, October 9, 2026".
  const dateText = fromInputDate(booking.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const guestsText = booking.guests === 1 ? '1 guest' : `${booking.guests} guests`;

  return (
    <section className="confirmed-booking">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Booking Confirmed | Little Lemon</title>
      {/* tabIndex={-1}: code can focus the heading, but it isn't added to the Tab order.
          The ref callback runs when the h1 appears and moves focus there, so screen readers
          announce the new page. */}
      <h1 tabIndex={-1} ref={(heading) => heading?.focus()}>Booking Confirmed</h1>
      <p>Thank you! Your table at Little Lemon is reserved. We look forward to seeing you.</p>
      <p>
        <strong>{dateText}</strong> at <strong>{booking.time}</strong> for <strong>{guestsText}</strong>.
      </p>
      <LinkButton to="/">Back to Home</LinkButton>
    </section>
  );
}

export default ConfirmedBooking;
