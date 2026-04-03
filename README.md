<div align="center">
  <h1>Ghuri (ঘুরি)</h1>
  <p><strong>A Platform for Verified Student Talent</strong></p>
  <p>Hire students as travel guides, photographers, videographers, tech experts, and for everyday services.</p>
</div>

---

## 🎯 About Ghuri.to

**Ghuri** is a trusted ecosystem dedicated to connecting you with verified student talent across Bangladesh. Whether you need a local travel guide, an event photographer, or reliable technical support, Ghuri ensures you get high-quality services while empowering students to earn and grow.

To ensure safety and reliability, **every service provider is verified**. Students are authenticated via `.edu.bd` emails and manual Student ID checks, granting them the trusted **Nogori Verified** badge.

---

## ✨ Core Features

### 🛡️ Robust Verification System
- **Guide/Student Verification:** Auto-verification for valid university emails (`.edu.bd` / `.ac.bd`) or manual review of Student IDs by admins.
- **Customer Verification:** Secure NID upload and approval workflows before customers can make bookings.

### 🏪 Comprehensive Service Marketplace
- **Dynamic Portfolios:** Verified students can set up profiles and storefronts for services like guided tours, photography, and hotel bookings.
- **Flexible Pricing:** Support for `per_day`, `per_person`, or `fixed` pricing depending on the service.
- **Social Feed:** Service providers can share images and videos of their work directly on their profile to attract clients.

### 📅 Seamless Booking Flow
- **4-Step Wizard:** Select dates → pick services → provide trip details → instant booking creation.
- **Real-time Price Engine:** Automatically calculate costs based on dates and selected service bundles.

### 📊 Dedicated Dashboards
- **Customer Dashboard:** Track upcoming trips, past orders, expenditures, and NID verification status.
- **Guide Dashboard:** Manage bookings, view pending earnings, and track platform fees.
- **Admin Panel:** Centralized hub for reviewing Student IDs and NIDs to approve or reject users safely.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Shadcn/UI (Radix)
- **Backend & Auth**: Firebase (Authentication, Firestore, Storage)
- **Forms & Validation**: React Hook Form + Zod
- **Maps**: React-Leaflet & OpenStreetMap (No Google API keys needed)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/shifat71/ghuri.git
cd ghuri
pnpm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
pnpm dev
```
Navigate to `http://localhost:3000` to preview the marketplace. **Note:** Go to `/dev/seed-admin` locally to elevate your account to an admin for testing verification features.

---

## 📂 Project Structure

```text
src/
├── app/               # Next.js App Router (pages: guides, dashboards, admin)
├── components/        # Reusable UI (Auth, Booking Wizards, Guide Cards)
├── contexts/          # React Context (AuthContext)
└── lib/               # Utilities & Firebase initialization
```

## 📖 Documentation

For in-depth architecture decisions, database schemas, and AI build constraints, please refer to the markdown files in the [`/docs`](./docs) and [`progress.md`](./progress.md) files.

---
<p align="center">
  Made with ❤️ in Bangladesh 🇧🇩<br>
  <em>Empowering students, one service at a time.</em>
</p>
