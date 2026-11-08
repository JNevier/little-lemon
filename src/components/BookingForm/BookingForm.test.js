import { render, screen, fireEvent, within } from '@testing-library/react';
import { formatLongDate } from '../../utils/dates';
import BookingForm from './BookingForm';
import { toInputDate } from '../../utils/dates';

// Renders the form with a fixed list of times and fake functions for Main's props.
// It returns the fake submitForm so a test can check how it was called.
// Name and email start empty (invalid), so the setup fills them with obviously fake details;
// that way the other fields' defaults make a valid form, as before.
function setupForm() {
  const submitForm = jest.fn();
  render(<BookingForm availableTimes={['17:00', '18:00']} dispatch={jest.fn()} submitForm={submitForm} />);
  fillContactDetails();
  return submitForm;
}

function fillContactDetails() {
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test Guest' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'guest@example.com' } });
}

test('renders the "Choose date" label', () => {
  setupForm();
  expect(screen.getByText('Choose date')).toBeInTheDocument();
});

describe('HTML5 validation attributes', () => {
  test('date is required and cannot be before today', () => {
    setupForm();
    const input = screen.getByLabelText('Choose date');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('min', toInputDate(new Date()));
  });

  test('time is required', () => {
    setupForm();
    expect(screen.getByLabelText('Choose time')).toHaveAttribute('required');
  });

  test('guests is a required number from 1 to 10', () => {
    setupForm();
    const input = screen.getByLabelText('Number of guests');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '10');
  });

  test('occasion is required', () => {
    setupForm();
    expect(screen.getByLabelText('Occasion')).toHaveAttribute('required');
  });
});

describe('submit button and submission', () => {
  test('the button is always enabled, and a wrong value shows its error next to the field', () => {
    setupForm();
    const button = screen.getByRole('button', { name: 'Confirm reservation' });
    const guests = screen.getByLabelText('Number of guests');

    expect(button).toBeEnabled(); // the default values are all valid

    // On purpose: the button stays enabled even when a value is wrong. Pressing it explains what to fix.
    fireEvent.change(guests, { target: { value: '0' } });
    expect(button).toBeEnabled();
    expect(screen.getByText('Please enter a whole number from 1 to 10.')).toBeInTheDocument();

    fireEvent.change(guests, { target: { value: '4' } });
    expect(screen.queryByText('Please enter a whole number from 1 to 10.')).not.toBeInTheDocument();
  });

  test('submitting a valid form calls submitForm once with the booking', () => {
    const submitForm = setupForm();
    fireEvent.change(screen.getByLabelText('Choose time'), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Occasion'), { target: { value: 'Anniversary' } });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));

    expect(submitForm).toHaveBeenCalledTimes(1);
    // The booking now also carries the contact details and seating (the defaults here).
    expect(submitForm).toHaveBeenCalledWith({
      date: toInputDate(new Date()),
      time: '18:00',
      guests: 4,
      occasion: 'Anniversary',
      seating: 'No preference',
      name: 'Test Guest',
      email: 'guest@example.com',
      requests: '',
    });
  });

  test('an invalid form is never sent', () => {
    const submitForm = setupForm();
    fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '0' } });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));
    // A submit event fired straight at the form (as pressing Enter in a field does) is blocked too.
    fireEvent.submit(screen.getByRole('form', { name: 'Reserve a Table' }));

    expect(submitForm).not.toHaveBeenCalled();
  });
});

describe('accessibility', () => {
  test('every field is found by its label, which points at the right input', () => {
    setupForm();
    // getByLabelText throws if a label points at nothing, or at more than one element (duplicate ids).
    expect(screen.getByLabelText('Choose date')).toHaveAttribute('id', 'res-date');
    expect(screen.getByLabelText('Choose time')).toHaveAttribute('id', 'res-time');
    expect(screen.getByLabelText('Number of guests')).toHaveAttribute('id', 'guests');
    expect(screen.getByLabelText('Occasion')).toHaveAttribute('id', 'occasion');
  });

  test('the form is a named landmark', () => {
    setupForm();
    expect(screen.getByRole('form', { name: 'Reserve a Table' })).toBeInTheDocument();
  });

  test('an invalid field is marked invalid and described by its error', () => {
    setupForm();
    const guests = screen.getByLabelText('Number of guests');

    fireEvent.change(guests, { target: { value: '0' } });
    expect(guests).toHaveAttribute('aria-invalid', 'true');
    expect(guests).toHaveAccessibleDescription('Please enter a whole number from 1 to 10.');

    fireEvent.change(guests, { target: { value: '4' } });
    expect(guests).toHaveAttribute('aria-invalid', 'false');
    expect(guests).not.toHaveAccessibleDescription();
  });
});

