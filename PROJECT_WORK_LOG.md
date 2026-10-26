# Lucky Spinning Wheel — Project Work Log

## 2026-10-26 — Iteration 4 planned work (recorded before implementation)

### User's Spark Plan direction

- Do not link either billing account. Keep Firebase on Spark; leave Cloud Storage and Cloud Functions undeployed.
- Replace callable Cloud Function dependency for draw/approval/delivery operations with client Firestore transactions and strict Firestore Security Rules.
- Replace Firebase Storage uploads with direct image URLs (including publicly viewable Google Drive image links).
- Use the generated `luckydraw-mksdev` Firebase web configuration in the ignored local `.env`.
- Run `npm run build` and syntax checks; make the local app ready for `npm run dev` testing.

### Security boundary for client-side draws

- Firestore Rules can enforce approved-entry ownership, one spin per transaction, `spinsUsed < ticketCount`, immutable prize-slot documents, one claim document per slot, and atomic winner/attempt writes.
- Firestore Rules cannot attest that a modified browser used fair randomness or prevent a malicious client from choosing any still-unclaimed prize. The local implementation can use `crypto.getRandomValues`, but that is not a trusted server lottery. UI/docs must disclose this limitation; do not claim server-grade draw fairness.
- Direct image links must be public and embeddable. Google Drive URLs may stop working when sharing changes or the provider blocks hotlinking; the UI should preview/fail clearly and never request Drive passwords/tokens.

### Planned implementation

1. Remove all frontend callable-function usage and Storage upload usage.
2. Create immutable prize-slot docs at raffle creation and use Firestore transactions to atomically consume an approved entry spin, unique slot claim, winner, and attempt.
3. Tighten Firestore Rules so client transactions cannot bypass spin quotas or create duplicate prize claims; let Admin perform approval and delivery state changes without Cloud Functions.
4. Keep prize inventory in the ledger until handover; record return/reclaim transitions transactionally.
5. Add direct image URL inputs with preview and Drive shared-link normalization.
6. Keep Cloud Functions source optional but un-deployed; document Spark limitations and the security difference from trusted server randomness.
7. Update work log/README/architecture, build and syntax-check, then push the completed source to GitHub.

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
- User selected Firebase CLI login with `soemyintswe@gmail.com` as the access method. The CLI's `login:add` initially treated this agent terminal as non-interactive; forcing `--interactive` then reached the auth proxy but failed because `https://auth.firebase.tools/attest` timed out (confirmed by a 10-second connection timeout). CLI remains logged in only as `mks.edu.services@gmail.com`. Firebase Console was opened in the Codex browser for owner sign-in/project review; no browser login was performed by the agent.
- Added recurrence creation for 1–24 independent raffle rounds at a configurable day interval, with local datetime inputs persisted as ISO timestamps. Backend entry approval and spin callables enforce opening/draw time; UI refreshes schedule status periodically.
- Added prize custody statuses. A win now reserves its prize without reducing ledger stock; Admin marks delivery to post the cash/goods outflow. Reclaiming a pending prize releases the reservation; reclaiming a delivered prize requires a reason and records an inventory return. Historical wins remain, and the prize slot stays consumed in its original draw.
- Added an Admin CSV reports page for participant, donation, award/delivery, and ledger rows. Added Facebook popup sign-in UI (Firebase provider/App credentials still need console setup), and Viber/Telegram contact fields at registration. Direct Viber/Telegram authentication remains unavailable without an external verified custom-auth integration.
- Documentation has been extended for recurrence, delivery accounting, reports, and provider setup. Final verification, review of account/project choice, and push are pending.

### Iteration 3 verification and remaining external setup

- `npm run build` succeeded after the implementation; the only warning is Vite's existing single bundle over 500 kB.
- `node --check functions/index.js` passed. Root and Functions `npm audit --omit=dev` each reported 0 vulnerabilities. `git diff --check` reported no whitespace errors.
- GitHub Actions `Verify` passed on commit `a98d622`, including frontend build, both production dependency audits, and Functions syntax check.
- Firebase Console/Hosting, Auth providers, Firestore/Storage, custom domain DNS, and Functions have not been deployed. No `.env` or service-account key was created or committed.
- At the end of this first check, Firebase CLI OAuth was blocked by network access to `auth.firebase.tools`; see the provisioning progress below for how the project owner account was used through `gcloud` instead. The project exists now; remaining setup is billing-dependent Storage/Functions, Facebook provider credentials, initial Admin UID bootstrap, Hosting deployment, and DNS verification. Do not commit `.env` or OAuth/service-account secrets.

### Firebase provisioning progress — 2026-10-26

