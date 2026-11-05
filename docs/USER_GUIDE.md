# User & Administrator Guide

Welcome to **Local Skill Exchange**! This guide walks you through the features and best practices for Learners, Skill Providers, and Administrators.

---

## 1. Getting Started & Onboarding

1. **Sign Up:** Navigate to `/register` to create your free account.
2. **Claim Starter Credits:** Every newly registered neighbor automatically receives **3.0 free time credits** ($3\text{ hours}$ of learning time).
3. **Complete Your Profile:** Go to `/profile` to set your neighborhood, bio, languages spoken, and skills you're interested in learning or teaching.

---

## 2. Learner Journey

### Step 1: Discover Skills
- **Explore Catalog (`/explore`):** Filter by category (Technology, Design, Academic, Creative, Lifestyle), difficulty level, or search keywords.
- **Smart Matches Dashboard (`/matches`):** View AI-ranked mentors tailored to your profile. Look for the **"Reciprocal Match ⭐"** badge to trade skills with zero net credit spend!

### Step 2: Book a Session
1. Open any skill offer detail page (e.g. `/offers/:id`).
2. Click **"Book Session"** to view the provider's weekly available slots.
3. Select your desired date and time, write any learning goals or notes, and submit.
4. Your booking request will appear in your **Sessions Dashboard (`/sessions`)**.

### Step 3: Attend & Confirm
1. Coordinate meeting logistics or video links using in-app messaging (`/messages`).
2. After completing the session, go to `/sessions` and click **"Confirm Completion"**.
3. Once both you and the provider confirm, 1.0 credit is transferred from your balance to the provider.
4. An interactive review modal will appear: rate your session from 1 to 5 stars and leave written feedback!

---

## 3. Skill Provider Journey

### Step 1: Post a Teaching Offer
1. Navigate to `/post` and select **"Offer a Skill"**.
2. Select the skill category, write a description of your teaching approach, choose your experience level, and specify online or in-person mode.
3. Your listing is immediately live in the public explore directory.

### Step 2: Set Availability
1. Navigate to `/sessions` and open the **Weekly Availability Scheduler**.
2. Add your recurring available days and time windows (e.g. Tuesdays 14:00–16:00).
3. Learners can only request bookings within these active time slots.

### Step 3: Manage Bookings & Earn Credits
1. Receive incoming notifications via the **Notification Bell** whenever someone requests a session.
2. Review the session request in `/sessions` and click **"Accept"**.
3. Conduct the session and click **"Confirm Completion"** to receive your earned credit.
4. View your growing balance and transaction ledger on `/ledger`!

---

## 4. Administrator Guide

Administrators have access to the **Command Center (`/admin`)**:

### Tab 1: Platform KPIs
- Live counters for total members, active accounts, completed sessions, and credit circulation volume.

### Tab 2: User Management
- Search any member by name, username, or email.
- **Suspend/Reinstate:** One-click toggle of user `isActive` status. Deactivated users cannot log in or make bookings.
- **Role Assignment:** Modify member roles between `LEARNER`, `PROVIDER`, and `ADMIN`.

### Tab 3: Trust & Safety Moderation Desk
- Review pending misconduct or safety reports.
- Read reporter details, reported user history, and description.
- Click **"Take Action"** to mark a report as `RESOLVED` (with warning/action notes) or `DISMISSED`.

### Tab 4: Skill Taxonomy Manager
- Standardize neighborhood skill categories and add new skills to the taxonomy dictionary.

### Tab 5: Credit Controls
- Perform audited manual credit transfers (`ADMIN_ADJUSTMENT`) with a mandatory written justification.

