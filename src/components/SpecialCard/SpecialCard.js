import { Link } from 'react-router';
import './SpecialCard.css';
import { formatPrice } from '../../utils/price';

// One featured dish: photo with a price badge, name, short description and its tags.
// `dish` is one object from public/data/menu.json.
function SpecialCard({ dish }) {
  return (
    <li className="special-card">
      {/* The photo and the badge share one box, so the badge can sit on the photo's corner.
          loading="lazy": the specials are below the first screen, so the photos wait until the visitor
          scrolls near them. width/height reserve the space before the photo arrives. */}
      <div className="special-card-media">
        <img
          className="special-card-image"
          src={dish.image}
          alt={dish.imageAlt}
          width="400"
          height="300"
          loading="lazy"
        />
        <p className="special-card-price">{formatPrice(dish.price)}</p>
      </div>
      <div className="special-card-body">
        <h3 className="special-card-title">
          {/* NEW: a "stretched link". The link is only the dish name, but the CSS stretches its
              clickable area over the whole card. One link per card, with a clear name ("Bruschetta"),
              instead of a big link that would read the whole card out loud. */}
          <Link to="/menu" className="special-card-link">{dish.name}</Link>
        </h3>
        <p className="special-card-description">{dish.description}</p>
        {dish.tags.length > 0 && (
          <ul className="special-card-tags" aria-label="Dietary information">
            {dish.tags.map((tag) => (
              <li key={tag} className="tag">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default SpecialCard;