- The user's authorized Google Cloud account `soemyintswe@gmail.com` was available through `gcloud` credentials even though Firebase CLI auth proxy was unreachable. Created Google Cloud/Firebase project `luckydraw-mksdev` (`Lucky Draw MKS Dev`) and attached Firebase resources. The project owner remains the requested account.
- Created Firebase Web App `Lucky Spinning Wheel`; its public web configuration is stored only in the ignored local `.env`. `.firebaserc` is also local/ignored and targets `luckydraw-mksdev`.
- Enabled Email/Password and Google providers, set the Google support address to `soemyintswe@gmail.com`, and authorized the default Firebase domains, `localhost`, and `lucky.mksdev.asia`.
- Created Cloud Firestore Standard database `(default)` in `asia-southeast1` with free tier enabled. Compiled and deployed the project Firestore rules as release `cloud.firestore`.
- Project billing is currently disabled. No Cloud Billing account has been linked. The account exposes two open billing accounts; choosing one requires the owner because it controls which account receives usage charges.
- Cloud Storage's new Firebase default bucket and Cloud Functions deployment require Blaze/pay-as-you-go billing under current Firebase requirements. Storage bucket, Functions, and live Hosting deployment remain pending owner billing selection. No payment method or billing account was altered.
- `.env` and `.firebaserc` remain git-ignored; no access token or service-account key was written to GitHub.
- Added the enabled Email/Password and Google provider setup to `firebase.json` so a future Firebase CLI deployment can reproduce the Authentication configuration. Project Auth was configured through Firebase's provisioning API and verified enabled using the project's Identity Toolkit configuration.
- Added three required composite indexes for raffle approval queries and participant/donation owner listings; index build operations are still `CREATING` as of this log update. They must reach `READY` before the corresponding queries are available.
- Owner has been asked to select one of the two existing billing accounts or defer billing. No response has been received yet; keep Storage bucket creation and Cloud Functions deployment paused until an account is explicitly chosen.

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

### Iteration 4 — Spark-only Firebase path (2026-10-26)

- User explicitly selected Firebase Spark: do not link a billing account, deploy Cloud Functions, or create Firebase Storage. The `luckydraw-mksdev` project, Firestore database and local ignored `.env` remain configured from the prior setup.
- Updated the React client to use Firestore transactions for spins, approvals, donations, and prize delivery/reclamation. Each raffle now gets stable `prizeSlots`; claims are stored once in `claimedSlots`. Every spin transaction increments the entry use count and raffle attempt counter, and a winning transaction creates the winner, claim, and attempt records atomically.
- Prize cash is held in `remainingCash` until delivery. Delivery posts a ledger outflow and reduces the balance; reclaim after delivery posts a return and restores cash. Reclaim before delivery releases the reserved prize without falsely booking an outflow.
- Removed Firebase Storage image upload integration from the client. Profile, organizer, entrant, raffle, prize, donor and donated-item images now accept public direct URLs; public Google Drive links are normalized to a thumbnail URL where possible.
- Replaced Firestore rules to allow only authenticated, approved participants to consume their own approved spin quota; raffle counter, participant counter, attempt, winner and claimed slot must form one atomic transaction. Admin-only controls cover approvals, accounting, and prize delivery. Prize slot documents become immutable for the draw after the first spin.
- Important security boundary: client-side `crypto.getRandomValues()` is not a trusted random source when the client is controlled by the entrant. Firestore rules prevent over-spinning and duplicate slot claims, but cannot prove the result was selected fairly. Do not describe Spark-only client draws as server-verified/fraud-proof; use a trusted server draw for high-stakes public lotteries.
- Updated the README for Spark-only setup and added the fairness, public-image URL, and owner handover limitations. Cloud Functions source is retained for reference and is not deployed or called by the Spark client.
- Deployed the Spark client Firestore Rules to `projects/luckydraw-mksdev/releases/cloud.firestore` using the `soemyintswe@gmail.com` Google Cloud login. Rules compile succeeded; the release now points to ruleset `83a330a0-001e-414a-9e48-c757a82a9151`.
- Verified all three configured Firestore composite indexes show `READY`.
- Added Firestore `Timestamp` schedule fields so rules enforce opening/draw time using trusted request time rather than relying only on browser time. The UI also displays the client-side randomness limitation.
- Final verification: `npm run build` succeeded; `node --check functions/index.js` and `git diff --check` passed. Vite reports one advisory bundle over 500 kB (863.56 kB minified; no build failure).
- Confirmed `.env` resolves to project ID `luckydraw-mksdev` without exposing config secrets, `.env` and `.firebaserc` remain Git-ignored, and the existing local preview at `http://localhost:5174/` returns HTTP 200.
- Published source and project notes to GitHub `main`: commit `fc40af6` (`Support Spark plan client-side draws`). Working tree was clean immediately after push.

### Iteration 5 — logout landing and optional image URL layout (2026-10-26)

- User report from screenshots: after sign-out, the account dialog stays open and the dashboard remains visible; image URL fields overlap/squeeze nearby form controls. Images should be optional.
- Closed the account dialog on sign-out and added a signed-out landing page with sign-in/register choices. Successful email sign-in/register closes the auth dialog; signed-out users no longer see the management dashboard.
- Replaced the large empty image tile with an optional, compact URL field and a small preview only when a link is supplied. The fields wrap within narrow prize/donation forms; a profile image can be cleared.
- Verification: `npm run build` and `git diff --check` passed. Vite continues to show the known large-JS-chunk advisory; no build errors.

### Iteration 6 — separate membership from raffle entry (2026-10-26)