describe('when no times are available', () => {
  test('explains why, offers no time to pick, and blocks the submit', () => {
    render(<BookingForm availableTimes={[]} dispatch={jest.fn()} submitForm={jest.fn()} />);

    expect(screen.getByText('No times are available on this date. Please choose another date.')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'No times available' })).toBeDisabled();
  });

  test('pressing the button lists the time problem in the error summary and sends nothing', () => {
    const submitForm = jest.fn();
    render(<BookingForm availableTimes={[]} dispatch={jest.fn()} submitForm={submitForm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));

    expect(within(screen.getByTestId('error-summary')).getByRole('link', {
      name: 'No times are available on this date. Please choose another date.',
    })).toBeInTheDocument();
    expect(submitForm).not.toHaveBeenCalled();
  });
});

describe('times already booked in this browser', () => {
  // Fake saved bookings (not real people).
  const today = toInputDate(new Date());

  test('a time booked on the chosen date is not offered', () => {
    const reservations = [{ id: 'r1', date: today, time: '17:00', guests: 2, occasion: 'Birthday' }];
    render(
      <BookingForm availableTimes={['17:00', '18:00']} dispatch={jest.fn()} submitForm={jest.fn()} reservations={reservations} />
    );

    // Only 18:00 is left, and it's picked automatically.
    const timeOptions = [...screen.getByLabelText('Choose time').options].map((o) => o.value);
    expect(timeOptions).toEqual(['18:00']);
    expect(screen.getByLabelText('Choose time')).toHaveValue('18:00');
  });

  test('a booking on another date does not hide the time', () => {
    const reservations = [{ id: 'r1', date: '2099-01-01', time: '17:00', guests: 2, occasion: 'Birthday' }];
    render(
      <BookingForm availableTimes={['17:00', '18:00']} dispatch={jest.fn()} submitForm={jest.fn()} reservations={reservations} />
    );

    const timeOptions = [...screen.getByLabelText('Choose time').options].map((o) => o.value);
    expect(timeOptions).toEqual(['17:00', '18:00']);
  });

  test('when every time is booked, the form says so and blocks the submit', () => {
    const reservations = ['17:00', '18:00'].map((time, i) => ({ id: `r${i}`, date: today, time, guests: 2, occasion: 'Birthday' }));
    render(
      <BookingForm availableTimes={['17:00', '18:00']} dispatch={jest.fn()} submitForm={jest.fn()} reservations={reservations} />
    );

    expect(screen.getByText('No times are available on this date. Please choose another date.')).toBeInTheDocument();
  });
});

