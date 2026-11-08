import './BookingPage.css';
import BookingForm from '../../components/BookingForm/BookingForm';

// A section, not <main>: Main already wraps every page in the site's one <main>.
// It doesn't use the times or reservations itself; it just passes them from Main down to the form.
function BookingPage({ availableTimes, dispatch, submitForm, reservations }) {
  return (
    <section className="booking-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Reserve a Table | Little Lemon</title>
      <h1>Reserve a Table</h1>
      <p>Pick a date, time and party size, and we'll save you a table at Little Lemon.</p>
      <BookingForm
        availableTimes={availableTimes}
        dispatch={dispatch}
        submitForm={submitForm}
        reservations={reservations}
      />
    </section>
  );
}

export default BookingPage;