- User feedback: the action currently labeled as registration actually creates a raffle entry, which is confused with creating an account. They want a one-time account, then separate participation for each raffle. Free gift/commemorative draws should be the default; ticket sales and promotion points/coupons should also be supported. Admin should suspend or remove accounts.
- Planned changes: rename participant action and form copy to “claim/get raffle chance”; add per-raffle entry mode defaulting to free, with paid ticket and points/coupon promotion options; keep account registration in its own auth flow and allow an existing account to join multiple raffles.
- Add account status controls for Admin (active, suspended, deleted). In Spark/no Functions mode, “delete” will be an irreversible-in-app soft deletion/anonymization and Firestore Rules deny future activity; the Firebase Auth identity itself is not physically removed by client code. State this limitation clearly and keep an audit record.
- Update Firestore rules to require active account status for participant actions, prevent suspended/deleted users from entering or spinning, update README/architecture, run build/rules compile, and push changes to GitHub.
- Implemented a free (default), paid ticket, and points/promotion entry mode on each raffle. Paid entries require transfer details and create income ledger rows only after Admin approval. Points entries show the requested point total, can include a coupon/reference, and deduct points on Admin approval after account balance validation.
- Added Admin point balance adjustments with a `pointLedger` audit collection. Coupon/product claims are manually verified by Admin and credited as points; this Spark release does not integrate an external store or automatically redeem vendor coupons.
- Renamed raffle entry actions and modal to “ကံစမ်းခွင့်ရယူရန်”. The separate membership registration explicitly says it is one-time; entry requests reuse profile identity/contact, select a raffle, and create a deterministic `{uid}_{raffleId}` record so one account cannot submit duplicate entries for the same raffle but can enter later raffles.
- Added Admin account list with approve, suspend/reactivate, point adjustment, and soft-delete actions. Suspension/deletion signs out the affected client and Firestore Rules deny new entries and profile edits while inactive. Soft deletion clears profile/contact fields but retains historical raffle snapshots for audit. Firebase Authentication itself is not physically deleted/disabled from client code; project owner can disable it in Firebase Console.
- Firestore rules also check raffle entry mode, schedule, open status and ticket cap when creating an entry; the account must be active/approved. Added Admin-only `pointLedger` access and protected profile lifecycle/points fields.
- Firestore Rules compiled and deployed to `luckydraw-mksdev` as ruleset `f9161782-e785-4736-8e15-ec6fa5fc46e8`.
- Final build and GitHub push remain pending for this iteration.

- Final verification: `npm run build` succeeded and `git diff --check` passed. Vite continues to show the known large JavaScript bundle advisory (880.14 kB minified). Firestore Rules are deployed as ruleset `f9161782-e785-4736-8e15-ec6fa5fc46e8`.
- Published Iteration 6 changes to GitHub `main` after verification; commit `ad0ff49` (`Separate account registration from raffle entry`).

### Iteration 7 — clarify navigation, winner choices, and consolation cash (2026-10-26)

- User asked what “အဓိက စီမံခန့်ခွဲမှု” means, and requested clear Admin-wide controls plus donor/participant self-service for winnings: reinvest a prize as a donation or transfer it to another user. Also requested consolation cash either evenly divided or set at a fixed amount, with whole-kyat handling to avoid fractional payouts.
- Planned changes: inspect navigation labels and winner/donation schemas; rename ambiguous navigation to a direct term; implement winner-submitted prize disposition requests for donation/transfer with Admin review and accounting; add selectable consolation allocation modes (equal whole-MMK split with deterministic remainder handling, or fixed whole-MMK amount) and validate the total does not exceed pool; update Firestore Rules, architecture and README/work log before deploy/push.
- Security constraints: a winner may request an action only for their own pending prize; recipient must be an active/approved user; donation/transfer requests must preserve original prize audit and cannot double-spend; Admin remains final approver for money custody/accounting. If Spark rules cannot safely support atomic transfer/donation without Functions, document and implement the safest review-based workflow.

- Implemented Iteration 7 UI and accounting changes: renamed workspace “အဓိက စီမံခန့်ခွဲမှု” to “မဲစီမံခန့်ခွဲမှု”; added winner-owned requests to donate a prize back or transfer it to an active approved member by email; Admin review records the custody change and corresponding ledger entries in a Firestore transaction.
- Added consolation allocation mode: equal whole-MMK split with deterministic remainder kyats assigned to earliest slots, or a fixed whole-MMK amount per slot. Validation multiplies fixed prize amount by quantity and rejects budgets exceeding the cash pool; unused fixed-mode balance remains unallocated.
- Extended Firestore Rules for requester-only prize request creation/read and Admin-only decision; Admin winner updates can now record transfer/donation ownership and custody status.
- `npm run build` succeeded (known Vite bundle advisory remains). `git diff --check` passed.
- Initial Rules deployment failed because Firebase CLI defaulted to `mks.edu.services@gmail.com`, which lacks `serviceusage.services.use`. After the user added `soemyintswe@gmail.com`, switched the project CLI default with `firebase login:use soemyintswe@gmail.com`; Firestore Rules compiled successfully and deployed to `luckydraw-mksdev` (`cloud.firestore`).
- Published Iteration 7 source and documentation to GitHub `main` as commit `c9630b4` (`Add winner prize choices and consolation modes`). The Firestore Rules deployment remains pending the authorized CLI account.

- Follow-up: after the user completed Firebase CLI login, switched to `soemyintswe@gmail.com` and deployed the Iteration 7 Firestore Rules successfully. The live prize request flow is now enabled.

### Iteration 8 — Admin recognition and raffle visibility/entry repair (2026-10-26)

- User screenshots show the intended `soemyintswe@gmail.com` account still displays “approval pending”; the raffle dropdown is empty and its action is disabled. User also reports a raffle scheduled to open tonight is no longer visible and cannot be entered.
- Inspection points to two probable code issues: Admin role is sampled only once at auth start (so an Admin document created afterward is not observed until reload), and `drawLocked` (which freezes prize slot configuration after first spin) is also used to hide/block future entries and approvals. This conflates prize setup locking with raffle entry availability.
- Planned repair: subscribe to the Admin document live alongside the user profile; keep scheduled/active raffles visible and accept entries/approvals while draw time and ticket caps allow even when prize slots are frozen; preserve `drawLocked` only for prize setup. Verify the current project ID, build, and deploy corrected Firestore Rules after validation.
- Cloud privilege action: creating `admins/{UID}` grants elevated permissions. The user explicitly approved granting Admin to `soemyintswe@gmail.com`.
- User approved creating the `admins/{uid}` document for `soemyintswe@gmail.com`. Firebase Authentication lookup resolved this exact account to UID `Wr6vfnoyswRRou81ca97p7CxYXT2`. Direct Firestore REST calls consistently timed out from this environment, so the Admin document could not be created/verified. Manual Console action required: Firestore Database → `admins` collection → create document ID `Wr6vfnoyswRRou81ca97p7CxYXT2`, fields `email` string `soemyintswe@gmail.com`, `role` string `admin`. The user profile should then become Admin automatically via the live listener.
- Iteration 8 code fixes subscribe to the Admin document live and no longer block raffle entries/entry approvals solely because prize configuration is locked after a spin. `npm run build` succeeded (Vite reports the known JS bundle size advisory). Firestore Rules compiled and deployed successfully to `luckydraw-mksdev`.

