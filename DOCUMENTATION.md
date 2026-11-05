# RentSure Frontend: Guide for the Backend and Admin Teams

This repo is the **frontend** of RentSure: the tenant and landlord app. It runs on Android, iOS and the web
from one codebase (React Native + Expo SDK 58 + Expo Router + TypeScript).

The **backend (API + database)** and the **admin dashboard** are built separately by the rest of the team.
This guide explains how the frontend works and where your parts connect to it.

---

## 1. Run the app

You need [Node.js](https://nodejs.org) (LTS version).

```bash
git clone https://github.com/dweezman/rentsure-frontend.git
cd rentsure-frontend
npm install
npm run web        # opens in the browser at http://localhost:8081
npm start          # or scan the QR code with the Expo Go app on a phone
```

**Demo accounts:** on the welcome screen tap *Tenant demo* or *Landlord demo*. You can also log in with
`tenant@rentsure.demo` or `landlord@rentsure.demo` and any password of 6+ characters.
The sign-up verification code is `123456`. **Profile → Reset demo data** restores the sample data.

**Checks before you push:**

```bash
npm run typecheck
npx eslint src
```

---

## 2. How the frontend is organised

```
src/
  app/                  Screens. Each file is a page (route).
    (auth)/             welcome, login, register, verify
    tenant/             tenant screens (Explore, Applications, My Home, Profile, ...)
    landlord/           landlord screens (Dashboard, Properties, Applicants, Rent, Repairs, ...)
  components/           Shared pieces (buttons, cards, forms, property cards, ...)
  constants/theme.ts    Colours, spacing and fonts
  types/models.ts       The shape of every piece of data  <- backend: read this
  data/mock.ts          Sample data used until the API exists
  store/app-store.tsx   App state + every action          <- backend: connect here
  utils/                Formatting (₦, dates), status labels
```

**Why `.ts` / `.tsx`?** The code is TypeScript, which is JavaScript with types. `.tsx` files contain screen
layouts. If you're used to JavaScript, it reads the same. The types just describe what each piece of data looks like.

---

## 3. For the backend team

Right now the app **has no server**. All data comes from `src/data/mock.ts` and is saved in the browser or
phone storage, so the demo survives a reload.

### Where to connect the API

Every screen gets its data and actions from **one file: `src/store/app-store.tsx`**.
Screens never touch data directly. They call an action, for example `actions.recordPayment(...)`.

To connect the backend:

1. Replace the body of each action with a call to your API.
2. **Keep the same action name and arguments**, so no screens need to change.
3. Return data in the shapes defined in `src/types/models.ts`, or convert it to those shapes in the action.
4. Once login works, store only the **auth token** on the device, not the whole app state
   (see the `AsyncStorage` code near the top of `app-store.tsx`).

### Actions the API needs to support

| Action in `app-store.tsx` | What it does | Suggested endpoint |
|---|---|---|
| `register` | Create an account | `POST /auth/register` |
| `verifyContact` | Confirm email or phone code | `POST /auth/verify` |
| `login` / `logout` | Sign in or out | `POST /auth/login`, `POST /auth/logout` |
| `updateProfile` | Edit name, phone, occupation | `PATCH /users/me` |
| `submitVerification` | Send ID or ownership documents for review | `POST /verifications` |
| `addProperty` | Landlord creates a listing | `POST /properties` |
| `submitPropertyForVerification` | Send a listing for admin review | `POST /properties/:id/submit` |
| `setListingStatus` | Landlord pauses or reopens a listing | `PATCH /properties/:id` |
| `saveApplication` | Tenant saves or submits an application | `POST /applications`, `PATCH /applications/:id` |
| `withdrawApplication` | Tenant withdraws | `POST /applications/:id/withdraw` |
| `setApplicationStatus` | Landlord approves, rejects, waitlists or asks for info | `PATCH /applications/:id/status` |
| `respondToInfoRequest` | Tenant answers a request for more info | `POST /applications/:id/response` |
| `createTenancy` | Landlord drafts a tenancy agreement | `POST /tenancies` |
| `sendAgreement` | Landlord sends it to the tenant | `POST /tenancies/:id/send` |
| `signAgreement` | Tenant signs | `POST /tenancies/:id/sign` |
| `recordPayment` | Landlord records a rent payment (creates a receipt) | `POST /installments/:id/payments` |
| `createMaintenance` | Tenant reports a repair | `POST /maintenance` |
| `updateMaintenance` | Landlord accepts, declines, assigns or resolves it | `PATCH /maintenance/:id` |
| `submitFraudReport` | Tenant reports a fraud or scam | `POST /fraud-reports` |
| `markAllNotificationsRead` | Clear the notification badge | `POST /notifications/read-all` |

The endpoint names are only suggestions. Use whatever fits your API, as long as the action names stay the same.

**Demo-only actions:** `loginAsDemo`, `resetDemoData` and `demoApproveVerifications`.
Remove these once the real backend and admin dashboard are working.

### File uploads

ID documents, property photos and repair photos are picked in the app (see `src/components/ui/file-picker.tsx`)
and passed to actions as `AttachedFile` objects (`types/models.ts`). The API needs an upload endpoint.
The app will then send the returned file URL instead of the local file.

---

## 4. For the admin dashboard team

The admin dashboard is **not** in this repo. It reads and changes the same data through the backend.
These are the places where admin decisions appear in the tenant and landlord app:

| Admin action | What the user sees in this app |
|---|---|
| Approve or reject a landlord's ID or ownership documents | Verification status on the landlord's profile and verification screen |
| Approve or reject a tenant's ID | Verification badge on the tenant profile |
| Verify or reject a property | The **Verified** badge on the listing. Only verified listings show it. |
| Request more info or evidence | Status **More info required**, plus a notification |
| Review and close a fraud report | Report status in the tenant's **My reports** screen |
| Suspend a user or listing | (to agree) The listing should disappear from Explore |

Until the admin dashboard exists, the app has a demo button (`demoApproveVerifications`) that pretends an
admin approved everything. It should be removed when the dashboard is live.

---

## 5. Status values the frontend expects

Please use these exact values in the API (also listed in `src/types/models.ts`):

- **Application:** Draft → Submitted → Under review → (Info requested) → Approved / Rejected / Waitlisted / Withdrawn
- **Verification:** Not submitted → Pending review → Verified / Rejected / More info required
- **Agreement:** Draft → Sent → Signed (→ Ended)
- **Rent installment:** Upcoming / Due soon / Overdue / Paid
- **Maintenance:** Submitted → Accepted / Declined → Assigned → In progress → Resolved
- **Fraud report:** Submitted → Under review → Closed (a report is an allegation, not proof)

If the API needs different values, tell the frontend team so the labels in `src/utils/labels.ts` can be updated.

---

## 6. Working together on GitHub

- Don't push straight to `main`. Make a branch (`git checkout -b backend-auth`), push it, and open a Pull Request.
- Run `npm run typecheck` and `npx eslint src` before opening a Pull Request.
- If you change a data shape in `src/types/models.ts`, say so in the Pull Request, because screens depend on it.
- Questions about screens or UI go to the frontend team. Questions about data or the API go to the backend team.
