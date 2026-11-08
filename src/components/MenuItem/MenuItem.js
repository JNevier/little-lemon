import './MenuItem.css';
import { formatPrice } from '../../utils/price';

// One dish on the menu, laid out like a printed menu: name, a dotted line, then the price,
// with the description and dietary tags underneath. A dish with a photo shows it on the left.
// It's an <li> because the menu page shows the dishes as a list.
// `tags = []`: a dish without tags still works (the default value is used when tags is missing).
function MenuItem({ name, price, description, tags = [], image, imageAlt }) {
  return (
    // A second class when there's a photo, so the CSS can make room for it.
    <li className={image ? 'menu-item menu-item-with-image' : 'menu-item'}>
      {image && (
        // loading="lazy": most dishes are further down the page, so their photos wait until they're needed.
        <img className="menu-item-image" src={image} alt={imageAlt} width="96" height="96" loading="lazy" />
      )}
      <div className="menu-item-text">
        <div className="menu-item-heading">
          <h3 className="menu-item-name">{name}</h3>
          {/* The dotted line between the name and the price is decoration, so screen readers skip it. */}
          <span className="menu-item-leader" aria-hidden="true" />
          <p className="menu-item-price">{formatPrice(price)}</p>
        </div>
        <p className="menu-item-description">{description}</p>
        {tags.length > 0 && (
          <ul className="menu-item-tags" aria-label="Dietary information">
            {tags.map((tag) => (
              <li key={tag} className="tag">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default MenuItem;