- Verification: `npm run build` passed; `git diff --check` passed. Live Rules deployed after Firebase CLI account was selected as `soemyintswe@gmail.com`. Admin profile provisioning is the remaining manual Console action because Firestore REST host connections timed out.

### Iteration 9 — Publish Firebase Hosting site and verify Admin document (2026-10-26)

- User shared Firebase Console screenshot confirming `admins/Wr6vfnoyswRRou81ca97p7CxYXT2` exists with email `soemyintswe@gmail.com` and role `admin`; the Firebase Hosting URL `https://luckydraw-mksdev.web.app` currently displays Firebase “Site Not Found”.
- Inspection: Hosting default site `luckydraw-mksdev` exists and `firebase.json` serves `dist`, but the user-facing site is not deployed/currently missing. Build and deploy Hosting to the confirmed project, then verify the public URL returns the app. Ensure the previous Admin listener and raffle entry fixes are included in the build. Record final URL and commit.
- User then supplied Firebase Console screenshot confirming the Admin document already exists at `admins/Wr6vfnoyswRRou81ca97p7CxYXT2` with the expected email/role fields. This resolves the previously pending Admin provisioning step; the app's live listener will recognize the role after the deployed bundle loads.
- `npm run build` succeeded. Deployed Firebase Hosting to the existing default site `luckydraw-mksdev`; the release completed and `https://luckydraw-mksdev.web.app` returned HTTP 200 with the Burmese app HTML.

### Iteration 10 — diagnose `luckydraw.mksdev.asia` Hosting custom domain (2026-10-26)

- User screenshot reports Firebase Hosting internal error and DNS request failure while editing custom domain `luckydraw.mksdev.asia`; console requests a CNAME pointing to `luckydraw-mksdev.web.app`.
- Planned diagnostic: query current public CNAME/A/TXT records and compare with Firebase Hosting custom-domain requirements. Do not change DNS provider settings or remove existing records without verifying current state and obtaining a concrete authorized path.
- DNS diagnostics: authoritative nameservers are `ns-a1.cloud.z.com`, `ns-a3.cloud.z.com`, `ns-a4.cloud.z.com`; each currently returns `luckydraw.mksdev.asia CNAME luckydraw-mksdev.web.app`. Google DNS also resolves the CNAME and Firebase Hosting target to `199.36.158.100`/`2620:0:890::100`.
- Firebase Hosting CustomDomain API currently reports `hostState=HOST_UNREACHABLE`, `ownershipState=OWNERSHIP_UNREACHABLE`, `DNS_SERVFAIL`, and still requests the exact CNAME above (`requiredAction=ADD`). HTTPS presents a hostname/certificate mismatch, so SSL provisioning is not complete. No DNS changes made; ask Z.com DNS support to investigate why Firebase Hosting's DNS checker sees SERVFAIL even though public/authoritative queries return the CNAME. If the record was just saved, allow propagation/cert provisioning time (Firebase says up to 24 hours) and re-run Verify.
- User provided Z.com DNS screenshot confirming CNAME host `luckydraw`, TTL 3600, target `luckydraw-mksdev.web.app`, alongside the delegated Z.com NS records. This matches the required Firebase CNAME; recheck current DNS and Firebase domain status before recommending additional DNS edits.

### Iteration 11 — diagnose persistent Admin-pending state (2026-10-26)

- User confirms Admin pending still appears after signing in at the deployed `.web.app` origin. Screenshots show `admins/Wr6vfnoyswRRou81ca97p7CxYXT2`, and `users/Wr6vfnoyswRRou81ca97p7CxYXT2` has `approved:true`, while a second users document has another UID.
- Hosted bundle inspection confirms the live Admin-document listener is deployed. The remaining unknown is the actual Firebase Auth UID in this browser session or whether Firestore denies reading its matching Admin document. Email text alone cannot distinguish these cases.
- Planned small diagnostic: show current `user.uid` and Admin-document listener result (found/missing/access error) inside Account modal. Do not auto-grant Admin by email; authorization must remain UID-bound. Build, deploy Hosting, and have user report the displayed UID/status if it still says pending.
- Added an Account-modal diagnostic showing the signed-in Firebase UID and whether the matching Admin document is found, missing, or denied by Firestore Rules. This does not grant privileges based on email.
- `npm run build` succeeded; Firebase Hosting deploy completed to `luckydraw-mksdev` (`https://luckydraw-mksdev.web.app`). Known bundle-size advisory remains.

### Iteration 12 — verify deployed Admin diagnostic and persistent pending banner (2026-10-26)

