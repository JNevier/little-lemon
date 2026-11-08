import SkipLink from './components/SkipLink/SkipLink';
import Header from './components/Header/Header';
import Main from './components/Main/Main';
import Footer from './components/Footer/Footer';
import { ReservationsProvider } from './context/ReservationsContext';

// The page frame: Header and Footer stay on every page; Main swaps the page content by URL.
// ReservationsProvider wraps everything, so any page can read the saved reservations.
// It's here, not in index.js, so tests that render <App /> get it automatically.
// SkipLink comes first, so it's the first thing the Tab key reaches on every page.
function App() {
  return (
    <ReservationsProvider>
      <SkipLink />
      <Header />
      <Main />
      <Footer />
    </ReservationsProvider>
  );
}

export default App;
