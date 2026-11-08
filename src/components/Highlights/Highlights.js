import FeatureList from '../FeatureList/FeatureList';
import { RecipeIcon, LeafIcon, LemonIcon } from '../Icons/Icons';

// SAMPLE DATA: Little Lemon is fictional. These are facts about the restaurant (what it does),
// not quotes from customers, so nothing here pretends to be a real review.
const highlights = [
  {
    id: 'recipes',
    Icon: RecipeIcon,
    title: 'Family recipes',
    text: 'Every dish starts from a recipe Mario and Adrian grew up with, cooked with a modern twist.',
  },
  {
    id: 'produce',
    Icon: LeafIcon,
    title: 'Fresh, seasonal produce',
    text: 'Our menu changes with the seasons, with vegetables and herbs from farms near Chicago.',
  },
  {
    id: 'bistro',
    Icon: LemonIcon,
    title: 'A neighborhood bistro',
    text: 'A relaxed room for date nights, families and friends, with tables for 1 to 10 guests.',
  },
];

// "Why Little Lemon" on the home page: three short reasons to visit, each with an icon.
// aria-labelledby names the section after its heading, so screen readers list it as "Simple food, made with care".
function Highlights() {
  return (
    <section className="section" aria-labelledby="highlights-title">
      <p className="eyebrow">Why Little Lemon</p>
      <h2 id="highlights-title">Simple food, made with care</h2>
      <FeatureList items={highlights} />
    </section>
  );
}

export default Highlights;
