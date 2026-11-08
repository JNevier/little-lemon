import './VisitUs.css';
import LinkButton from '../LinkButton/LinkButton';
import restaurant from '../../data/restaurant';

// The last section on the home page: where we are, when we're open, how to call, and the booking button.
// The details come from src/data/restaurant.js (sample data), the same file the footer uses.
function VisitUs() {
  return (
    <section className="section section-muted visit-us" aria-labelledby="visit-title">
      <div className="visit-us-intro">
        <p className="eyebrow">Visit us</p>
        <h2 id="visit-title">Come in for dinner</h2>
        <p className="lead">Book ahead for the weekend, or walk in on a weeknight.</p>
        {/* The hero's yellow button is far up the page, so the main action appears once more here,
            where visitors who have read everything decide. */}
        <LinkButton to="/reservations">Reserve a Table</LinkButton>
      </div>

      {/* NEW: a description list (<dl>) pairs a label (<dt>) with its value (<dd>),
          like "Hours: Daily, 5 pm to midnight". Screen readers read each pair together. */}
      <dl className="card visit-us-details">
        <div className="visit-us-row">
          <dt>Address</dt>
          <dd>
            {restaurant.street}
            <br />
            {restaurant.city}
          </dd>
        </div>
        <div className="visit-us-row">
          <dt>Hours</dt>
          <dd>
            {restaurant.hours}
            <br />
            {restaurant.lastTable}
          </dd>
        </div>
        <div className="visit-us-row">
          <dt>Phone</dt>
          <dd>
            <a href={restaurant.phoneLink} className="visit-us-phone">{restaurant.phone}</a>
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default VisitUs;
