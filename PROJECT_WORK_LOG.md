# Lucky Spinning Wheel — Project Work Log

## 2026-10-26 — Iteration 3 planned work (recorded before implementation)

### New requirements

- Connect and configure the application with the user's Firebase/Google account `soemyintswe@gmail.com`; user is willing to grant required permissions.
- Support recurring raffle events, with configurable recurrence count and opening/draw date and time.
- Add downloadable/printable operational and financial reports.
- Treat a won prize as owned by the winner but still in inventory until handover is confirmed; support failed contact and prize return/forfeiture with a recorded status and audit trail.
- Expand registration/sign-in options to email, Facebook, Viber, and Telegram where provider capabilities allow.
- Continue to record work before making modifications and limit scope to work completable within available context.

### Planned approach

1. Inspect available Firebase/GitHub CLI authentication, current Firebase project linkage, raffle schema, and current admin UI.
2. Never request or store account passwords, OAuth secrets, or service-account keys in source. If a privileged account consent screen or project selection must be completed by the owner, prepare the exact operation and request the smallest necessary action at that point.
3. Model recurrences as separate raffle instances generated from a schedule definition, with explicit local timezone and opening/draw timestamps; do not silently alter existing one-off raffles.
4. Add award delivery lifecycle states and inventory accounting so a win reserves inventory; transfer confirmation removes the reservation, while cancellation/return restores available inventory and preserves history.
5. Add admin-facing reports with CSV export for raffle participation, award outcomes/delivery, donations, and cash/goods ledger totals.
6. Add Facebook OAuth only if provider config can be safely completed. Treat Viber/Telegram as contact/identity verification or link-based onboarding unless a supported Firebase Auth provider/integration is configured; do not imply direct sign-in when no provider credentials exist.
7. Update README, architecture, security notes, and this log before committing and pushing to the user-requested GitHub repository.

### Access check pending

- The previously linked Firebase project ID, project owner permissions, OAuth provider credentials, custom-domain DNS access, and Firebase CLI session have not yet been verified in this iteration.
- No implementation edits have been made for iteration 3 at the time this plan was recorded.

### Progress — iteration 3 implementation

- Firebase CLI is installed (`15.32.1`) but its current authorized account is `mks.edu.services@gmail.com`, not the requested `soemyintswe@gmail.com`. The existing CLI account can see `mks-certificate-app`, `mks-certificate-app-cbf64`, `mks-education-hub`, and `teahouse-hybrid`; none is assumed to be the Lucky Wheel project. An async question is pending asking whether to create a dedicated `lucky-spinning-wheel` Firebase project or deliberately select one existing project. No Firebase resources have been changed.
- `firebase login:add --no-localhost soemyintswe@gmail.com` could not launch in this non-interactive terminal. Do not use the currently authorized `mks.edu.services@gmail.com` account to create or deploy resources for `soemyintswe@gmail.com` without explicit project ownership/access.
- After trying the Firebase CLI reauthentication flow, it failed before browser consent with `Failed to make request to https://auth.firebase.tools/attest`. The selected target is now `luckydraw-mksdev`, per user, but this target is not visible in the currently authenticated account's project list. Project existence/ownership and required OAuth login remain blocked on correct account access.
- Added recurrence creation for 1–24 independent raffle rounds at a configurable day interval, with local datetime inputs persisted as ISO timestamps. Backend entry approval and spin callables enforce opening/draw time; UI refreshes schedule status periodically.
- Added prize custody statuses. A win now reserves its prize without reducing ledger stock; Admin marks delivery to post the cash/goods outflow. Reclaiming a pending prize releases the reservation; reclaiming a delivered prize requires a reason and records an inventory return. Historical wins remain, and the prize slot stays consumed in its original draw.
- Added an Admin CSV reports page for participant, donation, award/delivery, and ledger rows. Added Facebook popup sign-in UI (Firebase provider/App credentials still need console setup), and Viber/Telegram contact fields at registration. Direct Viber/Telegram authentication remains unavailable without an external verified custom-auth integration.
- Documentation has been extended for recurrence, delivery accounting, reports, and provider setup. Final verification, review of account/project choice, and push are pending.

