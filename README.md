# Little Lemon: Reserve a Table

A React web app for a small restaurant where you can pick a date, time and party size, and book a table online.

## About

This is my capstone project for the Meta Front-End Developer course.
It builds the home page and the table booking flow for Little Lemon, a fictional family-owned Mediterranean restaurant in Chicago that the course uses as its example business.
The focus is a booking form that works, checks what you type, and is usable with a keyboard and a screen reader.

## Quick start

You need Node.js 20 or newer and Git.

```bash
git clone https://github.com/Re1veN7/little-lemon.git
cd little-lemon
npm install
npm test -- --watchAll=false
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000). Step-by-step details are in [Getting started](#getting-started).

## For reviewers

| What to check | Where to find it |
| --- | --- |
| Design and responsive layout | Open the app and resize the window, or see [Design](#design) |
| Booking form and validation | [Try the booking flow](#try-the-booking-flow) |
| Edge cases and error messages | [Try the edge cases](#try-the-edge-cases) |
| Unit tests | [Testing](#testing) |
| Accessibility and semantic HTML | [Accessibility](#accessibility) |
| Git history | [Git workflow](#git-workflow) |
| Code and comments | [Project structure](#project-structure) |

## Features

- **Home page** with a hero section, this week's specials, customer reviews and a short "about us" section.
- **Booking form** with date, time, number of guests and occasion.
- **Available times change with the date** you pick.
- **Validation with clear messages**: you can't pick a past date or book for fewer than 1 or more than 10 guests, and the submit button stays disabled until everything is valid.
- **Confirmation page** that shows the booking's date, time and number of guests.
- **Helpful messages for edge cases**: a failed save, a date with no times, a cleared date, and a visit to the confirmation page with no booking.
- **Responsive layout**: designed for phones first, with a wider layout from 768px up.
- **Accessible**: every field has a label, errors are read out by screen readers, and the whole flow works with the keyboard alone.

## Tech stack

- **React 19**: builds the user interface from components.
- **React Router 7**: moves between pages (home, booking, confirmation) without reloading.
- **Create React App** (`react-scripts` 5): runs, tests and builds the project with no extra setup.
- **Jest and React Testing Library**: unit tests that check the app the way a user sees it.
- **Plain CSS** with CSS variables for the brand colours and fonts.

## Getting started

### Prerequisites

You need two things installed:

- **Node.js 20 or newer**, which also installs **npm**. Check yours with `node -v`. I built and tested this project with v24.5.0.
- **Git**, to download the project. Check yours with `git --version`.

The commands below work the same in macOS/Linux Terminal and in Windows PowerShell.

### Clone the repository

```bash
git clone https://github.com/Re1veN7/little-lemon.git
cd little-lemon
```

The first line downloads the project into a new folder called `little-lemon`. The second line moves you into that folder.
**Why:** every command after this one must be run inside the project folder, because that's where `package.json` is.

### Install the dependencies

```bash
npm install
```

This downloads the packages the project needs (React, React Router, the test tools) into a `node_modules` folder. It can take a minute.
**Why first:** the start, test and build commands use these packages, so they fail until this step has run.

You may see deprecation warnings during the install. That's normal for Create React App. Only worry if the install stops with an error.

### Start the app

```bash
npm start
```

This starts a local development server and opens the app in your browser at [http://localhost:3000](http://localhost:3000).
If port 3000 is already in use, it asks to use another port; press `Y` and use the address it prints.
Stop the server with `Ctrl + C`.

### Run the tests

```bash
npm test -- --watchAll=false
```

This runs every test once and shows the results.

You can also run `npm test` on its own. That starts **watch mode**: it waits and re-runs the tests when you change a file. On a fresh copy it may say "No tests found related to files changed since last commit". If you see that, press `a` to run all tests. Press `q` to quit watch mode.

### Build for production

```bash
npm run build
```

This makes an optimised version of the app, ready to put on a web server, in a new `build` folder.
You don't need it to try the app. `npm start` is enough.

## Try the booking flow

1. Run `npm start` and click **Reservations** in the menu, or **Reserve a Table** on the home page.
2. The date starts on today. Pick a later date with a different day of the month, and the list of times changes.
3. Type `0` in **Number of guests**. A message appears under the field, and the **Make Your reservation** button turns faded and can't be clicked.
4. Change it to a number from 1 to 10. The message goes away and the button works again.
5. Choose a time and an occasion, then click **Make Your reservation** (or press `Enter` in the **Number of guests** field).
6. You land on the **Booking Confirmed** page, which shows your date, time and number of guests. Use **Back to Home** to return.

## Try the edge cases

1. **Visit the confirmation page with no booking.** Go to [http://localhost:3000/confirmed](http://localhost:3000/confirmed). It says you haven't made a booking yet and links to the booking page.
2. **Clear the date.** On the booking page, clear the date field. Only the date error shows, the time list shows **No times available**, and the button stays disabled.
3. **Try invalid guest numbers.** Type `0`, `11` or `2.5`. A message appears and the button stays disabled.

Two cases can't be triggered in the browser, because the course API always saves and always offers times for a real date. The automated tests cover them:

- **A failed save** shows "We couldn't save your booking. Please try again." and stays on the form.
- **A date with no times** shows "No times are available on this date. Please choose another date."

## Project structure

```text
src/
├── App.js
├── index.js
├── index.css
├── api.js
├── components/
│   ├── BookingForm/
│   ├── Main/
│   ├── Header/
│   ├── Nav/
│   ├── Footer/
│   └── ...
├── pages/
│   ├── HomePage/
│   ├── BookingPage/
│   ├── ConfirmedBooking/
│   └── NotFoundPage/
└── utils/
```

- `src/components/`: reusable pieces of the page. Each folder holds a component, its CSS and, where there is one, its test.
- `src/components/BookingForm/`: the booking form, its validation functions (`validation.js`) and their tests.
- `src/components/Main/`: the page routes and the booking logic (available times and submitting a booking).
- `src/pages/`: one folder per page the router can show.
- `src/utils/`: small helpers. `dates.js` converts between a date input's `YYYY-MM-DD` text and a JavaScript date, and checks that a date is complete.
- `src/api.js`: the course's booking API (see [About the booking API](#about-the-booking-api)).
- `src/index.css`: the global styles and the brand colours and fonts as CSS variables.

## Testing

Run the tests with `npm test -- --watchAll=false` (see [Run the tests](#run-the-tests)).

Each test file sits next to the code it tests and ends in `.test.js`. The tests cover:

- **The booking form**: the labels, the HTML validation attributes (`required`, `min`, `max`), the button being disabled or enabled, and that a valid booking is sent once with the right data while an invalid one is never sent.
- **The validation functions**: valid and invalid values for each field, including the edges (for example 0, 1, 10 and 11 guests).
- **The available-times logic** in `Main.js`, with the API replaced by a fake (a mock), so the results don't depend on today's date.
- **Accessibility details**: each field is found by its label, the form has a name, errors are linked to their fields, and the confirmation page moves focus to its heading.
- **Edge cases**: a failed save, a direct visit to the confirmation page, a date with no times, and a cleared date.

**Why fake the API and fix the date in tests:** a test that uses today's real date could pass today and fail tomorrow.

## Accessibility

- **Labels**: every field has a `<label>` connected to it, so clicking the label focuses the field and screen readers read the label out.
- **Error messages**: an invalid field is marked with `aria-invalid` and linked to its message with `aria-describedby`, so a screen reader reads the problem when you reach the field.
- **Named form**: the form has the name "Reserve a Table", so screen-reader users can jump straight to it.
- **Button name**: the submit button's accessible name matches its visible text. **Why:** voice-control users say what they see ("click Make Your reservation"), so the names must match.
- **Page changes**: the confirmation page sets its own browser tab title and moves focus to its heading, so screen readers announce the new page.
- **Urgent messages**: the failed-save message uses `role="alert"`, so screen readers read it out as soon as it appears.
- **Keyboard**: everything works with `Tab`, the arrow keys and `Enter`, and every control shows a visible focus ring.
- **Semantic HTML**: one `<h1>` per page, headings in order, and the `header`, `nav`, `main` and `footer` landmarks.

## About the booking API

The course provides a small booking API with two functions. A copy of it lives in [src/api.js](src/api.js):

- `fetchAPI(date)` returns the available times for a date, between 17:00 and 23:30. The times depend only on the **day of the month**, so the 9th of any month always shows the same times.
- `submitAPI(formData)` pretends to save a booking and always returns `true`.

Both are plain functions that answer straight away. There is no real server or network call.

**Why a local copy instead of loading it with a `<script>` tag:**

1. The course file is hosted on `raw.githubusercontent.com`, which sends it as plain text with a "don't guess the type" header (`nosniff`). Browsers refuse to run it as a script, so the functions would never exist.
2. Loading code live from someone else's repository means any later change to that file would run inside this app. A copy that I read and checked first is safer, and the tests can import it.

The only change from the original is that the two functions are exported. The top of the file records where it came from and when it was reviewed.

## Design

There is no Figma wireframe. I skipped that step and built the pages from the course's Little Lemon style guide (colours, fonts and spacing) and its mock-up.

## Known limitations

- **Unbuilt pages**: the menu links to About, Menu, Order Online and Login, but those pages aren't built yet, so they show a "Page not found" page.
- **Sample data**: the customer reviews and the contact details in the footer are made up.
- **No real bookings**: the course API doesn't save anything, so a booking is never stored and always "succeeds".
- **Placeholder preview image**: the `og:image` link used for social-media previews points to a placeholder address until the site is deployed.

## Git workflow

- Every feature or fix was built on its own branch (for example `feat/booking-form`).
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(booking): add booking form with controlled fields`.
- Each branch was merged into `main` through a pull request on GitHub.

## Author

[Re1veN7](https://github.com/Re1veN7)
