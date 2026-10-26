# Security policy

## Reporting a vulnerability

Do not publish credentials, personal information, or an exploitable report in a public issue. Contact the repository owner privately through GitHub Security Advisories or the account's verified contact channel.

## Security model

- Firebase Auth establishes identity. Google sign-in does not grant Admin rights.
- Admin rights are granted per Firebase project by the project owner adding an `admins/{uid}` document in Firestore Console. The client cannot create or edit admin records.
- Entry approval, ticket limits, spin counts, prize selection, no-repeat prize slots, and ledger outflows are handled in authenticated Cloud Functions and transactions.
- Participant contact, payment, address, donor submission, and ledger documents are protected by Firestore rules. Winner records and uploaded image URLs are public by design; avoid placing secrets or private documents in those images.
- Keep `.env` and service-account credentials out of source control. Rotate any secret that is accidentally published.
