import { render, screen, fireEvent } from '@testing-library/react';
import BookingForm from './BookingForm';
import { toInputDate } from '../../utils/dates';

// Renders the form with a fixed list of times and fake functions for Main's props.
// It returns the fake submitForm so a test can check how it was called.
function setupForm() {
  const submitForm = jest.fn();
  render(<BookingForm availableTimes={['17:00', '18:00']} dispatch={jest.fn()} submitForm={submitForm} />);
  return submitForm;
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
  test('the button is enabled for a valid form and disabled for an invalid one', () => {
    setupForm();
    const button = screen.getByRole('button', { name: 'Make Your reservation' });
    const guests = screen.getByLabelText('Number of guests');

    expect(button).toBeEnabled(); // the default values are all valid

    fireEvent.change(guests, { target: { value: '0' } });
    expect(button).toBeDisabled();
    expect(screen.getByText('Please enter a whole number from 1 to 10.')).toBeInTheDocument();

    fireEvent.change(guests, { target: { value: '4' } });
    expect(button).toBeEnabled();
  });

  test('submitting a valid form calls submitForm once with the booking', () => {
    const submitForm = setupForm();
    fireEvent.change(screen.getByLabelText('Choose time'), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Occasion'), { target: { value: 'Anniversary' } });

    fireEvent.click(screen.getByRole('button', { name: 'Make Your reservation' }));

    expect(submitForm).toHaveBeenCalledTimes(1);
    expect(submitForm).toHaveBeenCalledWith({ date: toInputDate(new Date()), time: '18:00', guests: 4, occasion: 'Anniversary' });
  });

  test('an invalid form is never sent, even if it gets submitted', () => {
    const submitForm = setupForm();
    fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '0' } });

    // Fire a submit event ourselves (a click can't: the button is disabled). It bubbles up to the
    // form, so handleSubmit runs, and this tests the guard inside it.
    fireEvent.submit(screen.getByRole('button', { name: 'Make Your reservation' }));

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
    expect(screen.getByRole('button', { name: 'Make Your reservation' })).toBeDisabled();
  });
});
