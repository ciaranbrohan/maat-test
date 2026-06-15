# Gym Kiosk — Ciaran Brohan

## Architecture

Five-screen native stack (Home → Class → MemberSearch → CheckIn → Success) backed by a NestJS REST API and PostgreSQL. All data is fetched once at startup and held in a Zustand store; new check-ins are appended locally immediately after the API confirms, so the UI never waits for a second round-trip.

```
kiosk/          React Native (Expo) app
  src/
    screens/    Home, Class, MemberSearch, CheckIn, Success — one file per screen, no logic leaks into navigation
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
- **Offline / connectivity**: AsyncStorage, NetInfo
- **Kiosk utilities**: expo-keep-awake, expo-screen-orientation, expo-haptics
- **Backend**: NestJS 11, TypeORM, PostgreSQL (Docker)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, React Native Testing Library

## Design Decisions

**Option B (API) over Option A (local JSON)** — check-ins persist across restarts and the pattern is realistic for a production kiosk. Adds a Docker step but the seed service means the database populates on initial startup with no manual intervention.

**Filter checked-in members from the search list** — rather than let the user pick someone and hit an API error, already-checked-in members simply don't appear. The empty state distinguishes "no match for your search" from "everyone is already checked in."

**`navigation.reset()` on the Success screen** — clears the entire navigation stack so the back gesture is unavailable and the kiosk returns to a genuinely clean state rather than a Home screen with history behind it.

**Initials fallback for profile pictures** — ClassScreen loads real profile images with an `onError` fallback to initials. MemberSearch uses initials only; loading dozens of remote images in a long scrollable list without an image-caching library felt like the wrong trade-off for a time-boxed assessment.

**API key authentication** — every request from the kiosk carries an `x-api-key` header; the backend validates it against `process.env.API_KEY` via a global NestJS guard. Simple, stateless, and appropriate for a single-client kiosk — no session management or token refresh needed.

## Beyond the Spec

Features added that weren't required but improve the experience:

- **Haptic feedback on check-in** — tactile confirmation the moment it succeeds; important for a physical kiosk where the member may not be looking directly at the screen
- **Capacity progress bar on class cards** — members can see at a glance which classes still have spots before navigating in
- **Offline-first check-in queue** — check-ins queue in AsyncStorage when offline and sync automatically on reconnect, surviving app restarts
- **Soft kiosk lock** — screen stays awake, orientation locked to portrait, status bar hidden; the device behaves like an appliance
- **Staff PIN to remove check-ins** — long-pressing the "Attendees" header prompts for a 4-digit PIN; correct entry reveals a per-row delete button backed by `DELETE /checkins/:id`. The feature is hidden enough that members won't stumble on it, but staff can correct mistakes without an admin portal. Brute-force protection locks the keypad for 30 seconds after 5 failed attempts. Staff mode auto-locks after 30 seconds of inactivity. The PIN is configurable via `EXPO_PUBLIC_STAFF_PIN` in `kiosk/.env` (defaults to `1234`)
- **Undo delete** — deleting a check-in shows a 3-second toast with an Undo button; the API call is deferred until the window closes, so accidental taps are recoverable without touching the backend
- **Avatar stack on class cards** — up to four checked-in member avatars are shown overlapping on each home-screen card so staff can see at a glance who's in each session
- **"Next up" badge** — the class starting soonest is highlighted so members don't have to mentally parse start times
- **Pull-to-refresh** — the home screen can be refreshed with a swipe to pick up schedule changes without restarting the app

## Trade-offs & Known Limitations

- **Success screen animation** — the checkmark uses a moti spring entrance. A full Lottie celebration animation would be a nicer touch but felt out of scope for the time-box; Lottie also adds non-trivial bundle weight.
- **Soft kiosk lock mode** — screen stays awake (`expo-keep-awake`), orientation is locked to portrait (`expo-screen-orientation`), the status bar is hidden, and `navigation.reset()` clears the back stack on success. True Guided Access (iOS) or app pinning (Android) would require MDM configuration outside the app.
- **Static API key and staff PIN** — the kiosk sends an `x-api-key` header validated by the backend, and the staff PIN is set via `EXPO_PUBLIC_STAFF_PIN`. Both live in `.env` files; a production deployment would rotate the API key via a secret manager and validate the PIN server-side rather than bundling it in the client.
- **No integration tests** — unit tests cover components and store logic; integration tests across the full check-in flow (kiosk → API → database) weren't written within the time-box.
- **Tested in IOS/Android Simulator only** — the app has not been validated on a physical devices; behaviour may differ, particularly around network (LAN IP vs. `localhost`) and haptics.

## Future Improvements

- Lottie celebration animation on the success screen
- True kiosk lock via MDM-configured Guided Access (iOS) or app pinning (Android)
- QR code check-in as an alternative to name search
- Expo Image (or similar) for cached profile pictures in the member list
- Server-side PIN validation so the staff passcode isn't bundled in the client
- "You've been X times this month" stat on the success screen using historical check-in data
- Integration tests covering the full check-in flow (kiosk → API → database)
- Physical device testing (iOS + Android) to catch network and haptic edge cases
- **TanStack Query for server state** — replace the fetch-once Zustand model with TanStack Query handling classes, members, and check-ins (caching, background refetch, stale-while-revalidate); Zustand would be retained for client-only UI state (offline queue, staff mode, modals)
- **Real-time cross-device sync** — add a WebSocket or SSE channel from the NestJS backend (via `@nestjs/websockets`) emitting `checkin.created` / `checkin.deleted` events so check-ins on one kiosk invalidate the query cache on all connected devices immediately


## Running the App

### Prerequisites

- Node 20+
- Docker (for PostgreSQL)
- Expo Go on your device, or an iOS Simulator / Android Emulator

### Backend

copy .env.example to .env

```bash
cd backend
docker compose up -d                  # starts PostgreSQL on port 5432
npm install
npm run start:dev                     # API on http://localhost:3000
```

The seed service runs automatically and populates classes and members if the tables are empty.

### Kiosk

> **Physical device**: before running, update `BASE_URL` in `kiosk/src/services/api.ts` from `localhost` to your machine's LAN IP (e.g. `192.168.1.x`). Expo Go on a physical device cannot reach `localhost` on your Mac.

copy .env.example to .env
```bash
cd kiosk
npm install
npx expo start
```

Press `i` for iOS Simulator, `a` for Android, or scan the QR code with Expo Go.

> **Staff PIN**: defaults to `1234`. Override by creating `kiosk/.env` with `EXPO_PUBLIC_STAFF_PIN=your_pin`.

### Tests

```bash
# kiosk
cd kiosk && npx jest

# backend
cd backend && npm run test
```
