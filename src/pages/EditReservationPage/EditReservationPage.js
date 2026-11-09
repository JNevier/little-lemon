import './EditReservationPage.css';
import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import BookingForm from '../../components/BookingForm/BookingForm';
import { toInputDate } from '../../utils/dates';

// A friendly card instead of the form, for a booking that can't be changed.
function NotChangeable({ title, text, headingRef }) {
  return (
    <div className="edit-reservation-page-card card">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Change your reservation | Little Lemon</title>
      {/* tabIndex={-1}: the page's effect can move focus to this heading, so screen readers announce it. */}
      <h1 tabIndex={-1} ref={headingRef}>{title}</h1>
      <p>{text}</p>
      <Link to="/my-reservations" className="button button-primary">Back to my reservations</Link>
    </div>
  );
}

// Change a saved booking: the same three-step form as a new booking, filled in with this booking.
// The address is /reservations/<id>/edit. Main passes the same props as the booking page, plus
// updateForm (to save the change) instead of submitForm.
function EditReservationPage({ availableTimes, dispatch, updateForm, reservations }) {
  // NEW: useParams reads the variable parts of the address. The route is "/reservations/:id/edit",
  // so for /reservations/abc-123/edit, id is "abc-123".
  const { id } = useParams();
  const reservation = reservations.find((r) => r.id === id);
  const today = toInputDate(new Date());

  // A handle on the heading, so focus can move there once, when the page opens (as other pages do).
  // A ref + an effect that runs once, not a ref callback: this page re-renders while you edit
  // (for example when the times change), and focus must not jump back to the heading each time.
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!reservation) {
    return (
      <div className="edit-reservation-page page-fill">
        <NotChangeable
          title="We couldn't find that reservation"
          text="It may have been cancelled, or it was made in another browser."
          headingRef={headingRef}
        />
      </div>
    );
  }

  // Past bookings are kept as a record and can't be changed (like they can't be cancelled).
  if (reservation.date < today) {
    return (
      <div className="edit-reservation-page page-fill">
        <NotChangeable
          title="This reservation is in the past and can't be changed"
          text="You can see it under Past on My Reservations, or book a new table."
          headingRef={headingRef}
        />
      </div>
    );
  }

  return (
    <div className="edit-reservation-page">
      <title>Change your reservation | Little Lemon</title>
      <div className="page-header">
        <h1 tabIndex={-1} ref={headingRef}>Change your reservation</h1>
        <p className="lead">Change anything below, then save. Your booking keeps its place in My Reservations.</p>
        <Link to="/my-reservations" className="edit-reservation-page-back">
          <span aria-hidden="true">←</span> Back to my reservations
        </Link>
      </div>
      <div className="edit-reservation-page-body">
        <BookingForm
          availableTimes={availableTimes}
          dispatch={dispatch}
          // Saving sends the new details for THIS booking's id.
          submitForm={(formData) => updateForm(id, formData)}
          // Every other booking, but not this one: its own time slot must stay free to choose.
          // Without this, the form would hide the booking's own time as "already booked".
          reservations={reservations.filter((r) => r.id !== id)}
          initialValues={reservation}
          submitLabel="Save changes"
          formLabel="Change your reservation"
        />
      </div>
    </div>
  );
}

export default EditReservationPage;
