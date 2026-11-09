import { useState, useRef, useEffect } from 'react';
import { toInputDate, addDays, isPastTime } from '../../utils/dates';
import {
  NO_OCCASION,
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
import ReservationSummary from '../ReservationSummary/ReservationSummary';
import restaurant from '../../data/restaurant';
import './BookingForm.css';

// A short line under each seating choice. Outside the component because it never changes.
const SEATING_DESCRIPTIONS = {
  Indoor: 'In the dining room',
  Outdoor: 'On the terrace, weather permitting',
  'No preference': 'The first free table',
};

// Turns "No preference" into "no-preference", for use in an id (ids can't contain spaces).
function toId(text) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

// A controlled form: React state holds every field's value, and each input just shows it.
// It gets the available times from Main, and reports date changes back with dispatch.
// `reservations` are the bookings already saved in this browser. It's a plain prop (not Context),
// so the form stays easy to test. "= []" is the default when no reservations are passed in.
function BookingForm({ availableTimes, dispatch, submitForm, reservations = [] }) {
  // Today as 'YYYY-MM-DD': the earliest day you can book (no bookings in the past).
  const today = toInputDate(new Date());
  // The last day you can book: today plus the booking window (90 days, set in src/data/restaurant.js).
  const lastDay = addDays(today, restaurant.bookingWindowDays);

  // The date the form starts on. useState keeps this first value for as long as the form is on screen,
  // even if the form stays open past midnight, so the effect below always asks about the date the field
  // started with.
  const [startDate] = useState(today);

  // One piece of state per field. The date starts on startDate (today).
  const [date, setDate] = useState(startDate);
  const [time, setTime] = useState('17:00');
  // Kept as a string, like every input value; it's turned into a number only when it's used.
  const [guests, setGuests] = useState('1');
  // Most bookings are just dinner, so "No special occasion" is the starting choice.
  const [occasion, setOccasion] = useState(NO_OCCASION);
  // Contact details and extras. Name and email start empty: the guest has to type them.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [seating, setSeating] = useState('No preference');
  const [requests, setRequests] = useState('');
  // The "touched" pattern. A field is touched once the user has left it (the blur event).
  // Name and email start empty, which is invalid; without this, a brand-new form would greet
  // the user with red error text before they've typed anything.
  const [touched, setTouched] = useState({ name: false, email: false });
  // How many times the user has pressed "Confirm reservation" while something was wrong.
  // After the first time, every error is shown (even on fields not touched yet), and each new
  // attempt moves focus to the error summary again (see the effect below).
  const [failedSubmits, setFailedSubmits] = useState(0);
  // True when the guest pressed the button just after their chosen time passed (the form was left open).
  // Cleared as soon as they pick another time or date. Remembered in state, because it's the result
  // of a submit, not something that can be worked out from the fields.
  const [timePassed, setTimePassed] = useState(false);
  // Whether the last save failed. Unlike the field errors, it can't be worked out from the
  // fields: it's the result of a submit, so it has to be remembered in state.
  const [saveFailed, setSaveFailed] = useState(false);
  // A handle on the error summary box, so focus can move there after a failed submit.
  const errorSummaryRef = useRef(null);

  // When the date changes: update our own field AND tell Main, so it can work out the new times.
  function handleDateChange(e) {
    setDate(e.target.value);
    setTimePassed(false);
    dispatch({ type: 'DATE_CHANGED', date: e.target.value });
  }

  // Hide the times this browser has already booked on the chosen date.
  // Derived state: worked out from props and state on every render, never stored, so it can't go stale.
  // Cancel a reservation and its time comes back on the next render.
  const bookedTimes = reservations
    .filter((reservation) => reservation.date === date)
    .map((reservation) => reservation.time);
  // Also hide times that have already passed today (at 21:10, 17:00 to 21:00 are gone). isPastTime only
  // ever hides times on today's date. This is derived state too, worked out on every render, so the
  // course's updateTimes stays exactly as it was.
  const openTimes = availableTimes.filter((t) => !bookedTimes.includes(t) && !isPastTime(date, t));

  // The times change with the date, so the time picked earlier may not exist anymore.
  // Work out the time to show during render: keep the picked one if it's still offered,
  // otherwise use the first offered time, or '' if there are none.
  const selectedTime = openTimes.includes(time) ? time : openTimes[0] || '';

  // An empty list means nothing can be booked on this date (a real API might return that for a full day).
  const noTimes = openTimes.length === 0;

  // Worked out first, so the time message can wait until the date is valid.
  // Two different problems, two different messages: a date in the past, or one too far ahead.
  const dateError = !isValidDate(date, today)
    ? 'Please choose today or a later date.'
    : !isValidDate(date, today, lastDay)
      ? `We take bookings up to ${restaurant.bookingWindowDays} days ahead.`
      : '';

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
        : timePassed
          ? 'The time you chose has just passed. Please choose another time.'
          : isValidTime(selectedTime, openTimes) ? '' : 'Please choose an available time.',
    guests: isValidGuests(guests) ? '' : 'Please enter a whole number from 1 to 10.',
    occasion: isValidOccasion(occasion) ? '' : 'Please choose an occasion.',
    seating: isValidSeating(seating) ? '' : 'Please choose a seating preference.',
    name: isValidName(name) ? '' : 'Please enter your name (at least 2 characters).',
    email: isValidEmail(email) ? '' : 'Please enter a valid email address, like name@example.com.',
  };
  // The form is valid only when every message is empty.
  const isFormValid = Object.values(errors).every((v) => v === '');

  // Which name/email errors to SHOW: only for fields the user has already left,
  // or for every field once they've tried to submit.
  const submitted = failedSubmits > 0;
  const shownNameError = touched.name || submitted ? errors.name : '';
  const shownEmailError = touched.email || submitted ? errors.email : '';

  // The errors on screen right now, in the same order as the fields, each with the id of its field.
  // The error summary lists these, and each item links to its field.
  const shownErrors = [
    { field: 'res-date', message: errors.date },
    { field: 'res-time', message: errors.time },
    { field: 'guests', message: errors.guests },
    { field: 'occasion', message: errors.occasion },
    { field: `seating-${toId(SEATING_OPTIONS[0])}`, message: errors.seating },
    { field: 'res-name', message: shownNameError },
    { field: 'res-email', message: shownEmailError },
  ].filter((error) => error.message !== '');

  // NEW: syncing two pieces of state when a component appears.
  // The date lives here, in the form, but the list of times lives in Main's reducer, which stays on screen
  // while you visit other pages. Every time the form appears, its date starts again on today, but Main may
  // still hold the times of a date you picked earlier (for example after "Book another table", or after
  // going to the Menu and back). Two pieces of state that must agree didn't.
  // So when the form appears, it tells Main which date it shows, and Main loads that date's times.
  // It reuses the same DATE_CHANGED action as the date field, so updateTimes doesn't change.
  // (Another way would be to move the date up into Main, but that would mean passing the date and
  // its setter down through BookingPage and changing more code.)
  // [dispatch, startDate]: both stay the same while the form is open, so this runs once when it appears.
  useEffect(() => {
    dispatch({ type: 'DATE_CHANGED', date: startDate });
  }, [dispatch, startDate]);

  // After each failed submit, move keyboard focus to the error summary, so screen readers read it out
  // and keyboard users start right where the problems are listed.
  // It runs after React has drawn the summary (on the first failed submit it doesn't exist before that).
  useEffect(() => {
    if (failedSubmits > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [failedSubmits]);

  // Marks one field as touched, keeping the others as they are.
  // { ...touched } copies the object; [field]: true then sets just that one key.
  function markTouched(field) {
    setTouched({ ...touched, [field]: true });
  }

  // A link in the error summary: put the cursor in that field (a plain #link would only scroll to it).
  function focusField(e, fieldId) {
    e.preventDefault();
    document.getElementById(fieldId)?.focus();
  }

  function handleSubmit(e) {
    // Stop the browser's default submit, which would reload the page and wipe the state.
    e.preventDefault();
    // Something is wrong: show every error and the summary, and don't send anything.
    if (!isFormValid) {
      setFailedSubmits((count) => count + 1);
      return;
    }
    // Check the clock once more: if the form was left open, the chosen time may have passed since the
    // list was drawn. Then nothing is sent; the next render drops that time and the message explains why.
    if (isPastTime(date, selectedTime)) {
      setTimePassed(true);
      setFailedSubmits((count) => count + 1);
      return;
    }
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
    // NEW: noValidate turns off the browser's own pop-up messages. The form checks itself and shows
    // its messages on the page instead, in the same words and style everywhere. The required, min and max
    // attributes stay: screen readers still announce "required", and phones still pick the right keyboard.
    <form className="booking-form" aria-label="Reserve a Table" onSubmit={handleSubmit} noValidate>
      {/* The error summary: only after a submit with problems, and only while there are problems left.
          tabIndex={-1}: the code can focus it, but the Tab key skips it. */}
      {submitted && shownErrors.length > 0 && (
        <div
          className="booking-form-errors"
          ref={errorSummaryRef}
          tabIndex={-1}
          aria-labelledby="error-summary-title"
          data-testid="error-summary"
        >
          <h2 id="error-summary-title" className="booking-form-errors-title">
            {shownErrors.length === 1 ? 'Please fix 1 problem' : `Please fix ${shownErrors.length} problems`}
          </h2>
          <ul className="booking-form-errors-list">
            {shownErrors.map((error) => (
              <li key={error.field}>
                <a href={`#${error.field}`} onClick={(e) => focusField(e, error.field)}>{error.message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="booking-form-steps">
        {/* Step 1. Each step is a white card with a numbered heading. The number is decoration
            (aria-hidden), so screen readers hear just "When". */}
        <div className="card booking-step">
          <h2 className="booking-step-title">
            <span className="booking-step-number" aria-hidden="true">1</span>
            When
          </h2>

          <div className="booking-field">
            <label htmlFor="res-date">Choose date</label>
            <input
              type="date"
              id="res-date"
              required
              min={today}
              // The latest day the date picker allows. Typing a later date by hand still shows the error.
              max={lastDay}
              value={date}
              onChange={handleDateChange}
              // Tells screen readers the field has a problem, and which text explains it.
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? 'res-date-error' : undefined}
            />
            {errors.date && <p id="res-date-error" className="field-error">{errors.date}</p>}
          </div>

          {/* Time and guests sit side by side on wider screens. */}
          <div className="booking-field-row">
            <div className="booking-field">
              <label htmlFor="res-time">Choose time</label>
              <select
                id="res-time"
                required
                value={selectedTime}
                onChange={(e) => {
                  setTime(e.target.value);
                  setTimePassed(false);
                }}
                aria-invalid={!!errors.time}
                aria-describedby={errors.time ? 'res-time-error' : undefined}
              >
                {noTimes ? (
                  // One disabled option explains the empty list. Its value '' matches selectedTime,
                  // so the select stays controlled.
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
            </div>

            <div className="booking-field">
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
                aria-describedby={errors.guests ? 'guests-error' : undefined}
              />
              {errors.guests && <p id="guests-error" className="field-error">{errors.guests}</p>}
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="card booking-step">
          <h2 className="booking-step-title">
            <span className="booking-step-number" aria-hidden="true">2</span>
            Your table
          </h2>

          <div className="booking-field">
            <label htmlFor="occasion">Occasion</label>
            <select
              id="occasion"
              required
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              aria-invalid={!!errors.occasion}
              aria-describedby={errors.occasion ? 'occasion-error' : undefined}
            >
              {/* Built from the same list the validator checks, so the two can't disagree. */}
              {OCCASIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            {errors.occasion && <p id="occasion-error" className="field-error">{errors.occasion}</p>}
          </div>

          {/* A group of radio buttons goes in a fieldset; the legend is the group's name.
              Screen readers say "Seating preference, group" and then each choice.
              All three share name="seating", so only one can be picked, and the arrow keys move between them.
              Each choice LOOKS like a card, but it's still a real radio button inside a label. */}
          <fieldset className="booking-seating">
            <legend>Seating preference</legend>
            <div className="booking-seating-options">
              {SEATING_OPTIONS.map((option) => {
                const id = `seating-${toId(option)}`;
                return (
                  <label key={option} className="seating-card" htmlFor={id}>
                    <input
                      type="radio"
                      id={id}
                      name="seating"
                      value={option}
                      checked={seating === option}
                      onChange={(e) => setSeating(e.target.value)}
                      // The radio's name is just the option ("Indoor"); the short line under it
                      // is read as its description, after the name.
                      aria-labelledby={`${id}-name`}
                      aria-describedby={`${id}-description`}
                    />
                    <span id={`${id}-name`} className="seating-card-name">{option}</span>
                    <span id={`${id}-description`} className="seating-card-description">
                      {SEATING_DESCRIPTIONS[option]}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.seating && <p className="field-error">{errors.seating}</p>}
          </fieldset>
        </div>

        {/* Step 3 */}
        <div className="card booking-step">
          <h2 className="booking-step-title">
            <span className="booking-step-number" aria-hidden="true">3</span>
            Your details
          </h2>

          <div className="booking-field-row">
            <div className="booking-field">
              <label htmlFor="res-name">Full name</label>
              <input
                type="text"
                id="res-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                // onBlur runs when the user leaves the field (Tab away or click elsewhere).
                onBlur={() => markTouched('name')}
                // autocomplete tells the browser what this field is for, so it can offer to fill it in
                // from the user's saved details (WCAG 1.3.5 "Identify Input Purpose").
                autoComplete="name"
                aria-invalid={!!shownNameError}
                aria-describedby={shownNameError ? 'res-name-error' : undefined}
              />
              {shownNameError && <p id="res-name-error" className="field-error">{shownNameError}</p>}
            </div>

            <div className="booking-field">
              <label htmlFor="res-email">Email</label>
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
                aria-describedby={shownEmailError ? 'res-email-error' : undefined}
              />
              {shownEmailError && <p id="res-email-error" className="field-error">{shownEmailError}</p>}
            </div>
          </div>

          <div className="booking-field">
            {/* The only optional field, so it's the only one marked. Every other field is required. */}
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
          </div>
        </div>
      </div>

      {/* The live summary: it updates as the guest fills in the form.
          On wide screens it sits in a column on the right and stays in view while the form scrolls;
          on phones it sits just above the button, as a last check before confirming. */}
      <aside className="card booking-summary" aria-labelledby="booking-summary-title">
        <h2 id="booking-summary-title" className="booking-summary-title">Your reservation</h2>
        <ReservationSummary booking={{ date, time: selectedTime, guests, occasion, seating }} />
        {/* SAMPLE DATA: the hours and address come from src/data/restaurant.js; the 15-minute hold is
            a made-up house rule. */}
        <div className="booking-summary-info">
          <p>{restaurant.hours}. {restaurant.lastTable}.</p>
          <p>{restaurant.street}, {restaurant.city}</p>
          <p>We hold your table for 15 minutes after your booking time.</p>
        </div>
      </aside>

      <div className="booking-form-actions">
        {/* Always enabled: pressing it with a problem shows the error summary, which says exactly what to fix.
            A disabled button can't say why it's disabled, and some people can't find out. */}
        <button type="submit" className="button button-primary booking-form-submit">
          Confirm reservation
        </button>
        {/* role="alert": screen readers announce it right away, without the user moving to it. */}
        {saveFailed && (
          <p role="alert" className="form-error">We couldn't save your booking. Please try again.</p>
        )}
      </div>
    </form>
  );
}

export default BookingForm;
