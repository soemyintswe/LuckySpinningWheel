# Architecture and data model

Read this note with `PROJECT_WORK_LOG.md` before changing draw behavior.

## Runtime

- React 19 / Vite frontend (`src/main.jsx`, `src/style.css`); Firebase browser config is in ignored `.env`.
- Firebase Auth uses email/password and Google popup. Account creation is one-time. New profiles start active but unapproved; after approval the user joins each raffle separately. The Firebase owner grants Admin through `admins/{uid}`.
- A raffle's `entryMode` is `free` by default, or `paid` for manually verified ticket payments, or `points` for promotion points/coupon references. Paid income posts to `ledger` on approval. Point cost is checked and deducted from `users/{uid}.pointsBalance` atomically with approval. Admin awards points after manually verifying a product purchase/coupon; external commerce and coupon validation are not integrated.
- Admin can suspend and reactivate profiles. Delete is a soft removal: contact/profile data is anonymized, Rules block participation, and historical raffle snapshots remain for audit. Firebase Authentication user deletion/disable requires owner action in Console; the Spark client cannot perform privileged Auth user administration.
- Spark setup uses Firestore only. The frontend does not call Cloud Functions or upload to Firebase Storage. Image fields store publicly accessible URLs.
- Draw choice uses `crypto.getRandomValues()` in the browser. Firestore Rules enforce ownership, spin quota and no duplicate prize slot, but cannot verify that a modified browser chose a fair random result. This is not suitable as a server-verified draw for high-stakes lotteries.

## Collections

| Collection | Purpose / access |
| --- | --- |
| `admins/{uid}` | Project owner-created Admin allowlist. Client writes are denied. |
| `users/{uid}` | Auth profile, approval and lifecycle status, private contacts, and Admin-managed `pointsBalance`. Private to owner/Admin. |
| `raffles/{raffleId}` | Public setup, organizer snapshot, `entryMode` (`free`/`paid`/`points`), ticket/points rate, schedule, ticket count, cash pool, `remainingCash`, prize setup, `drawSpinsUsed` and `drawLocked`. Each recurring round is a separate document. |
| `raffles/{raffleId}/prizeSlots/{slotId}` | Immutable prize choices initialized with the raffle. Each quantity becomes a unique slot. Cash consolation slots split remaining pool into whole MMK. |
| `raffles/{raffleId}/claimedSlots/{slotId}` | Permanent claim marker preventing a prize slot from being awarded twice. |
| `raffles/{raffleId}/spinAttempts/{spinId}` | One attempt record per random ID, including entry and win/no-win result. Immutable. |
| `participants/{entryId}` | Private raffle entry and contact/payment/coupon reference. New entry IDs are `{uid}_{raffleId}`, limiting each account to one request per raffle; `ticketCount` is the requested chance count, `spinsUsed` is the draw quota used, and `status` is Admin review status. Owner/Admin access. |
| `donations/{donationId}` | Private donor submission, item/value, contact and image URLs. Admin review creates ledger income. |
| `winners/{winnerId}` | Public winner and prize snapshot, unique `prizeSlotId`, custody state and delivery history. Client transaction creates winner/claim/attempt together; only Admin changes custody. |
| `ledger/{entryId}` | Admin-only donations, ticket income, prize outflow on delivery, return inflow, and manual rows. |
| `pointLedger/{entryId}` | Admin-only point awards, adjustments, and raffle-entry deductions. |

## Spin transaction

1. The client loads prize slots and chooses an approved participant entry (the participant's own entry, or an Admin-operated entry with remaining allowance).
2. A Firestore transaction rereads raffle and entry, validates status, timestamps and remaining quota, then reads all claim markers before writing anything.
3. The client chooses no-win or one unclaimed slot using browser cryptographic random values. The transaction increments `spinsUsed` and `drawSpinsUsed`, locks the draw and records an immutable attempt. For a win it creates the winner snapshot and unique slot claim in the same transaction.
4. Concurrent clients race on transaction reads/writes. Firestore retries a transaction on a conflicting claim; it then sees that slot as unavailable. Rules also deny rewriting an existing claim marker.
5. Rules cannot validate the random choice itself. A modified client could claim a different still-available slot. For trusted randomness move the choice into a server-controlled function and plan for Blaze billing.

## Approval and custody transactions

- Admin entry approval increments raffle `ticketCount`; paid entries post ticket income, and promotion entries deduct points and write a point-ledger row in the same transaction. Approval is blocked after the draw locks.
- To award promotion points, Admin validates a purchase/coupon outside the app and uses the account controls. The participant can attach a coupon code/reference to a points entry; Admin checks it manually. No payment gateway or merchant coupon API is connected.
- Participant registration is not repeated for each raffle. Existing approved accounts use “Get raffle chance” for each new raffle; the account profile is reused and entry details become a private snapshot.
- Donation approval changes status and creates an income row atomically.
- Winner status starts as `pending`; the prize remains reserved and ledger inventory is unchanged until handoff. Marking delivered posts one outflow and reduces cash balance. Reclaiming a delivered award posts a return and restores the cash balance. Reclaiming before handoff frees inventory accounting but keeps the original slot consumed, preserving the no-repeat audit trail.
- Public image URLs must be accessible to users' browsers. Shared Drive links are normalized to a thumbnail URL where possible; the host can still block embedding or revoke access.

## Handover

A new operator configures a Firebase project, Auth providers, Firestore rules/indexes, authorized domains, and their own ignored `.env`. The owner creates the first `admins/{uid}` document in the Firebase Console. Hosting/custom domain and DNS access are separate from this source repository. Never commit `.env`, service account keys, or OAuth secrets.
