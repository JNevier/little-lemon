import { useState } from 'react';
import { toInputDate } from '../../utils/dates';
import { OCCASIONS, isValidDate, isValidTime, isValidGuests, isValidOccasion } from './validation';
import './BookingForm.css';

// A controlled form: React state holds every field's value, and each input just shows it.
// It gets the available times from Main, and reports date changes back with dispatch.
function BookingForm({ availableTimes, dispatch, submitForm }) {
  // Today as 'YYYY-MM-DD': the earliest day you can book (no bookings in the past).
  const today = toInputDate(new Date());

  // One piece of state per field.
  // Starts on today, so the date shown matches the times Main loaded for today.
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('17:00');
  // Kept as a string, like every input value; it's turned into a number only when it's used.
  const [guests, setGuests] = useState('1');
  const [occasion, setOccasion] = useState('Birthday');
  // Whether the last save failed. Unlike the field errors, it can't be worked out from the
  // fields: it's the result of a submit, so it has to be remembered in state.
  const [saveFailed, setSaveFailed] = useState(false);

  // When the date changes: update our own field AND tell Main, so it can work out the new times.
  function handleDateChange(e) {
    setDate(e.target.value);
    dispatch({ type: 'DATE_CHANGED', date: e.target.value });
  }

  // The times change with the date, so the time picked earlier may not exist anymore.
  // Work out the time to show during render: keep the picked one if it's still offered,
  // otherwise use the first offered time, or '' if there are none.
  const selectedTime = availableTimes.includes(time) ? time : availableTimes[0] || '';

  // Worked out from state on every render, never stored, so it can't go stale.
  // An empty message means "this field is fine".
  const errors = {
    date: isValidDate(date, today) ? '' : 'Please choose today or a later date.',
    time: isValidTime(selectedTime, availableTimes) ? '' : 'Please choose an available time.',
    guests: isValidGuests(guests) ? '' : 'Please enter a whole number from 1 to 10.',
    occasion: isValidOccasion(occasion) ? '' : 'Please choose an occasion.',
  };
  // The form is valid only when every message is empty.
  const isFormValid = Object.values(errors).every((v) => v === '');

  function handleSubmit(e) {
    // Stop the browser's default submit, which would reload the page and wipe the state.
    e.preventDefault();
    // A second guard: never send invalid data, even if a submit gets past the disabled button.
    if (!isFormValid) return;
    // Build the booking from state, in the shape the API should get.
    const formData = {
      date: date,
      // The time shown on screen, never a stale one the new date doesn't offer.
      time: selectedTime,
      // Number, not parseInt: it keeps exactly what was typed (2.7 stays 2.7), so validation can catch it.
      guests: Number(guests),
      occasion: occasion,
    };
    const saved = submitForm(formData);
    setSaveFailed(!saved);
  }

  return (
    // A name turns the form into a landmark that screen readers can jump to.
    <form className="booking-form" aria-label={"Reserve a Table"} onSubmit={handleSubmit}>
      <label htmlFor="res-date">Choose date</label>
      <input
        type="date"
        id="res-date"
        required
        min={today}
        value={date}
        onChange={handleDateChange}
        // Tells screen readers the field has a problem, and which text explains it.
        aria-invalid={!!errors.date}
        aria-describedby={errors.date ? "res-date-error" : undefined}
      />
      {errors.date && <p id="res-date-error" className="field-error">{errors.date}</p>}

      <label htmlFor="res-time">Choose time</label>
      <select
        id="res-time"
        required
        value={selectedTime}
        onChange={(e) => setTime(e.target.value)}
        aria-invalid={!!errors.time}
        aria-describedby={errors.time ? "res-time-error" : undefined}
      >
        {/* Each time is unique and stays the same between renders, so it makes a good key. */}
        {availableTimes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {errors.time && <p id="res-time-error" className="field-error">{errors.time}</p>}

      <label htmlFor="guests">Number of guests</label>
      <input
        type="number"
        id="guests"
        required
        min="1"
        max="10"
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
        aria-invalid={!!errors.guests}
        aria-describedby={errors.guests ? "guests-error" : undefined}
      />
      {errors.guests && <p id="guests-error" className="field-error">{errors.guests}</p>}

      <label htmlFor="occasion">Occasion</label>
      <select
        id="occasion"
        required
        value={occasion}
        onChange={(e) => setOccasion(e.target.value)}
        aria-invalid={!!errors.occasion}
        aria-describedby={errors.occasion ? "occasion-error" : undefined}
      >
        {/* Built from the same list the validator checks, so the two can't disagree. */}
        {OCCASIONS.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      {errors.occasion && <p id="occasion-error" className="field-error">{errors.occasion}</p>}

      {/* Option B: the aria-label matches the visible text, so voice control ("click Make Your
          reservation") still works and screen readers say what the button does. */}
      <input type="submit" value="Make Your reservation" aria-label={"Make Your reservation"} disabled={!isFormValid} />
      {/* role="alert": screen readers announce it right away, without the user moving to it. */}
      {saveFailed && (
        <p role="alert" className="form-error">We couldn't save your booking. Please try again.</p>
      )}
    </form>
  );
}

export default BookingForm;
