import './MyReservationsPage.css';
import { useState, useRef } from 'react';
import { useReservations } from '../../context/ReservationsContext';
import { formatLongDate } from '../../utils/dates';
import LinkButton from '../../components/LinkButton/LinkButton';

// Puts reservations in order: earliest date first, and on the same date, earliest time first.
// 'YYYY-MM-DD' and 'HH:MM' text sorts in the right order when compared as plain text.
function byDateThenTime(a, b) {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}

// A section, not <main>: Main already wraps every page in the site's one <main>.
function MyReservationsPage() {
  // Read straight from Context: no props needed, wherever this page sits.
  const { reservations, cancelReservation } = useReservations();
  // The message read out after a cancel. Empty until something happens.
  const [message, setMessage] = useState('');
  // A handle on the h1, so focus can go there after a cancel (see handleCancel).
  const headingRef = useRef(null);

  // [...reservations] makes a copy first, because sort() changes the array it's called on,
  // and we must never change state directly.
  const sorted = [...reservations].sort(byDateThenTime);

  function handleCancel(id) {
    cancelReservation(id);
    setMessage('Reservation cancelled.');
    // The Cancel button that had focus is now gone. Without this, focus would fall back to the top of
    // the page, and keyboard users would have to find their place again. The heading is a safe spot.
    headingRef.current.focus();
  }

  return (
    <section className="my-reservations-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>My Reservations | Little Lemon</title>
      {/* tabIndex={-1}: code can focus the heading, but it isn't added to the Tab order. */}
      <h1 tabIndex={-1} ref={headingRef}>My Reservations</h1>
      <p>Bookings made in this browser. They're saved on this device only.</p>

      {/* role="status": screen readers read the message out politely when it changes.
          The <p> is always there (empty at first), because some screen readers miss a status
          region that appears at the same moment as its text. */}
      <p role="status" className="my-reservations-page-status">{message}</p>

      {sorted.length === 0 ? (
        <div className="my-reservations-page-empty">
          <p>You don't have any reservations yet.</p>
          <LinkButton to="/reservations">Reserve a Table</LinkButton>
        </div>
      ) : (
        <ul className="my-reservations-page-list">
          {sorted.map((reservation) => {
            const dateText = formatLongDate(reservation.date);
            const guestsText = reservation.guests === 1 ? '1 guest' : `${reservation.guests} guests`;
            return (
              <li key={reservation.id} className="my-reservations-page-item">
                <div>
                  <h2 className="my-reservations-page-date">{dateText}</h2>
                  <p className="my-reservations-page-details">
                    {reservation.time} · {guestsText} · {reservation.occasion}
                  </p>
                </div>
                <button
                  type="button"
                  className="my-reservations-page-cancel"
                  // Every row has a "Cancel" button, so the label adds which booking it cancels.
                  // It starts with the visible word "Cancel", so voice control ("click Cancel") still works.
                  aria-label={`Cancel reservation for ${dateText} at ${reservation.time}`}
                  onClick={() => handleCancel(reservation.id)}
                >
                  Cancel
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default MyReservationsPage;