- User confirms the signed-in Authentication UID and Firestore document UID are both `Wr6vfnoyswRRou81ca97p7CxYXT2`; the Admin document is already present, yet the account still shows approval pending.
- The newly supplied account-modal screenshot does not visibly include the UID/Admin-document diagnostic that Iteration 11 says was added. Before changing role logic or granting any additional access, compare the locally built app with the live Hosting HTML/JS assets and inspect the deployed account modal. This may be a stale or different Hosting release, or a runtime/read-rule failure.
- After identifying the mismatch, fix only the demonstrated cause, then build and deploy the intended Firebase Hosting site. Never infer Admin from email alone; continue binding the role to the authenticated UID.
- Live Hosting HTML currently references the same bundle as local `dist` (so the source is deployed), and that bundle does contain the diagnostics. However, `/` was served with `Cache-Control: max-age=3600`, explaining why an already-open browser could keep an older account modal for up to an hour. The latest screenshot's missing UID/Admin status is consistent with that stale HTML view.
- Refactored Auth initialization to subscribe directly to the signed-in UID's profile and `admins/{uid}` documents, wait for both snapshots before publishing role state, ignore stale callbacks across account changes, and display Firestore read/write errors instead of silently falling back to pending. Admin recognition requires the matching UID document to have `role: admin`.
- Updated Firebase Hosting cache headers so `/` and `/index.html` are revalidated without cache while content-hashed `/assets/**` remain immutable. Build and diff checks pass; Hosting deploy and live cache/header verification are next.
- Rebuilt and deployed the change to `https://luckydraw-mksdev.web.app`. Live verification returns HTTP 200, the updated hashed JS bundle, and `Cache-Control: no-store, must-revalidate, no-cache` for the app shell. The app should now fetch fresh HTML on the next visit/reload; if Admin status still fails, the account modal will expose whether the matching Admin doc is missing or Firestore returned an error.

### Iteration 13 — raffle editing unavailable (2026-10-26)

- User reports they cannot edit the raffle shown in the screenshot. Initial source/rules inspection indicates the Admin UI only supports creation; no raffle edit action or update handler is present in the raffle list. Firestore Rules do allow Admin updates, so this appears to be a missing feature rather than an account permission issue.
- Before implementation, define safe edit behavior: allow Admins to edit raffle details and entry/draw schedule, but prevent changing immutable prize slots/budgets after a draw has started or entries/claims exist in ways that would corrupt accounting. Keep already-created round identity and audit fields unchanged.
- Add a clear edit action for an Admin on each raffle card, prefill the existing form, save with `updateDoc`, and show actionable errors. Record build/deploy and GitHub commit after implementation.
- Implemented Admin raffle editing in the raffle list and overview cards. The edit form preloads existing values and updates the existing raffle document rather than creating a duplicate round. An Admin can revise the schedule, title, description, image, and ticket cap; when any entry exists or a spin has started, prize, ticket-price, pool, and payment terms are frozen to protect participants and accounting.
- When a raffle has no entries or spins, Admin can update its prize setup; the existing prize-slot docs are replaced in the same Firestore batch as the raffle update. The editor preserves round/series IDs and records updater/time. Entry caps cannot be lowered below already requested/approved ticket counts.
- `npm run build` passes after adding the feature. Next: verify diff, deploy Hosting, verify the new bundle, and publish the project log/source to GitHub.
- Hosting deploy completed to `luckydraw-mksdev`; the live app returns HTTP 200 with the new hashed JS/CSS assets and the no-cache HTML header. Build and `git diff --check` pass. No Firestore Rules change was needed because the existing rules permit Admin raffle updates and prize-slot changes while `drawLocked` is false.

### Iteration 14 — participant entry hangs and payout details (2026-10-26)

- User reports that submitting a free raffle entry leaves the button at “sending”, the modal open, and no pending entry visible to Admin. They also request winner payout details for KBZPay, WavePay, AYA Pay, CB Pay, bank account, and account holder name.
- The entry flow currently awaits a Firestore transaction without any UI deadline. It catches errors but leaves the form open; a stalled connection can therefore look like a permanent send. Admin moderation reads pending entries from `participants`, separate from account approval.
- Planned fix: add a bounded wait with clear “check entries before retry” guidance (Firestore cannot cancel an already submitted client transaction), validate unique raffle/user entry and eligibility, surface Firebase error codes in a useful Burmese message, and add optional winner payout provider/name/phone/account fields to each entry. Keep payout information in the private `participants` document, visible to that user and Admin only. Update Admin participant table to show payout destination without exposing it publicly, deploy matching Firestore Rules if schema validation is tightened, then build/deploy and record results.
- Implemented a 20-second UI timeout around the idempotent Firestore entry transaction, connection check, inline form error, and Burmese mapping for permission/network errors. A timeout explicitly tells the participant to check the entry list before retrying because the client SDK cannot cancel an in-flight transaction. The deterministic `{uid}_{raffleId}` document ID still prevents duplicate entry requests.
- Added optional payout destination selection (KBZPay, WavePay, AYA Pay, CB Pay, bank, or other), account-holder name, and wallet/account number to the private participant record. Admin participant table displays the destination; Firestore access remains owner/Admin only and the payout details are not copied into public winner documents. Updated the architecture data-model note. Existing Rules already support these private owner/Admin reads and participant creates, so no Rules deployment was needed.
- `npm run build` and `git diff --check` passed. Deployed Hosting to `https://luckydraw-mksdev.web.app`; live HTML serves the updated `index-DOgKxKe5.js` bundle and no-cache header. GitHub push pending.

### Iteration 15 — Burmese end-user and Admin guide (2026-10-26)

