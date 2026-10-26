# Architecture and data model

This note is intended for the next developer or coding agent. Read it with `PROJECT_WORK_LOG.md` before changing a draw.

## Runtime

- React 19 / Vite frontend (`src/main.jsx`, `src/style.css`). Firebase browser config comes from `.env`.
- Firebase Auth provides email/password and Google popup sign-in. Facebook popup sign-in is available after its provider is configured in Firebase Console. Viber/Telegram remain contact methods, not direct auth providers. A signed-in user gets a `users/{uid}` profile with `approved:false`; a project owner grants Admin separately through `admins/{uid}`.
- Firestore stores raffle, entry, donation, award, and financial ledger records. Storage stores image binaries; Firestore stores their download URLs.
- Cloud Functions v2 in `asia-southeast1` validate approvals and spin requests. Deploy them with rules, not as a client-only app.

## Collections

| Collection | Purpose / access |
| --- | --- |
| `admins/{uid}` | Per-project Admin allowlist. Created by the Firebase project owner, never by the client. |
| `users/{uid}` | Auth profile, approval state, avatar and private contact data. Owner and Admin can read; user can change only allowed profile fields. |
| `raffles/{raffleId}` | Public draw setup: title, organizer snapshot, ticket cap, fixed prizes, `cashPool`, `consolationCount`, derived `drawSlots`, `drawLocked`, `remainingCash`, `openAt`, `drawAt`, `seriesId`, `roundNumber`, and recurrence metadata. Each recurrence round is a separate raffle document. Admin writes; everyone reads public raffle details. |
| `raffles/{raffleId}/spinAttempts/{spinId}` | Idempotent result of a single spin request. The callable writes; owner/Admin can read. |
| `participants/{entryId}` | Private entry tied to `userId`, raffle, approved `ticketCount`, `spinsUsed`, contact/address/payment details and profile image. Owner/Admin reads; Admin review is required. |
| `donations/{donationId}` | Private donor submission, donor/item photos, type, quantity, total value and review status. Admin approval creates the income ledger transaction. |
| `winners/{winnerId}` | Public award record with `raffleId`, `prizeSlotId`, winner snapshot, amount/type, `deliveryStatus` (`pending`, `delivered`, or `reclaimed`), and `deliveryHistory`. `spinRaffle` creates awards; Admin-only `updatePrizeDelivery` changes custody status transactionally. |
| `ledger/{entryId}` | Admin-only income/outflow rows for approved donations, approved ticket sales, prizes only when transferred, returned prizes, and manual adjustments. An untransferred prize remains in cash/goods inventory. |

Storage paths are `profiles/{uid}/{file}`, `donations/{uid}/{file}`, and `raffles/{uid}/...`. Individual images must be under 5 MB and have an image content type. Public reads are intentional for displayed profiles, raffle/prize imagery, and winner announcements.

## Spin and award rules

1. A participant may call `spinRaffle` only for their own `status:'approved'` entry. Admin may spin on behalf of a random eligible entry. The server requires `spinsUsed < ticketCount`.
2. The caller sends a fresh random `spinId`. The attempt document path is deterministic under the raffle, so a network retry returns the original result and cannot consume the same request twice.
3. A Firestore transaction reads the raffle, all approved entries for the raffle, and the awards already made. It constructs the prize slots once, sets `drawLocked`, consumes one spin, and commits an optional winner and ledger outflow atomically.
4. Each configured fixed prize has a unique `fixed-N` slot. The cash consolation balance is `cashPool - fixed cash awards`. If `consolationCount > 0`, integer MMK is split with `floor(balance/count)`; leftover kyats go one apiece to the first consolation slots. `consolationCount:0` leaves the unscheduled money in `remainingCash`.
5. Every award slot is selected at most once. Across remaining attempts, win probability is bounded by `available slots / remaining approved spins`; remaining attempts after all awards have been used are logged as no-win results. Goods and cash prizes have separate ledger types.
6. Once the first spin succeeds, `drawLocked:true` prevents new participant approvals. Existing approved entries retain their remaining spins. Pending registrations cannot become eligible after the draw starts.
7. Server time gates opening and draw timestamps. Recurring setup generates independent raffle documents, each with its own entries, winners, and ledger links. Admin CSV reports join the currently loaded entries, donations, winners, and ledger rows.

## Prize custody

An award starts in `pending` and reserves its prize slot, but does not create a ledger outflow. Admin marks it `delivered` when cash/items are handed over; the callable writes the outflow and updates `remainingCash`. Admin can reclaim a pending award with a reason, or accept a returned already-delivered award, which posts a ledger inflow. A reclaimed slot remains consumed in its original round to preserve the no-repeat guarantee and audit trail.

## Handover to another owner

The application contains no fixed Firebase/GitHub user identity. A new owner makes a Firebase project, configures Authentication, Firestore, Storage, billing and authorized domains, supplies their own untracked `.env`, deploys rules/functions, then bootstraps their first Admin UID in `admins/{uid}`. Firebase resources and a custom domain are separate from the source repository and must be transferred or recreated through Firebase/GCP IAM and DNS. Never add an exported service-account key or `.env` to GitHub.

The source repository is expected at `https://github.com/soemyintswe/LuckySpinningWheel`; fork it or transfer repository ownership if a different operator will maintain it.
