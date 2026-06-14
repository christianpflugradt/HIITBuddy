# HIITBuddy

HIITBuddy is a lightweight workout companion for interval-based circuit training on a shared screen. It is designed first for tablets in landscape orientation and works well when mounted on a wall during a session.

The app helps a group move through rounds without discussing who goes where next. You choose participants, choose exercises, set the timers, and start. HIITBuddy assigns each active person to a different station, shows the current pairing with a large countdown, handles breaks between efforts and rounds, and keeps going for as many rounds as you want until you finish the workout.

## What it does

- Configure active participants and keep additional names in a pool for later use.
- Start with the eight HYROX stations as built-in defaults.
- Add your own custom exercises with selectable icons.
- Run interval rounds with configurable work, rest, round break, and initial get-ready timers.
- Show the live assignment for every participant so no station is duplicated within a round step.
- Skip the current exercise or jump to the end of the round when needed.
- Extend breaks directly from the workout screen.
- Share a full workout setup through a copied link.
- Finish on a summary screen without requiring an account, backend, cookies, or local storage.

## Running the app

You can run HIITBuddy with Docker Compose and the included `Makefile`.

### Requirements

- Docker
- Docker Compose
- `make`

### Start

```bash
make build
```

This pulls the latest published image from GHCR and starts the container. The app is then available at [http://localhost:8080](http://localhost:8080).

### Stop

```bash
make down
```

### Start again

```bash
make up
```

## How to use it

1. Open the start screen and choose `New workout`.
2. Add people, move them between active and pool, and keep between 1 and 12 active participants.
3. Choose the exercises you want for this workout. Exercises are shown alphabetically, with the built-in HYROX set visually separated from custom ones. You need at least as many selected exercises as active participants, up to 20 exercises total.
4. Set the timers. All timer values must stay between 5 and 300 seconds.
5. Start the workout.

During the workout:

- The first round begins with a get-ready countdown.
- Work and break countdowns are based on system time so they stay aligned with real seconds.
- You can skip the current exercise, skip to the round end, or extend breaks with the buttons on screen.
- The workout runs for unlimited rounds until you choose to finish.

At the end you see a summary screen and can return to a new workout from there.

## Sharing setups

Each setup step includes a copy action. This copies a link that contains the full workout configuration in the URL, so the same people, exercise choices, and timer values can be reopened on another device.

## Privacy and data model

HIITBuddy is a frontend-only application.

- No backend state
- No accounts
- No cookies
- No local storage

The only share mechanism is the setup link you explicitly copy.

## For developers

HIITBuddy is a framework-free TypeScript app with Web Components, plain CSS, and a small Node-based build and static server setup. The repository includes GitHub Actions for push checks and manual semantic-release publishing to GHCR.
