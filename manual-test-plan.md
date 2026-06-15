# Manual Test Plan — Gym Kiosk

## Setup

1. `cd backend && docker compose up -d` — Postgres running
2. `cd backend && npm run start:dev` — API on http://localhost:3000
3. `cd kiosk && npx expo start --clear` — Metro bundler running
4. Open in iOS Simulator (`i`) or Expo Go on device

---

## 1. Home Screen

- [ ] Date label shows today's date in the correct format
- [ ] "Welcome to 🥋 Aranha" heading is visible
- [ ] Today's classes appear as a 2-column grid (single centred card on tablet)
- [ ] Each card shows: class name, time range, tags, attendee count, instructor
- [ ] Tapping a class card navigates to the Class screen
- [ ] Status bar is hidden (kiosk mode)
- [ ] Screen does not dim / go to sleep

**"Next up" badge**
- [ ] The class starting soonest (but not yet finished) shows a "Next up" badge at the top of its card
- [ ] No more than one card has the badge

**Capacity chip**
- [ ] A class at 80–99% capacity shows an amber "X spots left" chip
- [ ] A full class shows a red "Full" chip
- [ ] A class below 80% shows no chip
- [ ] The capacity progress bar fills proportionally across the bottom of the card

**Avatar stack**
- [ ] Class cards with check-ins show up to 4 overlapping member avatars
- [ ] Cards with no check-ins show no avatars

**Pull-to-refresh**
- [ ] Swiping down on the Home screen triggers a refresh
- [ ] The class list updates after the refresh completes

**Error state** (stop the backend, reload the app)
- [ ] Error message is shown
- [ ] Retry button is visible and tapping it re-fetches

**Empty state** (if no classes are scheduled for today's day)
- [ ] "No classes today" message is shown

---

## 2. Class Screen

- [ ] Back button returns to Home
- [ ] Info card shows: instructor avatar (initials), class name, time range, tags, attendee count / capacity, instructor name
- [ ] "Attendees" section header shows current count
- [ ] Each attendee row shows: avatar (photo or initials), full name, status chip, check-in time
- [ ] Status chip is green for `confirmed`, grey for `registered`
- [ ] "No check-ins yet" empty state shown when attendee list is empty
- [ ] "Add Check-In" button at the bottom navigates to Member Search

**Staff PIN — remove check-in**
- [ ] Long-pressing the "Attendees" header for ~1 second opens the PIN modal
- [ ] Entering a wrong PIN shakes the dot indicators and clears
- [ ] Entering `1234` dismisses the modal and shows a 🔓 next to the header
- [ ] Each attendee row now has a red ✕ button
- [ ] Tapping ✕ removes the attendee from the list immediately
- [ ] The removed check-in no longer appears after navigating away and back

---

## 3. Member Search Screen

- [ ] Back button returns to Class screen
- [ ] Search input is auto-focused
- [ ] Full member list appears on load
- [ ] Typing a name filters the list in real time (case-insensitive, debounced ~150ms)
- [ ] Clearing the search restores the full list
- [ ] Members already checked in to this class do **not** appear in the list
- [ ] "No members found" shown when search has no matches
- [ ] "All members are checked in" shown when everyone is already checked in
- [ ] Tapping a member row navigates to the Check-In screen for that member
- [ ] Each row shows the member's profile picture, or initials if no photo

---

## 4. Check-In Screen

- [ ] Back button returns to Member Search
- [ ] Member's profile picture is shown (or initials if no photo / load error)
- [ ] Member's full name is displayed
- [ ] Class name is displayed (above the date)
- [ ] Today's date is shown in the correct format
- [ ] Content fades and slides up on screen entry
- [ ] "Check In" button is visible and tappable
- [ ] Tapping "Check In" shows a loading spinner on the button
- [ ] On success: navigates to the Success screen
- [ ] After success: the member no longer appears in the Member Search list for that class

**Error state** (point api.ts BASE_URL at a bad port)
- [ ] Error message appears below the date
- [ ] Button becomes tappable again (loading clears)

---

## 5. Success Screen

- [ ] Full-screen accent colour background
- [ ] ✓ checkmark springs in (bounces, doesn't just appear)
- [ ] Member name fades in after the checkmark
- [ ] "checked into [class name]" fades in after the name
- [ ] Screen auto-resets to Home after ~3 seconds
- [ ] After reset: no back button / back gesture leads to the Success screen

---

## 6. Offline Flow

- [ ] Disable wifi / network on the device
- [ ] Navigate: Home → Class → Member Search → Check-In
- [ ] Tap "Check In" — should succeed and navigate to Success (queued locally)
- [ ] The member should appear in the Class attendee list immediately (optimistic)
- [ ] Re-enable network
- [ ] The queued check-in should sync automatically (no action needed)
- [ ] Restart the app while offline — pending check-in should still be in the queue (persisted in AsyncStorage)

---

## 7. Kiosk Mode

- [ ] Status bar is hidden on all screens
- [ ] Screen stays on (does not auto-lock) while the app is open
- [ ] Rotating the device — orientation stays locked to portrait

---

## 8. Full Happy Path (run this last)

1. Open app on Home screen
2. Tap a class → Class screen
3. Tap "Add Check-In" → Member Search
4. Type a partial name → member appears
5. Tap the member → Check-In screen
6. Confirm name, class, and date are correct
7. Tap "Check In" → Success screen
8. Wait 3 seconds → returns to Home automatically
9. Tap the same class → member now appears in the attendee list with a timestamp
