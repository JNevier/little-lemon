import './BookingPage.css';
import BookingForm from '../../components/BookingForm/BookingForm';
import ReservationTabs from '../../components/ReservationTabs/ReservationTabs';

// A plain div, not <main>: Main already wraps every page in the site's one <main>.
// It doesn't use the times or reservations itself; it just passes them from Main down to the form.
function BookingPage({ availableTimes, dispatch, submitForm, reservations }) {
  return (
    <div className="booking-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Reserve a Table | Little Lemon</title>
      {/* A compact peach header: the title, one line, and the tabs to switch to My Reservations. */}
      <div className="page-header booking-page-header">
        <h1>Reserve a Table</h1>
        <p className="lead">Pick a date, time and party size, and we'll save you a table at Little Lemon.</p>
        <ReservationTabs />
      </div>
      <div className="booking-page-body">
        <BookingForm
          availableTimes={availableTimes}
          dispatch={dispatch}
          submitForm={submitForm}
          reservations={reservations}
        />
      </div>
    </div>
  );
}

export default BookingPage;