describe('contact details and seating', () => {
  // Renders the form without filling anything in, like a visitor opening the page.
  function renderEmptyForm() {
    render(<BookingForm availableTimes={['17:00', '18:00']} dispatch={jest.fn()} submitForm={jest.fn()} />);
  }

  test('name and email are required, typed fields with autocomplete', () => {
    renderEmptyForm();
    const name = screen.getByLabelText('Full name');
    const email = screen.getByLabelText('Email');

    expect(name).toHaveAttribute('type', 'text');
    expect(name).toBeRequired();
    expect(name).toHaveAttribute('autocomplete', 'name');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toBeRequired();
    expect(email).toHaveAttribute('autocomplete', 'email');
  });

  test('name and email errors are hidden on a fresh form, and there is no error summary yet', () => {
    renderEmptyForm();

    expect(screen.queryByText(/please enter your name/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByTestId('error-summary')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm reservation' })).toBeEnabled();
  });

  test('an error appears after leaving a field with a bad value, and goes away once fixed', () => {
    renderEmptyForm();
    const name = screen.getByLabelText('Full name');
    const email = screen.getByLabelText('Email');

    // Only spaces, then leave the field (blur).
    fireEvent.change(name, { target: { value: '   ' } });
    fireEvent.blur(name);
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Please enter your name (at least 2 characters).');

    fireEvent.change(email, { target: { value: 'a@b' } });
    fireEvent.blur(email);
    expect(email).toHaveAccessibleDescription('Please enter a valid email address, like name@example.com.');

    // Fix both: the errors go away and the button turns on.
    fireEvent.change(name, { target: { value: 'Test Guest' } });
    fireEvent.change(email, { target: { value: 'guest@example.com' } });
    expect(name).toHaveAttribute('aria-invalid', 'false');
    expect(email).not.toHaveAccessibleDescription();
  });

  test('a field left with a good value never shows an error', () => {
    renderEmptyForm();
    const name = screen.getByLabelText('Full name');

    fireEvent.change(name, { target: { value: 'Test Guest' } });
    fireEvent.blur(name);

    expect(screen.queryByText(/please enter your name/i)).not.toBeInTheDocument();
  });

  test('seating is a named group of radio buttons, with "No preference" picked first', () => {
    renderEmptyForm();
    const group = screen.getByRole('group', { name: 'Seating preference' });
    const radios = within(group).getAllByRole('radio');

    expect(radios.map((r) => r.value)).toEqual(['Indoor', 'Outdoor', 'No preference']);
    // Sharing one name makes them one group: only one can be picked, and the arrow keys move between them.
    radios.forEach((radio) => expect(radio).toHaveAttribute('name', 'seating'));
    expect(within(group).getByRole('radio', { name: 'No preference' })).toBeChecked();

    fireEvent.click(within(group).getByRole('radio', { name: 'Outdoor' }));
    expect(within(group).getByRole('radio', { name: 'Outdoor' })).toBeChecked();
    expect(within(group).getByRole('radio', { name: 'No preference' })).not.toBeChecked();
  });

  test('special requests are optional, limited to 200 characters and sent trimmed', () => {
    const submitForm = setupForm();
    const requests = screen.getByLabelText('Special requests (optional)');

    expect(requests).not.toBeRequired();
    expect(requests).toHaveAttribute('maxLength', '200');
    expect(requests).toHaveAccessibleDescription(/up to 200 characters \(0\/200\)/i);

    fireEvent.change(requests, { target: { value: '  A high chair, please.  ' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Indoor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));

    expect(submitForm).toHaveBeenCalledWith(
      expect.objectContaining({ requests: 'A high chair, please.', seating: 'Indoor', name: 'Test Guest' })
    );
  });

  test('only the optional field is marked, and there are no stars or "required" note', () => {
    renderEmptyForm();
    expect(screen.queryByText(/fields marked \* are required/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/\(optional\)/)).toHaveLength(1);
    expect(screen.getByLabelText('Special requests (optional)')).toBeInTheDocument();
  });

  test('each seating choice has a short description', () => {
    renderEmptyForm();
    expect(screen.getByRole('radio', { name: 'Indoor' })).toHaveAccessibleDescription('In the dining room');
    expect(screen.getByRole('radio', { name: 'Outdoor' })).toHaveAccessibleDescription('On the terrace, weather permitting');
    expect(screen.getByRole('radio', { name: 'No preference' })).toHaveAccessibleDescription('The first free table');
  });
});

describe('layout and live summary', () => {
  test('the fields are grouped in three steps', () => {
    render(<BookingForm availableTimes={['17:00']} dispatch={jest.fn()} submitForm={jest.fn()} />);
    ['When', 'Your table', 'Your details'].forEach((name) => {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    });
  });

  test('the summary shows the booking and updates as the guest types', () => {
    render(<BookingForm availableTimes={['17:00', '18:00']} dispatch={jest.fn()} submitForm={jest.fn()} />);
    const summary = screen.getByRole('complementary', { name: 'Your reservation' });

    // The starting values: today, the first time, 1 guest, no preference.
    expect(within(summary).getByText(formatLongDate(toInputDate(new Date())))).toBeInTheDocument();
    expect(within(summary).getByText('17:00')).toBeInTheDocument();
    expect(within(summary).getByText('1 guest')).toBeInTheDocument();
    expect(within(summary).getByText('No preference')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Choose time'), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Outdoor' }));
    expect(within(summary).getByText('18:00')).toBeInTheDocument();
    expect(within(summary).getByText('4 guests')).toBeInTheDocument();
    expect(within(summary).getByText('Outdoor')).toBeInTheDocument();

    // A wrong value isn't shown as if it were chosen.
    fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '0' } });
    expect(within(summary).getByText('Not chosen yet')).toBeInTheDocument();
    expect(within(summary).getByText(/we hold your table for 15 minutes/i)).toBeInTheDocument();
  });
});

describe('error summary', () => {
  function renderEmptyForm(submitForm = jest.fn()) {
    render(<BookingForm availableTimes={['17:00', '18:00']} dispatch={jest.fn()} submitForm={submitForm} />);
    return submitForm;
  }

  test('the form checks itself instead of the browser\'s pop-ups', () => {
    renderEmptyForm();
    expect(screen.getByRole('form', { name: 'Reserve a Table' })).toHaveAttribute('novalidate');
  });

  test('submitting with problems lists them, moves focus to the list, and sends nothing', () => {
    const submitForm = renderEmptyForm();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));

    const summary = screen.getByTestId('error-summary');
    expect(summary).toHaveFocus();
    expect(within(summary).getByRole('heading', { name: 'Please fix 2 problems' })).toBeInTheDocument();
    // Each problem links to its field.
    expect(within(summary).getByRole('link', { name: 'Please enter your name (at least 2 characters).' }))
      .toHaveAttribute('href', '#res-name');
    expect(within(summary).getByRole('link', { name: 'Please enter a valid email address, like name@example.com.' }))
      .toHaveAttribute('href', '#res-email');
    // The errors also show next to their fields, even though those fields were never left (blurred).
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Please enter a valid email address, like name@example.com.');
    expect(submitForm).not.toHaveBeenCalled();
  });

  test('a link in the summary puts the cursor in its field', () => {
    renderEmptyForm();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));

    fireEvent.click(screen.getByRole('link', { name: /please enter a valid email/i }));

    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  test('the summary shrinks as problems are fixed and goes away when none are left', () => {
    const submitForm = renderEmptyForm();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test Guest' } });
    expect(screen.getByRole('heading', { name: 'Please fix 1 problem' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'guest@example.com' } });
    expect(screen.queryByTestId('error-summary')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));
    expect(submitForm).toHaveBeenCalledTimes(1);
  });
});
