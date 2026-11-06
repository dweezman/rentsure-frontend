# RentSure demo script

About 8 minutes in total. You play both sides: first the tenant, then the landlord, then back to the tenant to sign.

---

## Before you start (do this 10 minutes early)

1. Open a terminal in the `mobile` folder and run `npm run web`.
2. Open **http://localhost:8081** in Chrome. Make the window full screen so the menu shows on the left.
3. Reset the sample data so everything starts fresh:
   - Click **Tenant demo** on the welcome screen.
   - Go to **Profile**, scroll down, click **Reset demo data**, then confirm.
   - Click **Log out**.
4. Close every other tab and turn off notifications on your laptop.

**Demo accounts** (any password of 6 or more characters works):

| Role | Email | Who it is |
|---|---|---|
| Tenant | tenant@rentsure.demo | Adaeze Okafor, already renting a mini flat in Gbagada |
| Landlord | landlord@rentsure.demo | Olumide Adeyemi, a verified landlord with 4 properties |

The **Tenant demo** and **Landlord demo** buttons on the welcome screen log you straight in, so you don't need to type anything.

---

## Opening (30 seconds)

> "Renting in Nigeria is full of problems: fake listings, agents who disappear with your money, and no proper record of what was paid. RentSure fixes this. Every landlord and property is verified, agreements are signed in the app, and every payment gets a receipt."

---

## Part 1: The tenant looks for a place (2 minutes)

Click **Tenant demo**.

1. **Explore.** Scroll through the houses.
   > "Every listing here has been checked. Gbagada shows as 'Let' because someone already lives there, and that someone is our tenant."
2. Use the search or filters, then open **3-Bedroom Terrace Duplex, Lekki Phase 1**.
   - Swipe through the photos.
   - Point out the rent, the move-in costs (agency and legal fees shown up front) and the landlord's verified badge.
   > "No hidden charges. The tenant sees the full move-in cost before applying."
3. Click **Apply to rent**, fill in the form and click **Submit application**.
   > "The tenant attaches their details and documents once, and the landlord sees everything in one place."
4. Open the **Applications** tab.
   - Show the new Lekki application.
   - Open the **Wuse** one, where the landlord has asked for more information. Show that the tenant can reply.
   - Show **Bodija**, where the tenant was declined, with the reason given.
   > "The tenant always knows where they stand, with no chasing agents on the phone."

## Part 2: The tenant's current home (1 minute)

1. Open **My Home**.
   > "This is Adaeze's current home in Gbagada. Her agreement, rent dates and repairs are all here."
2. Click **View payments & receipts**. Open the paid payment to show the receipt.
   > "Every payment has a receipt, so there are no arguments about who paid what."
3. Go back and show the **Leaking kitchen sink** repair. A plumber is already assigned with a date.
4. *(Optional)* Go back to the Lekki house page and show the **Report** button at the bottom, used to report a fake listing or a bad landlord.
   > "Reports go to the admin team and are kept confidential."

Go to **Profile** and click **Log out**.

---

## Part 3: The landlord side (3 minutes)

Click **Landlord demo**.

1. **Dashboard.**
   > "The landlord sees rent coming in, new applications and urgent repairs at a glance."
2. **Properties.** Show the 4 properties and their status (listed or let).
   *(Optional)* Click **Add a property** to show the listing form, then go back without saving.
   > "New listings are checked by our admin team before tenants can see them."
3. **Applications.**
   - Show the 3 people who applied for **Yaba** and open the compare view.
     > "The landlord can compare applicants side by side: income, move-in date and documents."
   - Open **Adaeze's Lekki application**, the one we just sent.
   - Click **Start review**, choose **Approve**, then **Confirm: Approve**.
4. Click **Create tenancy agreement**.
   - Check the start date, rent, payment schedule and clauses.
   - Click **Send agreement to tenant**.
   > "The agreement is made in the app, so both sides have the same copy."
5. **Maintenance.** Open the **Bathroom socket sparks** request, which is marked urgent.
   > "Urgent repairs are flagged so the landlord deals with them first."

Go to **Profile** and click **Log out**.

---

## Part 4: Signing and paying (1.5 minutes)

1. Click **Tenant demo**. On **My Home**, a banner says **Your tenancy agreement is ready**.
2. Open it and read through the terms. Tick the box, type **Adaeze Okafor** as the signature, then click **Sign agreement** and confirm.
   > "Signed in the app. No printing, no lost papers."
3. Log out, then click **Landlord demo**. Open **Rent**, open the new Lekki tenancy and click **Record** on the first payment.
   - Choose bank transfer, enter a reference and click **Save payment**.
4. *(Optional)* Log back in as the tenant and show the new receipt under **View payments & receipts**.
   > "The moment the landlord records the payment, the tenant gets a receipt."

---

## Closing (30 seconds)

> "That's RentSure: verified listings, applications in one place, agreements signed in the app, and a receipt for every payment. This is the tenant and landlord app. Our teammates are building the backend and the admin dashboard that approves landlords and properties and handles reports."

Then take questions.

---

## If something goes wrong

| Problem | Fix |
|---|---|
| Data looks wrong or a step was already done | Profile, then **Reset demo data**, then log in again |
| Page is blank or stuck | Refresh the browser (Cmd+R) |
| Nothing loads at all | In the terminal press Ctrl+C, run `npm run web` again, then refresh |
| The left menu turned into bottom tabs | Make the browser window wider (full screen) |
| Someone asks about payments online | "For the demo the landlord records payments. Online payment comes with the backend." |
| Someone asks about the admin side | "That's built by our teammates and connects to these screens." |

**Tip:** do one full practice run the day before, then reset the data before the real demo.
