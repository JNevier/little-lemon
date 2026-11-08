import CallToAction from '../../components/CallToAction/CallToAction';
import Specials from '../../components/Specials/Specials';
import CustomersSay from '../../components/CustomersSay/CustomersSay';
import Chicago from '../../components/Chicago/Chicago';

// The home page is a list of sections. A fragment groups them without adding an extra element,
// because Main already provides the surrounding <main>.
function HomePage() {
  return (
    <>
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are.
          The home page leads with what the restaurant is, which also helps search results. */}
      <title>Little Lemon | Mediterranean Restaurant in Chicago</title>
      <CallToAction />
      <Specials />
      <CustomersSay />
      <Chicago />
    </>
  );
}

export default HomePage;
