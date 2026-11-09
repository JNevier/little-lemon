import './MyReservationsPage.css';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useReservations } from '../../context/ReservationsContext';
import { formatLongDate, fromInputDate, toInputDate } from '../../utils/dates';
import LinkButton from '../../components/LinkButton/LinkButton';
import ReservationTabs from '../../components/ReservationTabs/ReservationTabs';
import { formatGuests } from '../../components/ReservationSummary/ReservationSummary';
import { NO_OCCASION } from '../../components/BookingForm/validation';

// Puts reservations in order: earliest date first, and on the same date, earliest time first.
// 'YYYY-MM-DD' and 'HH:MM' text sorts in the right order when compared as plain text.
function byDateThenTime(a, b) {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
}

// One booking as a card: a date badge, the full date, the time, small "chips" for the details,
// and the name. Upcoming bookings can be changed, or cancelled with a "Are you sure?" step first.
function ReservationCard({ reservation, isPast, isConfirming, onAskCancel, onKeep, onConfirmCancel }) {
  const { id, date, time, guests, occasion, seating, name } = reservation;
  const dateText = formatLongDate(date);
  const day = fromInputDate(date);

  return (
    <li className={isPast ? 'reservation-card reservation-card-past' : 'reservation-card'}>
      {/* The badge repeats the date in short form ("9 OCT"), so it's hidden from screen readers:
          they read the full date in the heading next to it. */}
      <div className="reservation-card-badge" aria-hidden="true">
        <span className="reservation-card-day">{day.getDate()}</span>
        <span className="reservation-card-month">
          {day.toLocaleDateString('en-US', { month: 'short' })}
        </span>
      </div>

      <div className="reservation-card-body">
        <h3 className="reservation-card-date">{dateText}</h3>
        <p className="reservation-card-time">{time}</p>
        {/* The details as small pills. filter(Boolean) drops missing ones (older bookings have no seating).
            "No special occasion" becomes null first, so it's dropped too: only real occasions get a pill. */}
        <ul className="reservation-card-chips" aria-label="Details">
          {[formatGuests(guests), occasion === NO_OCCASION ? null : occasion, seating].filter(Boolean).map((detail) => (
            <li key={detail} className="tag">{detail}</li>
          ))}
        </ul>
        {name && <p className="reservation-card-name">Booked for {name}</p>}
      </div>

      {/* Only upcoming bookings can be cancelled. Past ones are kept as a record. */}
      {!isPast && (
        <div className="reservation-card-actions">
          {isConfirming ? (
            // NEW: an inline confirmation. Instead of deleting straight away (easy to do by mistake),
            // the Cancel button is replaced by a question and two answers, right where the user is looking.
            // role="group" + aria-labelledby: screen readers read the question with the buttons.
            <div className="reservation-card-confirm" role="group" aria-labelledby={`confirm-${id}`}>
              <p id={`confirm-${id}`} className="reservation-card-question">Cancel this reservation?</p>
              <div className="reservation-card-answers">
                <button type="button" className="button button-danger" onClick={() => onConfirmCancel(id)}>
                  Yes, cancel
                </button>
                <button type="button" id={`keep-${id}`} className="button button-secondary" onClick={() => onKeep(id)}>
                  Keep it
                </button>
              </div>
            </div>
          ) : (
            // Two actions side by side: Change (a link, because it opens another page) and Cancel (a button).
            <div className="reservation-card-buttons">
              <Link
                to={`/reservations/${id}/edit`}
                className="button button-secondary"
                // Every card has a "Change" link, so the label says which booking it changes.
                // It starts with the visible word "Change", so voice control ("click Change") still works.
                aria-label={`Change reservation for ${dateText} at ${time}`}
              >
                Change
              </Link>
              <button
                type="button"
                id={`cancel-${id}`}
                className="button button-secondary"
                // Every card has a "Cancel" button, so the label adds which booking it cancels.
                // It starts with the visible word "Cancel", so voice control ("click Cancel") still works.
                aria-label={`Cancel reservation for ${dateText} at ${time}`}
                onClick={() => onAskCancel(id)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// A plain div, not <main>: Main already wraps every page in the site's one <main>.
function MyReservationsPage() {
  // Read straight from Context: no props needed, wherever this page sits.
  const { reservations, cancelReservation } = useReservations();
  // The message read out after a cancel. Empty until something happens.
  const [message, setMessage] = useState('');
  // The booking whose "Cancel this reservation?" question is showing (only one at a time), or null.
  const [confirmingId, setConfirmingId] = useState(null);
  // A handle on the h1, so focus can go there after a cancel (see handleConfirmCancel).
  const headingRef = useRef(null);
  // The id of a button to focus after the next render. A ref, not state: changing it shouldn't redraw the page.
  const focusAfterRender = useRef(null);

  // Runs after every render. When a button was asked for, focus it now that it's on screen.
  // (The "Keep it" button only exists after React has drawn the question, so it can't be focused earlier.)
  useEffect(() => {
    if (focusAfterRender.current) {
      document.getElementById(focusAfterRender.current)?.focus();
      focusAfterRender.current = null;
    }
  });

  // Today as 'YYYY-MM-DD'. A booking for today still counts as upcoming.
  const today = toInputDate(new Date());
  // [...reservations] makes a copy first, because sort() changes the array it's called on,
  // and we must never change state directly.
  const sorted = [...reservations].sort(byDateThenTime);
  const upcoming = sorted.filter((reservation) => reservation.date >= today);
  // Past bookings: the most recent first, so last week comes before last year.
  const past = sorted.filter((reservation) => reservation.date < today).reverse();

  function handleAskCancel(id) {
    setConfirmingId(id);
    setMessage('');
    // Focus the safe answer, "Keep it", so pressing Enter twice by accident doesn't cancel anything.
    focusAfterRender.current = `keep-${id}`;
  }

  function handleKeep(id) {
    setConfirmingId(null);
    // Back to the Cancel button the user started from.
    focusAfterRender.current = `cancel-${id}`;
  }

  function handleConfirmCancel(id) {
    cancelReservation(id);
    setConfirmingId(null);
    setMessage('Reservation cancelled.');
    // The card that had focus is now gone. Without this, focus would fall back to the top of
    // the page, and keyboard users would have to find their place again. The heading is a safe spot.
    headingRef.current.focus();
  }

  // The same props for every card in both lists.
  function renderCard(reservation, isPast) {
    return (
      <ReservationCard
        key={reservation.id}
        reservation={reservation}
        isPast={isPast}
        isConfirming={confirmingId === reservation.id}
        onAskCancel={handleAskCancel}
        onKeep={handleKeep}
        onConfirmCancel={handleConfirmCancel}
      />
    );
  }

  return (
    // page-fill: the page takes all the height between the header and the footer (see index.css),
    // so a short list doesn't leave a white strip above the footer.
    <div className="my-reservations-page page-fill">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>My Reservations | Little Lemon</title>
      <div className="page-header my-reservations-page-header">
        {/* tabIndex={-1}: code can focus the heading, but it isn't added to the Tab order. */}
        <h1 tabIndex={-1} ref={headingRef}>My Reservations</h1>
        <p className="lead">Bookings made in this browser. They're saved on this device only.</p>
        <ReservationTabs />
      </div>

      <div className="my-reservations-page-body">
        {/* role="status": screen readers read the message out politely when it changes.
            The <p> is always there (empty at first), because some screen readers miss a status
            region that appears at the same moment as its text. */}
        <p role="status" className="my-reservations-page-status">{message}</p>

        {sorted.length === 0 ? (
          <div className="card my-reservations-page-empty">
            <p>You don't have any reservations yet.</p>
            <LinkButton to="/reservations">Reserve a Table</LinkButton>
          </div>
        ) : (
          <>
            <section className="my-reservations-page-group" aria-labelledby="upcoming-title">
              <h2 id="upcoming-title">Upcoming</h2>
              {upcoming.length === 0 ? (
                <div className="card my-reservations-page-empty">
                  <p>No upcoming reservations.</p>
                  <LinkButton to="/reservations">Reserve a Table</LinkButton>
                </div>
              ) : (
                <ul className="my-reservations-page-list">
                  {upcoming.map((reservation) => renderCard(reservation, false))}
                </ul>
              )}
            </section>

            {past.length > 0 && (
              <section className="my-reservations-page-group" aria-labelledby="past-title">
                <h2 id="past-title">Past</h2>
                <ul className="my-reservations-page-list">
                  {past.map((reservation) => renderCard(reservation, true))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyReservationsPage;
