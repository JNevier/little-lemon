import './MenuItem.css';

// NEW: Intl.NumberFormat is the browser's built-in number formatter.
// With style 'currency' and 'USD' it turns 5 into "$5.00" and 12.9 into "$12.90".
// We make it once, outside the component, so it isn't rebuilt on every render.
const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// One dish on the menu. It's an <li> because MenuPage shows the dishes as a list.
function MenuItem({ name, price, description }) {
  return (
    <li className="menu-item">
      {/* Name on the left, price on the right, like the Specials cards. */}
      <div className="menu-item-heading">
        <h3 className="menu-item-name">{name}</h3>
        <p className="menu-item-price">{priceFormatter.format(price)}</p>
      </div>
      <p className="menu-item-description">{description}</p>
    </li>
  );
}

export default MenuItem;
