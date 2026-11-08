import CallToAction from '../../components/CallToAction/CallToAction';
import Highlights from '../../components/Highlights/Highlights';
import Specials from '../../components/Specials/Specials';
import StoryTeaser from '../../components/StoryTeaser/StoryTeaser';
import VisitUs from '../../components/VisitUs/VisitUs';

// The home page is a list of sections, in the order a visitor asks their questions:
// What is this place? Why go? What's good? Who runs it? Where and when?
// A fragment groups them without adding an extra element, because Main already provides the surrounding <main>.
// The sections alternate white and grey backgrounds, so each one is easy to tell apart.
function HomePage() {
  return (
    <>
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are.
          The home page leads with what the restaurant is, which also helps search results. */}
      <title>Little Lemon | Mediterranean Restaurant in Chicago</title>
      <CallToAction />
      <Highlights />
      <Specials />
      <StoryTeaser />
      <VisitUs />
    </>
  );
}

export default HomePage;