- User requests a complete Burmese usage guide for regular participants and Admins. Before writing, verify actual UI names, entry approval, raffle scheduling/spin timing, prize custody/donation/transfer, donations, cash/goods ledger, reports, profile/account controls, payout details, and image URL limitations against current source.
- Create `docs/USER_GUIDE_MY.md` as step-by-step task documentation for participants and Admins, including common errors and the distinction between one-time account approval and per-raffle entry approval. Link it from README. Do not promise features or payment integrations that the current app does not provide.
- Added the Burmese user/Admin guide and linked it from README. It explains account vs raffle-entry approval, free/paid/points workflows, schedule gates, recurring rounds, Admin reviews and spin process, payout details, donations, prize custody, ledger and CSV reports. It also documents current client-side draw limitations and the fact that reclaim is currently exposed only after a prize has been marked delivered; it warns Admins not to falsely mark an undelivered prize as delivered. Documentation was compared against current UI and Firestore access model; `git diff --check` is the final validation. No app code or Hosting deploy is required for this documentation-only change.

### Iteration 16 — new registered account missing from Firestore/Admin list (2026-10-26)

- User screenshot shows a newly authenticated account (`tunnaingsoe2932003@gmail.com`, UID shown in screenshot) in the Account modal with profile approval pending and Admin-document status stuck at “checking”. User reports the account is not appearing in Admin approval list and they cannot find its Firestore profile.
- Existing Auth startup listens for missing `users/{uid}` and attempts `setDoc`, but does not expose profile provisioning status, retry control, or a timeout when Firestore listeners have not emitted. Registration may therefore leave the user unsure whether Auth succeeded while Firestore profile creation failed or is still offline.
- Planned repair: expose profile-document status separately from Admin allowlist status, set a bounded listener diagnostic, add an owner-only retry that checks `users/{uid}` and creates the default pending profile only if absent, with explicit read/write errors. Keep Admin grants UID-based and never alter approval state for an existing user. Update guide/work log; deploy only if code changes, then validate Hosting/build and publish to GitHub.
- Added a Firestore profile status distinct from the Admin document status, a 12-second diagnostic timeout, guarded automatic creation for a missing profile, and an owner-only retry action that checks both own profile and own Admin allowlist. The retry creates a pending profile only if absent and never resets existing approval/role data. `permission-denied`, timeout, and missing profile states are now exposed in the Account modal. Updated the user guide troubleshooting table. `npm run build` and `git diff --check` pass; Hosting deploy and GitHub push remain.
- Firebase Hosting deploy completed. Live URL returns HTTP 200 with the new hashed app bundle and `Cache-Control: no-store, must-revalidate, no-cache`. This makes the cause observable and gives the signed-in user a safe retry; the original user's private Firestore state could not be inspected directly from this workspace, so confirm the exact Firestore error from the updated Account modal if profile creation still fails.

### Iteration 17 — confirm missing profile after Auth account exists (2026-10-26)

- New screenshots confirm `tunnaingsoe2932003@gmail.com` exists in Firebase Authentication but not in the Admin participant/account list; dashboard shows one existing raffle participant and zero pending account approvals. This points to a missing Firestore `users/{uid}` profile document, not to the Auth user being absent.
- The previous Hosting update added profile status and an owner-only retry, but the latest screenshot does not expose that status. Verify active CLI project/account and re-deploy the checked Firestore rules to the same project so the own-profile create rule is current. Then live-check the Hosting bundle and ask the user to use the account modal retry/status. Do not manually create a different user's Admin record; the new account remains an unapproved participant.
- Firebase CLI is confirmed on project `luckydraw-mksdev` as `soemyintswe@gmail.com`. Deployed the checked Firestore Rules; Firebase reports the active ruleset is already up to date and compiled. The `users/{uid}` rule permits an authenticated account to read and create its own profile with the pending participant defaults. The live Hosting bundle contains both the separate Firestore profile diagnostic and the retry action. The latest screenshots still do not show the updated Account-modal status/retry result, so the precise Firestore write error remains unknown; no user or Admin document was manually altered.

### Iteration 18 — make website registration provision Admin-approvable profiles reliably (2026-10-26)

- User reiterates that Admin must approve accounts in the website and they cannot manually create Firestore documents. Screenshots prove a profile for Daisy (`users/JHZE…`, approved) exists, while the new Google Auth account `tunnaingsoe2932003@gmail.com` uses UID `Q81…` with no matching Firestore user profile; the dashboard's zero pending count is consistent with that missing profile.
- The current app has fallback profile creation in the auth-state listener, but Google/Facebook popup sign-in does not await profile creation before treating sign-in as complete. Improve the website registration/sign-in flows to call an idempotent `ensureParticipantProfile(user)` directly after Auth success; create only when the UID profile is absent, preserve existing approval/role fields, and show a clear website error if Firestore denies/fails. On failure, route the signed-in user to the Account modal retry/status. This must not grant Admin privileges.
- Verify build, deploy Hosting, confirm live bundle, update guide/work log, and push to GitHub. Firestore rules are already current and allow an authenticated user to create their own pending profile.
- Implemented shared, UID-deduplicated profile provisioning for email/password registration/login and Google/Facebook popup login, plus the Auth-state fallback. New Firestore profiles are pending participants only; existing profile fields (including `approved` and `role`) are preserved. Profile creation/update failures now keep the signed-in user in the Account modal with a Firestore status and retry action rather than silently losing the approval record.
- Updated the Burmese user guide to explain automatic first-login profile creation and Website-only retry/status. `npm run build` and `git diff --check` passed. Deployed Hosting to `luckydraw-mksdev`; live `https://luckydraw-mksdev.web.app/` returns HTTP 200, serves `index-CFBjQ82N.js`, and returns no-cache HTML. No Firestore Rules change or console-side user edits were needed. Published source, guide, and log to GitHub `main` at commit `7c411ea`.

