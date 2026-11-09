import { useReducer } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import { fetchAPI, submitAPI } from '../../api';
import { fromInputDate, isInputDate } from '../../utils/dates';
import { useReservations } from '../../context/ReservationsContext';
import HomePage from '../../pages/HomePage/HomePage';
import BookingPage from '../../pages/BookingPage/BookingPage';
import ConfirmedBooking from '../../pages/ConfirmedBooking/ConfirmedBooking';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import MenuPage from '../../pages/MenuPage/MenuPage';
import AboutPage from '../../pages/AboutPage/AboutPage';
import MyReservationsPage from '../../pages/MyReservationsPage/MyReservationsPage';
import EditReservationPage from '../../pages/EditReservationPage/EditReservationPage';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

// Builds the starting list of available times: the times for today,
// because the date field also starts on today.
export function initializeTimes() {
  const today = new Date();
  return fetchAPI(today);
}

// The reducer: takes the current times and an action, returns the next times.
export function updateTimes(state, action) {
  if (action.type === 'DATE_CHANGED') {
    // A cleared or incomplete date isn't a real day: there are no times, and nothing to ask the API.
    if (!isInputDate(action.date)) {
      return [];
    }
    // action.date is the 'YYYY-MM-DD' string from the date input, but fetchAPI needs a Date.
    const date = fromInputDate(action.date);
    return fetchAPI(date);
  }
  // Any action we don't know about leaves the times unchanged.
  return state;
}

// The one <main> landmark for the whole site. The page that matches the URL is drawn inside it,
// so every page gets exactly one <main> without each page having to add its own.
function Main() {
  // The available times live here so the logic for "which times for which date" sits in one place.
  const [availableTimes, dispatch] = useReducer(updateTimes, undefined, initializeTimes);
  // A function that changes the page from code, like clicking a link. Hooks go at the top level.
  const navigate = useNavigate();
  // The current address. The error boundary uses it to try again when the visitor goes to another page.
  const { pathname } = useLocation();
  // The bookings saved in this browser, from the ReservationsProvider in App.js.
  const { reservations, addReservation, updateReservation } = useReservations();

  // Sends the booking to the API. If it's accepted, show the confirmation page.
  // Returns whether it was saved, so the form can tell the user when it wasn't.
  function submitForm(formData) {
    const saved = submitAPI(formData);
    if (saved) {
      // Remember it in this browser, so it shows on My Reservations and its time can't be booked twice.
      addReservation(formData);
      // Carry the booking to the next page, so it can show what was booked.
      navigate('/confirmed', { state: { booking: formData } });
    }
    return saved;
  }

  // Saves the changes to an existing booking: the same steps as submitForm, but it updates the booking
  // with this id instead of adding a new one, and tells the confirmation page it was an update.
  function updateForm(id, formData) {
    const saved = submitAPI(formData);
    if (saved) {
      updateReservation(id, formData);
      navigate('/confirmed', { state: { booking: formData, updated: true } });
    }
    return saved;
  }

  return (
    // id: the skip link's target. tabIndex={-1}: code can move focus here (the skip link does),
    // but it isn't added to the Tab order, because it isn't a control you operate.
    <main id="main-content" tabIndex={-1}>
      {/* If a page throws an error while drawing, the boundary shows "Something went wrong" here,
          instead of the whole site going blank. The header and footer are outside it, so they stay. */}
      <ErrorBoundary resetKey={pathname}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/reservations"
            element={
              <BookingPage
                availableTimes={availableTimes}
                dispatch={dispatch}
                submitForm={submitForm}
                reservations={reservations}
              />
            }
          />
          {/* ":id" is a variable part of the address: /reservations/abc-123/edit changes the booking abc-123. */}
          <Route
            path="/reservations/:id/edit"
            element={
              <EditReservationPage
                availableTimes={availableTimes}
                dispatch={dispatch}
                updateForm={updateForm}
                reservations={reservations}
              />
            }
          />
          <Route path="/confirmed" element={<ConfirmedBooking />} />
          <Route path="/my-reservations" element={<MyReservationsPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </main>
  );
}

export default Main;
