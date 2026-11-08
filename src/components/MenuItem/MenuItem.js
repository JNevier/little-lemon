import './MenuItem.css';
import { formatPrice } from '../../utils/price';

// One dish on the menu. It's an <li> because MenuPage shows the dishes as a list.
function MenuItem({ name, price, description }) {
  return (
    <li className="menu-item">
      {/* Name on the left, price on the right, like the home page's specials. */}
      <div className="menu-item-heading">
        <h3 className="menu-item-name">{name}</h3>
        <p className="menu-item-price">{formatPrice(price)}</p>
      </div>
      <p className="menu-item-description">{description}</p>
    </li>
  );
}

export default MenuItem;