### Iteration 3 verification and remaining external setup

- `npm run build` succeeded after the implementation; the only warning is Vite's existing single bundle over 500 kB.
- `node --check functions/index.js` passed. Root and Functions `npm audit --omit=dev` each reported 0 vulnerabilities. `git diff --check` reported no whitespace errors.
- Firebase Console/Hosting, Auth providers, Firestore/Storage, custom domain DNS, and Functions have not been deployed. No `.env` or service-account key was created or committed.
- To finish Firebase connection, authenticate the Firebase CLI as `soemyintswe@gmail.com` (or add the current CLI principal `mks.edu.services@gmail.com` as Owner to project `luckydraw-mksdev` in Firebase IAM). Then verify/create that exact project and configure the Web app, Google/Facebook Auth providers, billing, Storage, Firestore, and Hosting domain. Do not commit `.env` or OAuth/service-account secrets.

## 2026-10-26 — Iteration 2 planned work (recorded before implementation)

### Request

- Let a verified organizer/donor run a draw, and let each eligible entrant spin the wheel themselves.
- Enforce the number of allowed spins, avoid paying the same prize twice, and calculate award values.
- Support a configurable cash pool and fixed prizes, then divide the remaining pool across consolation winners.
- Improve the bright, lively Burmese GUI.
- Support Google account sign-in so the project can be handed over to each deployment owner.
- Prepare the repository with a complete README, requirements/dependency lock files, ignore rules, license, usage guide, and a durable project log that future developers or agents can follow.
- Record the work in the GitHub account `soemyintswe@gmail.com` if a connected GitHub repository and authorized credentials are available.

### Starting point

- Existing app is a React + Vite frontend backed by Firebase Authentication, Cloud Firestore, Firebase Storage, and Firebase callable Cloud Functions.
- Current roles are Firebase `admins/{uid}` documents and approved user profiles. Participant entries and donations are admin-reviewed.
- Current callable draw picks a winner from approved entries, writes a public winner record, and records a prize outflow. Entry approvals record ticket income.
- Photos for organizer, participant, raffle, prize, donor, and donated goods upload to Firebase Storage. Financial/in-kind transactions are in a private admin ledger.
- Firebase project configuration and GitHub credentials/repository have not been supplied in this workspace. The app is not yet deployed to `lucky.mksdev.asia`.

### Planned implementation

1. Keep this log current as work proceeds; record architecture, security decisions, setup, deployment, limitations, and verification for future maintainers.
2. Add Google sign-in alongside email/password, preserve the pending-admin-approval workflow, and document project transfer/reconfiguration using the next owner's Firebase and Google accounts.
3. Model a draw round with a fixed prize pool, guaranteed non-repeating prize slots, organizer settings, participant eligibility, and a finite spin allowance per approved entrant.
4. Let an approved participant request a spin through a callable function. The server validates the owner, round, approval, eligibility, remaining spins, and unclaimed prizes in one transaction; it assigns the result once and updates remaining cash/in-kind balances.
5. Let an authorized organizer operate the same round, inspect the wheel and results, and manage rounds/prize allocation. Avoid duplicate prizes under concurrent requests.
6. Add a transparent fixed-prize-plus-equal-consolation calculation: reserve configured fixed awards first, divide the remaining pool among consolation slots using integer kyats, distribute any remainder kyats deterministically, and reject settings whose awards exceed the available pool. Show the calculation before publishing.
7. Refresh the wheel and draw UI with colorful, clear entrant/organizer states and clear remaining chances/results.
8. Complete GitHub-ready files and setup instructions. Check for an available authorized GitHub connection and publish to the user's requested account.
9. Build the frontend and perform syntax/dependency checks. Record exact results and any remaining external setup.

### Design/security decisions

