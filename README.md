# RentSure — Mobile & Web App (Frontend)

Frontend for RentSure. One codebase runs on **Android, iOS and the web**:
React Native + Expo (SDK 58) + Expo Router + TypeScript.

## Run it

```bash
cd mobile
npm install
npm run web        # opens in the browser at http://localhost:8081
npm start          # scan the QR code with Expo Go on a phone
```

Checks: `npm run typecheck` and `npx eslint src`.

**Demo accounts:** on the welcome screen tap *Tenant demo* or *Landlord demo*, or log in with
`tenant@rentsure.demo` / `landlord@rentsure.demo` and any password of 6+ characters. The sign-up verification code is `123456`.
Profile → *Reset demo data* restores the sample data.

## Folder structure

```
src/
  app/                    Screens (each file is a route)
    (auth)/               welcome, login, register, verify
    tenant/(tabs)/        Explore · Applications · My Home · Profile
    tenant/...            property, apply, application, agreement, payments, receipt,
                          maintenance, report (fraud), reports, verify-identity, notifications
    landlord/(tabs)/      Dashboard · Properties · Applicants · Rent · Repairs
    landlord/...          property/new, property/[id], compare, application review,
                          tenancy/new, tenancy/[id], maintenance, verification, profile
  components/ui/          Shared UI kit (Button, Card, TextField, Badge, Chip, Timeline…)
  components/             Screen-level pieces shared by both roles
  constants/theme.ts      Colours, spacing and type. Change the look here.
  types/models.ts         Data shapes the app expects from the backend
  data/mock.ts            Sample data used until the backend is ready
  store/app-store.tsx     App state + every action (login, apply, approve, record payment…)
  utils/                  Formatting (₦, dates), status labels, dialogs
```

Navigation is based on the user's role. `src/app/_layout.tsx` uses protected routes, so tenants can only
reach `/tenant/*` and landlords only `/landlord/*`.

## For the backend team

- Every data action is in `src/store/app-store.tsx`, inside `actions`. Replace each body with an API
  call and keep the same name and arguments, so the screens don't change.
- Response shapes are in `src/types/models.ts`.
- State is currently saved locally (AsyncStorage, which uses localStorage on the web) so the demo survives reloads.
  Once the API is live, only store the auth token there.
- `demoApproveVerifications` and `resetDemoData` are demo-only. Remove them once the admin dashboard does approvals.

## Status flows used in the UI

- Application: Draft → Submitted → Under review → (Info requested) → Approved / Rejected / Waitlisted / Withdrawn
- Verification: Not submitted → Pending review → Verified / Rejected / More info required
- Agreement: Draft → Sent → Signed
- Maintenance: Submitted → Accepted / Declined → Assigned → In progress → Resolved
- Fraud report: Submitted → Under review → Closed (a report is an allegation, not proof)
