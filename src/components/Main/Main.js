import { useReducer } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { fetchAPI, submitAPI } from '../../api';
import { fromInputDate, isInputDate } from '../../utils/dates';
import HomePage from '../../pages/HomePage/HomePage';
import BookingPage from '../../pages/BookingPage/BookingPage';
import ConfirmedBooking from '../../pages/ConfirmedBooking/ConfirmedBooking';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import MenuPage from '../../pages/MenuPage/MenuPage';

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

  // Sends the booking to the API. If it's accepted, show the confirmation page.
  // Returns whether it was saved, so the form can tell the user when it wasn't.
  function submitForm(formData) {
    const saved = submitAPI(formData);
    if (saved) {
      // Carry the booking to the next page, so it can show what was booked.
      navigate('/confirmed', { state: { booking: formData } });
    }
    return saved;
  }

  return (
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/reservations"
          element={<BookingPage availableTimes={availableTimes} dispatch={dispatch} submitForm={submitForm} />}
        />
        <Route path="/confirmed" element={<ConfirmedBooking />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
}

export default Main;
