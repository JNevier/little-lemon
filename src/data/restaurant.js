// SAMPLE DATA: Little Lemon is a fictional restaurant. The address, hours, phone number and email are made up.
// - 555-01xx phone numbers are reserved for fiction, so they never reach a real person.
// - ".example" is a reserved domain, so the email can't belong to anyone either.
// - The hours match the booking form: the course API offers tables from 17:00 to 23:30.
//
// The home page and the footer both show these details. Keeping them in one file means they can't
// drift apart: change the phone number here and both places update.
const restaurant = {
  street: '678 Pisa Ave',
  city: 'Chicago, IL 60611',
  hours: 'Daily, 5 pm to midnight',
  lastTable: 'Last table at 11:30 pm',
  // What people see, and the version a phone understands (country code, no spaces or brackets).
  phone: '(312) 555-0123',
  phoneLink: 'tel:+13125550123',
  email: 'hello@littlelemon.example',
};

export default restaurant;
