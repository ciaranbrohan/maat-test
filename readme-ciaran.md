# Gym Kiosk — Ciaran Brohan

## Architecture

Five-screen native stack (Home → Class → MemberSearch → CheckIn → Success) backed by a NestJS REST API and PostgreSQL. All data is fetched once at startup and held in a Zustand store; new check-ins are appended locally immediately after the API confirms, so the UI never waits for a second round-trip.

```
kiosk/          React Native (Expo) app
  src/
    screens/    One file per screen — no logic leaks into navigation
    components/ ClassCard, TagChip, HeroBanner, PromoBanner
    services/   api.ts — single thin wrapper around fetch
    store/      useAppStore.ts — Zustand, three slices: classes, members, checkIns
    utils/      time.ts — date/time formatting
    theme/      Colours, typography, spacing, radius tokens

backend/        NestJS API
  src/
    classes/    GET /classes
    members/    GET /members
    checkins/   GET /checkins, POST /checkins, DELETE /checkins/:id
    seed/       Seeds classes and members on first boot
```

## Tech Stack

- **Platform**: React Native, Expo SDK 56
- **State management**: Zustand 5
- **Navigation**: React Navigation 7 (native stack)
- **Animations**: moti (react-native-reanimated)
- **Backend**: NestJS 11, TypeORM, PostgreSQL (Docker)
- **Testing**: Jest, React Native Testing Library

## Design Decisions

**Option B (API) over Option A (local JSON)** — check-ins persist across restarts and the pattern is realistic for a production kiosk. Adds a Docker step but the seed service means the database populates on initial startup with no manual intervention.

**Filter checked-in members from the search list** — rather than let the user pick someone and hit an API error, already-checked-in members simply don't appear. The empty state distinguishes "no match for your search" from "everyone is already checked in."

**`navigation.reset()` on the Success screen** — clears the entire navigation stack so the back gesture is unavailable and the kiosk returns to a genuinely clean state rather than a Home screen with history behind it.

**Class name on the Check-In confirmation screen** — the spec asked for member name and date; adding the class name lets the member verify they're about to check into the right class before tapping the button.

**Initials fallback for profile pictures** — ClassScreen loads real profile images with an `onError` fallback to initials. MemberSearch uses initials only; loading dozens of remote images in a long scrollable list without an image-caching library felt like the wrong trade-off for a time-boxed assessment.

**API key authentication** — every request from the kiosk carries an `x-api-key` header; the backend validates it against `process.env.API_KEY` via a global NestJS guard. Simple, stateless, and appropriate for a single-client kiosk — no session management or token refresh needed.

## Beyond the Spec

Features added that weren't required but improve the experience:

- **Haptic feedback on check-in** — tactile confirmation the moment it succeeds; important for a physical kiosk where the member may not be looking directly at the screen
- **Capacity progress bar on class cards** — members can see at a glance which classes still have spots before navigating in
- **Class name on the check-in confirmation screen** — lets the member verify they're checking into the right class before committing
- **Filtered member search** — already-checked-in members don't appear in the search list; empty state distinguishes "no results" from "everyone is already checked in"
- **Offline-first check-in queue** — check-ins queue in AsyncStorage when offline and sync automatically on reconnect, surviving app restarts
- **Soft kiosk lock** — screen stays awake, orientation locked to portrait, status bar hidden; the device behaves like an appliance
- **Staff PIN to remove check-ins** — long-pressing the "Attendees" header prompts for a 4-digit PIN; correct entry reveals a per-row delete button backed by `DELETE /checkins/:id`. The feature is hidden enough that members won't stumble on it, but staff can correct mistakes without an admin portal
- **Avatar stack on class cards** — up to four checked-in member avatars are shown overlapping on each home-screen card so staff can see at a glance who's in each session
- **"Next up" badge** — the class starting soonest is highlighted so members don't have to mentally parse start times
- **Pull-to-refresh** — the home screen can be refreshed with a swipe to pick up schedule changes without restarting the app

## Trade-offs

- **No confetti or Lottie animations** — entrance animations are in (moti spring on the success checkmark, fade-in on check-in and member list). A full celebration animation on the success screen would be a nice touch but felt out of scope.
- **Soft kiosk lock mode** — screen stays awake (`expo-keep-awake`), orientation is locked to portrait (`expo-screen-orientation`), the status bar is hidden, and `navigation.reset()` clears the back stack on success. True Guided Access (iOS) or app pinning (Android) would require MDM configuration outside the app.
- **`localhost:3000` hardcoded** — works in Simulator out of the box; on a physical device you need to change `BASE_URL` in `kiosk/src/services/api.ts` to your machine's LAN IP.
- **Static API key** — the kiosk sends an `x-api-key` header validated by the backend. Sufficient for a local kiosk; a production deployment would rotate the key and store it in a secret manager rather than a `.env` file.
- **No integration tests** — unit tests cover components and store logic; integration tests across the full check-in flow (kiosk → API → database) weren't written within the time-box.

## Future Improvements

- Confetti or Lottie celebration animation on the success screen
- True kiosk lock via MDM-configured Guided Access (iOS) or app pinning (Android)
- QR code check-in as an alternative to name search
- Expo Image (or similar) for cached profile pictures in the member list
- Server-side PIN validation so the staff passcode isn't bundled in the client
- "You've been X times this month" stat on the success screen using historical check-in data

## Running the App

### Prerequisites

- Node 20+
- Docker (for PostgreSQL)
- Expo Go on your device, or an iOS Simulator / Android Emulator

### Backend

```bash
cd backend
docker compose up -d          # starts PostgreSQL on port 5432
npm install
npm run start:dev             # API on http://localhost:3000
```

The seed service runs automatically and populates classes and members if the tables are empty.

### Kiosk

```bash
cd kiosk
npm install
npx expo start
```

Press `i` for iOS Simulator, `a` for Android, or scan the QR code with Expo Go.

> **Physical device**: update `BASE_URL` in `kiosk/src/services/api.ts` from `localhost` to your machine's local IP address (e.g. `192.168.1.x`).

### Tests

```bash
# kiosk
cd kiosk && npx jest

# backend
cd backend && npm run test
```