### Iteration 19 — additional raffle entries not appearing (2026-10-26)

- User reports two new chances requested but only Daisy appears in the selected raffle participant table. Screenshots show four/five approved accounts overall, which is a different collection from per-raffle `participants` entries.
- Read-only Firestore REST inspection under the configured `soemyintswe@gmail.com` CLI identity found the active raffle `သီတင်းကျွတ်မုန်ဖိုး` has `maxTickets: 1`, `ticketCount: 1`, and exactly one approved participant entry (Daisy). The other two requests have no participant documents. The existing client/rules capacity guards therefore reject those requests; there is no pending request to approve.
- Before changing the interface, document cause. Improve the entry form to show remaining capacity and stop submissions with a clear message when full; make the Admin edit note explicit that max chance count can be raised after entries exist, while prizes/payment terms remain locked. Do not change the live raffle's cap because that changes the published participation terms; the Admin can choose and save a revised cap through the Website.
- Validated with `npm run build` and `git diff --check`; deployed Hosting; the live URL returns HTTP 200 and serves the new bundle. The entry form shows remaining capacity and stops a full-capacity request with an actionable message. The note implied the capacity field was editable after entries exist; the next iteration corrects that UI omission. No Firestore data was changed. Published source and log to GitHub `main` at commit `bf9fa36`.

### Iteration 20 — capacity input hidden while editing a raffle with entries (2026-10-26)

- User screenshot shows the raffle editor displays only title, description, and image when an entry already exists, so the capacity input is absent despite the prior iteration's note suggesting the Admin could raise it in this state.
- Source inspection confirms `ကံစမ်းခွင့်အများဆုံး` was nested inside the `!editRestricted` block. The restricted save path already supports updating `maxTickets`, but the form hid the field. This is why the Admin could not follow the capacity fix through the Website.
- Move the capacity field outside the restricted block, keep prize/payment terms locked, and retain validation preventing capacity from dropping below approved/pending tickets. Build, deploy, verify live bundle, update this record, and publish the fix.

- Moved the max-chance input outside the restricted prize/payment block, so it is visible and editable after an entry exists. Build and diff checks pass; deployed Hosting and verified HTTP 200 serving index-f2TPzqA2.js. Existing raffle and Firestore data remain unchanged. Published source and log to GitHub `main` at commit `4740544`.

### Iteration 21 — schedule fields hidden and draw countdown requested (2026-10-26)

- User screenshot confirms max chances is now visible and editable but the editor still says open/draw schedule can be edited without displaying those inputs. Source confirms the schedule row remained inside `!editRestricted`, so schedule changes are also impossible after an entry exists.
- Move the open/draw datetime controls outside the restricted prize/payment block. Preserve current validation and restricted update path, which already writes the schedule fields.
- User asks to show when the draw happens and a countdown beginning 30 minutes before draw time. Show the local draw date/time on raffle rows; show a live HH:MM:SS countdown in the final 30 minutes and a clear ready state at/after draw time. Update the clock cadence, add compact responsive styles and update user guide. Do not alter existing live raffle schedule. Build, deploy, verify, and publish.

- Moved open/draw time controls outside the restricted block, so Admin can edit the schedule after entries exist; the existing restricted save path persists those values and validates draw time after opening time. Raffle cards now display local draw date/time and a 30-minute live countdown that updates every second, then shows a ready state at draw time. Updated the Burmese guide. Build and diff checks pass; Hosting returns HTTP 200 with index-1mSx2k7E.js and index-DsPab_9M.css. Existing raffle schedule/data were not changed. Published source, user guide and log to GitHub `main` at commit `5409000`.

### Iteration 22 — draw counts, wheel operator/mode, ticket limits, points policy, live winners (2026-10-26)

- User asks to explain the mismatch between `3 + 5 ဆု` and `3 / 7 မဲ`, allow Admin and participant wheel control by raffle, choose one-spin-at-a-time vs use-all-remaining-chances, show winners live, prevent duplicate prizes, enforce participant ticket limit and remaining stock, optionally carry promotion-point remainder forward, and show actionable limit/errors.
- Current UI uses `raffle.maxTickets` as total approved ticket capacity and `raffle.ticketCount` as approved tickets; prize slots are independent. Do not silently reduce prizes when capacity changes because that alters the published prize plan and monetary allocation. Show these counts separately and warn when prize slots exceed total draw rights.
- Inspect draw transaction, Firestore Rules, current raffle fields, user entry form, and winner listeners before implementation. Candidate configuration: raffle-level allowed spin actors (participant/Admin/both), spin mode (one per action vs exhaust own remaining chances), per-user ticket maximum, and points remainder policy. Preserve transaction-level unique claimed prize slots and cap wins/spins by that user's approved chances. Any batch mode should use sequential single-spin transactions unless both client and Rules safely support atomic batch writes.
- Check current Firestore setup read-only; document findings; implement feasible controls/validation/live winner display; update guide/log; build/deploy/check live bundle; publish to GitHub. Do not modify the live raffle prize values, financial totals, or chance limits without explicit approval.
- Implemented separate raffle-card counts: prize tiers plus consolation prize slots, approved ticket count versus total ticket limit, waiting reservations, and remaining availability. The UI warns when planned prize slots exceed the available draw rights; no current raffle document was modified.
- Admin can now configure the allowed wheel operator (participant, Admin, or both), choose one spin per click or all eligible remaining spins per click for each operator, set the per-participant ticket cap, and choose whether unused points carry forward or expire when the request is approved. Entry form and Firestore rules enforce account approval, raffle open/draw window, remaining capacity, and per-user limits; pending requests reserve capacity and rejection releases it.
- Refactored draw flow into sequential Firestore transactions, each consuming exactly one approved ticket. Existing claimed-slot uniqueness is retained; winner records update through the realtime Firestore listener. Admin-side legacy raffle slot bootstrap reconstructs slots from stored prize configuration only when an Admin starts a draw and no slots exist.
- Updated `docs/USER_GUIDE_MY.md` with the meaning of the counts, ticket and points policies, wheel modes, and live winner behavior.
- `npm run build` succeeded (Vite reports the existing large-bundle advisory); `git diff --check` succeeded; Firebase compiled and deployed Firestore Rules and Hosting to `luckydraw-mksdev`; live Hosting returned HTTP 200 and serves `index-Cq0mfaId.js` / `index-fFRpMOop.css`.
- No raffle, prize, points, participant, or ledger data was changed during deployment. Current project remains on Spark: wheel randomness is chosen in the client and enforced for eligibility/slot uniqueness by Firestore Rules, so it should not be used as a regulated or high-value lottery without server-side trusted randomness.
- Published implementation to GitHub main at commit `5af2279` (2026-10-26).

