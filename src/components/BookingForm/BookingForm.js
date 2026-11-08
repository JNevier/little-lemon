import { useState } from 'react';
import { toInputDate } from '../../utils/dates';
import {
  OCCASIONS,
  SEATING_OPTIONS,
  isValidDate,
  isValidTime,
  isValidGuests,
  isValidOccasion,
  isValidName,
  isValidEmail,
  isValidSeating,
} from './validation';
import './BookingForm.css';

// A controlled form: React state holds every field's value, and each input just shows it.
// It gets the available times from Main, and reports date changes back with dispatch.
// `reservations` are the bookings already saved in this browser. It's a plain prop (not Context),
// so the form stays easy to test. "= []" is the default when no reservations are passed in.
function BookingForm({ availableTimes, dispatch, submitForm, reservations = [] }) {
  // Today as 'YYYY-MM-DD': the earliest day you can book (no bookings in the past).
  const today = toInputDate(new Date());

  // One piece of state per field.
  // Starts on today, so the date shown matches the times Main loaded for today.
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('17:00');
  // Kept as a string, like every input value; it's turned into a number only when it's used.
  const [guests, setGuests] = useState('1');
  const [occasion, setOccasion] = useState('Birthday');
  // Contact details and extras. Name and email start empty: the guest has to type them.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [seating, setSeating] = useState('No preference');
  const [requests, setRequests] = useState('');
  // NEW: the "touched" pattern. A field is touched once the user has left it (the blur event).
  // Name and email start empty, which is invalid; without this, a brand-new form would greet
  // the user with red error text before they've typed anything.
  const [touched, setTouched] = useState({ name: false, email: false });
  // Whether the last save failed. Unlike the field errors, it can't be worked out from the
  // fields: it's the result of a submit, so it has to be remembered in state.
  const [saveFailed, setSaveFailed] = useState(false);

  // When the date changes: update our own field AND tell Main, so it can work out the new times.
  function handleDateChange(e) {
    setDate(e.target.value);
    dispatch({ type: 'DATE_CHANGED', date: e.target.value });
  }

  // Hide the times this browser has already booked on the chosen date.
  // Derived state: worked out from props and state on every render, never stored, so it can't go stale.
  // Cancel a reservation and its time comes back on the next render.
  const bookedTimes = reservations
    .filter((reservation) => reservation.date === date)
    .map((reservation) => reservation.time);
  const openTimes = availableTimes.filter((t) => !bookedTimes.includes(t));

  // The times change with the date, so the time picked earlier may not exist anymore.
  // Work out the time to show during render: keep the picked one if it's still offered,
  // otherwise use the first offered time, or '' if there are none.
  const selectedTime = openTimes.includes(time) ? time : openTimes[0] || '';

  // An empty list means nothing can be booked on this date (a real API might return that for a full day).
  const noTimes = openTimes.length === 0;

  // Worked out first, so the time message can wait until the date is valid.
  const dateError = isValidDate(date, today) ? '' : 'Please choose today or a later date.';

  // Worked out from state on every render, never stored, so it can't go stale.
  // An empty message means "this field is fine".
  const errors = {
    date: dateError,
    // Date first: while the date is wrong, the time message stays quiet (the date error explains it).
    // Then say what's really wrong: "choose a time" makes no sense when there are none.
    time: dateError
      ? ''
      : noTimes
        ? 'No times are available on this date. Please choose another date.'
        : isValidTime(selectedTime, openTimes) ? '' : 'Please choose an available time.',
    guests: isValidGuests(guests) ? '' : 'Please enter a whole number from 1 to 10.',
    occasion: isValidOccasion(occasion) ? '' : 'Please choose an occasion.',
    seating: isValidSeating(seating) ? '' : 'Please choose a seating preference.',
    name: isValidName(name) ? '' : 'Please enter your name (at least 2 characters).',
    email: isValidEmail(email) ? '' : 'Please enter a valid email address, like name@example.com.',
  };
  // The form is valid only when every message is empty.
  const isFormValid = Object.values(errors).every((v) => v === '');

  // Which name/email errors to SHOW: only for fields the user has already left.
  // The button still uses `errors` above, so it stays disabled until everything is valid.
  const shownNameError = touched.name ? errors.name : '';
  const shownEmailError = touched.email ? errors.email : '';

  // Marks one field as touched, keeping the others as they are.
  // { ...touched } copies the object; [field]: true then sets just that one key.
  function markTouched(field) {
    setTouched({ ...touched, [field]: true });
  }

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
      seating: seating,
      // trim() removes spaces at both ends, so " Test Guest " is saved as "Test Guest".
      name: name.trim(),
      email: email.trim(),
      requests: requests.trim(),
    };
    const saved = submitForm(formData);
    setSaveFailed(!saved);
  }

  return (
    // A name turns the form into a landmark that screen readers can jump to.
    <form className="booking-form" aria-label={"Reserve a Table"} onSubmit={handleSubmit}>
      {/* The * after a label comes from CSS (the "required" class), so labels keep their plain names. */}
      <p className="booking-form-required-note">Fields marked * are required.</p>

      <label htmlFor="res-date" className="required">Choose date</label>
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

      <label htmlFor="res-time" className="required">Choose time</label>
      <select
        id="res-time"
        required
        value={selectedTime}
        onChange={(e) => setTime(e.target.value)}
        aria-invalid={!!errors.time}
        aria-describedby={errors.time ? "res-time-error" : undefined}
      >
        {noTimes ? (
          // One disabled option explains the empty list. Its value '' matches selectedTime,
          // so the select stays controlled, and "required" still blocks the submit.
          <option value="" disabled>
            No times available
          </option>
        ) : (
          // Each time is unique and stays the same between renders, so it makes a good key.
          openTimes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))
        )}
      </select>
      {errors.time && <p id="res-time-error" className="field-error">{errors.time}</p>}

      <label htmlFor="guests" className="required">Number of guests</label>
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

      <label htmlFor="occasion" className="required">Occasion</label>
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

      {/* A group of radio buttons goes in a fieldset; the legend is the group's name.
          Screen readers say "Seating preference, group" and then each choice.
          All three share name="seating", so only one can be picked, and the arrow keys move between them. */}
      <fieldset className="booking-form-seating">
        <legend className="required">Seating preference</legend>
        {SEATING_OPTIONS.map((option) => (
          <label key={option} className="booking-form-radio">
            <input
              type="radio"
              name="seating"
              value={option}
              checked={seating === option}
              onChange={(e) => setSeating(e.target.value)}
              required
            />
            {option}
          </label>
        ))}
      </fieldset>

      <label htmlFor="res-name" className="required">Full name</label>
      <input
        type="text"
        id="res-name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        // onBlur runs when the user leaves the field (Tab away or click elsewhere).
        onBlur={() => markTouched('name')}
        // NEW: autocomplete tells the browser what this field is for, so it can offer to fill it in
        // from the user's saved details. It saves typing, and helps people with memory or motor
        // difficulties (WCAG 1.3.5 "Identify Input Purpose"). "name" means the person's full name.
        autoComplete="name"
        aria-invalid={!!shownNameError}
        aria-describedby={shownNameError ? "res-name-error" : undefined}
      />
      {shownNameError && <p id="res-name-error" className="field-error">{shownNameError}</p>}

      <label htmlFor="res-email" className="required">Email</label>
      <input
        // type="email" brings up the keyboard with @ on phones.
        type="email"
        id="res-email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => markTouched('email')}
        // "email": the browser can offer the user's saved email address.
        autoComplete="email"
        aria-invalid={!!shownEmailError}
        aria-describedby={shownEmailError ? "res-email-error" : undefined}
      />
      {shownEmailError && <p id="res-email-error" className="field-error">{shownEmailError}</p>}

      <label htmlFor="res-requests">Special requests (optional)</label>
      <textarea
        id="res-requests"
        rows="3"
        // The browser stops typing after 200 characters.
        maxLength={200}
        value={requests}
        onChange={(e) => setRequests(e.target.value)}
        aria-describedby="res-requests-hint"
      />
      {/* Always shown, so the limit is known before typing. */}
      <p id="res-requests-hint" className="field-hint">
        For example a high chair or an allergy. Up to 200 characters ({requests.length}/200).
      </p>

      {/* Option B: the aria-label matches the visible text, so voice control ("click Make Your
          reservation") still works and screen readers say what the button does. */}
      <input
        type="submit"
        value="Make Your reservation"
        aria-label={"Make Your reservation"}
        disabled={!isFormValid}
        // While the button is disabled, screen readers also read the hint below it, so users know why.
        aria-describedby={isFormValid ? undefined : "submit-hint"}
      />
      {!isFormValid && (
        <p id="submit-hint" className="field-hint">
          Fill in all required fields to enable the button.
        </p>
      )}
      {/* role="alert": screen readers announce it right away, without the user moving to it. */}
      {saveFailed && (
        <p role="alert" className="form-error">We couldn't save your booking. Please try again.</p>
      )}
    </form>
  );
}

export default BookingForm;
