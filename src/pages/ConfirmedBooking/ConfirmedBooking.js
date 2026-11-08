import './ConfirmedBooking.css';
import { useLocation } from 'react-router';
import LinkButton from '../../components/LinkButton/LinkButton';
import ReservationSummary from '../../components/ReservationSummary/ReservationSummary';

// A big check mark in a green circle: the "success" signal. It's decoration (aria-hidden),
// because the heading says the same thing in words.
function CheckIcon() {
  return (
    <svg className="confirmed-booking-icon" viewBox="0 0 48 48" width="64" height="64" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="24" fill="currentColor" />
      <path d="M14 25l7 7 13-15" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A plain div, not <main>: Main already wraps every page in the site's one <main>.
function ConfirmedBooking() {
  // The booking that Main sent with navigate(). Typing /confirmed into the address bar sends nothing.
  const location = useLocation();
  const booking = location.state?.booking;

  // Direct visit: no booking was made, so don't claim one was.
  if (!booking) {
    return (
      <div className="confirmed-booking">
        {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
        <title>No Booking Yet | Little Lemon</title>
        <div className="card confirmed-booking-card">
          <h1 tabIndex={-1} ref={(heading) => heading?.focus()}>You haven't made a booking yet</h1>
          <p>Please go to the reservations page to make a booking.</p>
          <LinkButton to="/reservations">Reserve a Table</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmed-booking">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Booking Confirmed | Little Lemon</title>
      <div className="card confirmed-booking-card">
        <CheckIcon />
        {/* tabIndex={-1}: code can focus the heading, but it isn't added to the Tab order.
            The ref callback runs when the h1 appears and moves focus there, so screen readers
            announce the new page. */}
        <h1 tabIndex={-1} ref={(heading) => heading?.focus()}>You're booked</h1>
        {/* Bookings made before the form asked for a name don't have one, so the name is optional here. */}
        <p className="lead">
          Thank you{booking.name ? `, ${booking.name}` : ''}! Your table at Little Lemon is reserved.
          We look forward to seeing you.
        </p>
        {/* The same summary as beside the booking form, so the guest sees exactly what they chose.
            (It doesn't show the email: that's private, and the guest just typed it.) */}
        <ReservationSummary booking={booking} />
        <p className="confirmed-booking-note">We hold your table for 15 minutes after your booking time.</p>
        {/* Two next steps: the main one (yellow) and a second one (outline). */}
        <div className="confirmed-booking-actions">
          <LinkButton to="/my-reservations">View my reservations</LinkButton>
          <LinkButton to="/reservations" variant="secondary">Book another table</LinkButton>
        </div>
      </div>
    </div>
  );
}

export default ConfirmedBooking;
