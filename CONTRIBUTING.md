# Contributing

Thanks for helping with Lucky Spinning Wheel.

## Before changing the draw flow

1. Read `PROJECT_WORK_LOG.md`, `docs/ARCHITECTURE.md`, `firestore.rules`, `storage.rules`, and `functions/index.js`.
2. Keep draw eligibility, one-use prize slots, idempotency, and per-entry spin caps enforced in Cloud Functions transactions. Do not move draw decisions into React.
3. Keep personal contact/payment data private. Public image URLs and winner announcements are intentional and must be documented.
4. Update the work log and architecture note whenever collections, rule behavior, prize calculations, or project handover steps change.

## Local checks

```sh
npm ci
npm run build
cd functions && npm ci && node --check index.js && npm audit --omit=dev
```

Do not commit `.env`, Firebase service-account keys, Google OAuth secrets, local Firebase emulator state, `node_modules`, or `dist`.

## Pull requests

Describe the user-visible behavior, security/rules changes, migration or handover impact, and the checks you ran. Include screenshots for meaningful GUI changes.