- A spin attempt is a server-controlled operation. Browser requests cannot choose their own result, bypass spin limits, or award an already-claimed prize.
- Winner/award documents use immutable draw IDs and prize-slot IDs, and transaction contention must make competing spins resolve to distinct still-available slots or fail safely.
- Draw eligibility is tied to an approved participant entry and its ticket count. One spin consumes one allowance; repeated entries must not multiply allowance without admin approval.
- A draw round's total pool and fixed award amounts are stored in integer MMK (kyats). Consolation amount is calculated only from the remaining balance and number of remaining consolation slots; the UI and log show any remainder distribution.
- Google sign-in identifies a user but does not make them an admin. Admin authority remains an explicit per-project owner-controlled setup step, documented for safe handover.
- Public photos/results remain intentionally viewable as documented; private participant/contact/payment and ledger records remain behind Firestore rules.

### Progress — implementation in progress

- GitHub identity checked: connected account profile is `soemyintswe` / `soemyintswe@gmail.com`; local `gh` CLI is also authenticated as `soemyintswe`. No repository named LuckySpinningWheel was found. A dedicated repository will be created after implementation and checks.
- Replaced admin-only `drawWinner` with authenticated `spinRaffle`. A participant must own an approved entry; an Admin may let the server choose a remaining approved ticket at random. `ticketCount - spinsUsed` bounds each entry.
- Each request gets a client-generated UUID and a deterministic attempt document path, so retries of the same request return the first result. Spin attempt, entry counter, raffle lock, unique prize award, and applicable ledger outflow commit in one Firestore transaction.
- Fixed prizes get stable `fixed-N` IDs. Console settings add a cash pool and consolation count; first spin freezes the prize slots and distributes the pool remainder as whole MMK, spreading leftover kyats across the first slots. Each slot can be claimed once. Remaining chances after all slots are claimed record a no-win result.
- First successful spin sets `drawLocked`. Entry review prevents later approvals, while existing approved entries keep their unused spins. The organizer's button draws a random remaining entry; eligible participants get their own spin button.
- Raffle form now shows cash-pool and consolation calculations before save. Wheel result distinguishes a prize from a no-win attempt and displays remaining chances.
- Added Google popup sign-in while keeping Admin permission explicit. New Google users receive the same pending profile as other registrations.
- Added project handover instructions and prepared LICENSE, CONTRIBUTING, SECURITY, architecture notes, `.firebaserc.example`, `.nvmrc`, and CI workflow. Documentation cleanup and final checks remain.

### Current verification / remaining

- Earlier frontend build was successful after the UI and auth changes; final build and Functions checks still need rerunning after docs/rules work.
- Firestore and Storage rules need final review. Emulator integration tests have not been added or run.
- Firebase project config/domain access were not supplied, so deployment remains an owner action.
- Published repository: https://github.com/soemyintswe/LuckySpinningWheel (public, `main`). Initial implementation commit: `ac0e628`.
- Verification: `npm run build` succeeded (Vite reports one >500 kB chunk advisory); `node --check functions/index.js` passed; root and `functions` `npm audit --omit=dev` both reported 0 vulnerabilities; `git diff --cached --check` found only trailing blank lines at EOF in README and main.jsx, cleaned in follow-up.
- GitHub Actions `Verify` workflow passed on commit `edb3096`: web build, both production dependency audits, and Functions syntax check succeeded.

### Handover and deployment state

- Git author and GitHub repository owner are `Soe Myint Swe` / `soemyintswe@gmail.com` (`soemyintswe`). The repository is public and connected to `origin` on `main`.
- No Firebase project ID, Firebase owner credentials, or DNS access were supplied. `lucky.mksdev.asia` is documented as the intended custom domain, but hosting, Functions, Auth provider, Firestore, Storage, and DNS have not been deployed/configured.
- Before production use, create/select a Firebase project, configure the web app environment, enable Google and email providers, bootstrap an owner-controlled `admins/{uid}` document, then deploy rules/functions/hosting. Storage rules that consult Firestore require the Storage-to-Firestore permissions prompt to be enabled in Firebase.
- No emulator/security integration tests were run. Build and syntax checks do not substitute for a live Firebase rules/emulator review. Production security review and operational verification remain the deploying owner's responsibility.
- The UI can be previewed locally with `npm run dev`; first-time Firebase configuration is required for auth-backed use.
