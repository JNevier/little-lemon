import './SpecialCard.css';

function SpecialCard({ name, price, description, image, alt }) {
  return (
    <article className="special-card">
      <img className="special-card-image" src={image} alt={alt} />
      {/* Name on the left, price on the right, on one row (as in the course mock-up). */}
      <div className="special-card-heading">
        <h3 className="special-card-title">{name}</h3>
        <p className="special-card-price">{price}</p>
      </div>
      <p className="special-card-description">{description}</p>
    </article>
  );
}

export default SpecialCard;