### Iteration 23 — clarify the non-functional workspace dropdown (2026-10-26)

- User asks what the sidebar "မဲစီမံခန့်ခွဲမှု" label and down arrow do; clicking has no effect.
- Source inspection shows it is a static `.workspace` div with a decorative `ChevronDown`; there is no workspace-switching state or action. The arrow falsely suggests the user can select another workspace.
- Remove the decorative arrow and keep the area as a clear static label. Build, deploy Hosting, verify the live app, and publish the change. No Firebase data or rules changes are needed.
- Removed the fake dropdown chevron; the static workspace label now has a descriptive title. `npm run build` and `git diff --check` passed, Hosting was deployed, and the live page returned HTTP 200 with bundle `index-sI1JZMW-.js`. No rules or Firestore data changed.

### Iteration 24 — wheel music, spin effects, prize fanfare and celebration animation (2026-10-26)

- User requests an optional background tune during the draw, a wheel-turning sound, distinct fanfares for first/second/third prizes, and GIF-like celebratory motion.
- Implement browser-native Web Audio tones and CSS celebration animation, avoiding remote copyrighted sound files and external asset hosting. Provide a visible sound toggle with persisted preference; start audio only from the user's wheel-click gesture to comply with browser autoplay restrictions. Stop looping audio after a draw and select the fanfare from prize tier. Include reduced-motion support and document browser audio behavior.
- Build and diff-check, deploy Hosting, check live response, and publish source, user guide, and work log.
- Added browser-synthesized low-volume background melody and wheel ticks during spins, rank-specific first/second/third prize fanfares, a remembered sound toggle, and CSS confetti/wheel celebration animation. Sound begins on the wheel click (browser autoplay policy), can be toggled in the wheel modal, and respects reduced-motion settings. Updated the Burmese user guide. `npm run build` and `git diff --check` passed; Hosting deployed and live URL returned HTTP 200 with `index-DQICFbm7.js` and `index-Bciiv6I2.css`. No Firebase data or rules changed.

### Iteration 25 — align wheel landing with prize result and prepare winner payout

- User reports that the Wheel's apparent landing and the recorded prize amount do not match. Current source confirms the wheel graphic is four static labels while Firestore independently selects an actual prize slot, making the visual result misleading. Replace the graphic with dynamic slices built from remaining prize slots and non-winning spins; derive the selected slice and persisted prize from the same transaction outcome. Open the Wheel immediately in a ready state and require an explicit center-button click. Keep the result hidden until the spinning animation has reached the exact returned slice and stopped.
- Prepare winner payout UI using the winner's saved, private participant payout method/account and the exact prize amount. Never copy account details into public winner documents. Provide an Admin payout summary and copy action.
- A payment QR that opens KBZPay/Wave/AYA/CB with a prefilled amount needs a provider-recognized payload and eligible merchant/API access. Do not fabricate a QR payload. KBZPay official merchant material describes partner/merchant onboarding and platform integration; ask for provider credentials/spec if the user needs an actual scan-to-pay QR. Keep any payout QR pending that integration and clearly label information-only content if offered.
- Update guide/log; build and inspect UI, deploy Hosting and Rules if required, verify live bundle, publish to GitHub. Do not change winner records or financial ledger data as part of UI work.
- Replaced the static four-label wheel with variable prize/non-winning slices weighted to the exact remaining outcomes. A draw action opens a prepared Wheel; only its center button starts the transaction. The transaction selects one index and prize slot, the same returned slice drives the decelerating rotation, and results remain hidden until the 3.75-second stop completes. Batch spins stop on each ticket before continuing; prizes stay unique through `claimedSlots`.
- Cash winner cards now show the exact persisted prize value and the Bank/Wallet/name/account saved with that ticket (admin-only). Admin can copy the transfer details; no private payout fields were added to public winner docs. The app does not fabricate a wallet payment QR: actual amount-prefilled KBZPay/other-wallet QR requires a recognized provider merchant/API integration and account credentials, so this UI states that limitation. `npm run build` and `git diff --check` passed; Hosting returned HTTP 200 serving `index-BnI5qFeK.js`; guide updated. No Firestore rules, raffle documents, winner records, or financial ledger entries changed.
