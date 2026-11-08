import './ReservationSummary.css';
import { formatLongDate, isInputDate } from '../../utils/dates';
import { isValidGuests } from '../BookingForm/validation';

// "1 guest" or "4 guests". Shared with My Reservations, so every page says it the same way.
export function formatGuests(guests) {
  const count = Number(guests);
  return count === 1 ? '1 guest' : `${count} guests`;
}

// What to show for a detail that hasn't been chosen yet (while the guest is still filling in the form).
function NotChosen() {
  return <span className="reservation-summary-empty">Not chosen yet</span>;
}

// The details of one booking as a list of label/value pairs: date, time, guests, occasion, seating,
// and the name and request when there are any. Used live beside the booking form (it updates as you type)
// and on the confirmation page, so both show a booking the same way.
// `booking` may be half filled in, so every value is checked before it's shown.
function ReservationSummary({ booking }) {
  const { date, time, guests, occasion, seating, name, requests } = booking;

  return (
    // <dl>: a description list pairs each label (<dt>) with its value (<dd>).
    <dl className="reservation-summary">
      <div className="reservation-summary-row">
        <dt>Date</dt>
        <dd>{isInputDate(date ?? '') ? formatLongDate(date) : <NotChosen />}</dd>
      </div>
      <div className="reservation-summary-row">
        <dt>Time</dt>
        <dd>{time ? time : <NotChosen />}</dd>
      </div>
      <div className="reservation-summary-row">
        <dt>Guests</dt>
        <dd>{isValidGuests(guests) ? formatGuests(guests) : <NotChosen />}</dd>
      </div>
      {occasion && (
        <div className="reservation-summary-row">
          <dt>Occasion</dt>
          <dd>{occasion}</dd>
        </div>
      )}
      {/* Older bookings were saved before the form asked for seating, a name or requests,
          so those rows only appear when the booking has them. */}
      {seating && (
        <div className="reservation-summary-row">
          <dt>Seating</dt>
          <dd>{seating}</dd>
        </div>
      )}
      {name && (
        <div className="reservation-summary-row">
          <dt>Name</dt>
          <dd>{name}</dd>
        </div>
      )}
      {requests && (
        <div className="reservation-summary-row">
          <dt>Request</dt>
          <dd>{requests}</dd>
        </div>
      )}
    </dl>
  );
}

export default ReservationSummary;
