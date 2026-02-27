<p align="center">
  <img src="assets/logo.png" alt="Ghuri Logo" width="180" />
</p>

<h1 align="center">ঘুরি (Ghuri)</h1>

<p align="center">
  <strong>Trusted & Nogori Verified Travel Guides — Discover Local. Travel Authentic.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## 🌏 What is Ghuri?

**Ghuri (ঘুরি)** — Bengali for _"to wander"_ — is a SaaS marketplace that connects travelers with **trusted, Nogori (নগরী) verified** freelance travel guides across Bangladesh and beyond. Think of it as **Fiverr meets TripAdvisor**, purpose-built for the local tourism economy — where every guide you see has passed our rigorous **Nogori Verification** process.

Unlike random listings on social media or word-of-mouth referrals, every guide on Ghuri carries the **🛡️ Nogori Verified** badge — meaning they've been background-checked, manually screened, and endorsed by our local operations team. Travelers browse curated guide profiles, explore portfolios of past trips, and place orders for personalized travel experiences — all without downloading another app. Orders are seamlessly routed to a **WhatsApp Business** channel where our operations team confirms details and connects the customer with their chosen guide in real time.

> **Our mission:** Build the most trusted travel guide network in South Asia — where every guide is Nogori verified, every experience is authentic, and every traveler feels safe.

---

## 🛡️ What is Nogori Verification?

**Nogori (নগরী) Verified** is Ghuri's proprietary trust and quality assurance program. The name _Nogori_ — meaning "of the city" in Bengali — represents our commitment to local authenticity and urban-grade professionalism.

Every guide on our platform must pass the **Nogori Verification** process before they can accept bookings. 

## ✨ Features

### For Travelers (Customers)

| Feature | Description |
|---|---|
| �️ **Nogori Verified Guides Only** | Every guide is background-checked, manually screened, and carries the Nogori Verified badge — book with confidence |
| 🔍 **Smart Guide Discovery** | Search & filter guides by destination, language, Nogori trust tier, rating, price range, and available dates |
| 👤 **Rich Guide Profiles** | View detailed bios, Nogori verification status, photo/video portfolios, and service packages |
| 📦 **Service Packages** | Choose from curated packages — city tours, adventure treks, cultural immersions, and more |
| 📅 **Flexible Booking** | Hire guides for half-day, full-day, or multi-day experiences (1–7 days) |
| 💬 **WhatsApp-First Communication** | Instant order confirmation and coordination via WhatsApp — no new app needed |
| ⭐ **Reviews & Ratings** | Rate your experience and help future travelers make informed choices |
| 🎥 **Verified Portfolios** | View comprehensive portfolios of guides showcasing their specific skills (Photography, Videography, Historical Tours, etc.) |
| 🤝 **Escrow Payments** | Handle payments securely—funds are released to the guide only after a successful tour day, ensuring trust for both parties |
| ❤️ **Favorites & Wishlists** | Save guides and destinations for future trips |
| 🔔 **Smart Notifications** | Get alerts for booking confirmations, guide responses, and travel tips | 

### For Guides (Freelancers)

| Feature | Description |
|---|---|
| 🛡️ **Nogori Verification Badge** | Complete the Nogori Verification process to earn trust badges (Verified → Pro → Elite) and unlock more bookings |
| 🏪 **Professional Storefront** | A public profile page that acts as a personal travel business website — powered by your Nogori trust tier |
| 📸 **Portfolio Showcase** | Upload photo galleries, YouTube/video reels, and trip highlight stories to strengthen your Nogori profile |
| 🎯 **Multiple Service Offerings** | List services across categories — guided tours, hotel booking assistance, photography, videography, airport transfers, and custom experiences |
| 💰 **Transparent Pricing** | Set per-day rates, package deals, and seasonal pricing |
| 📊 **Dashboard & Analytics** | Track profile views, booking requests, earnings, Nogori score, and customer feedback |
| 📍 **Location Tags** | Tag your expertise to specific destinations, trails, or regions |
 

### Platform Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | Firebase Auth with Email, Google, and Phone (OTP) sign-in |
| 🌐 **Bilingual Support** | Full Bangla (বাংলা) and English interface |
| 📱 **Mobile-First Design** | Responsive PWA — works beautifully on any device |
| 🗺️ **Interactive Maps** | Google Maps integration showing guide service areas and popular spots |
| 💳 **Commission-Based Revenue** | Platform earns a service fee per completed booking |
| 📈 **Admin Dashboard** | Manage guides, Nogori verifications, customers, orders, disputes, and platform analytics | 

---

## 🔄 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  1. BROWSE   │────▶│  2. CHOOSE   │────▶│  3. BOOK & PAY  │────▶│  4. CONNECT  │
│             │     │              │     │                 │     │              │
│ Explore     │     │ View guide   │     │ Select dates,   │     │ Order sent   │
│ destinations│     │ profiles &   │     │ pick services,  │     │ to WhatsApp  │
│ & guides    │     │ portfolios   │     │ fill details    │     │ Business     │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────┬───────┘
                                                                        │
                    ┌──────────────┐     ┌─────────────────┐           │
                    │  6. REVIEW   │◀────│  5. EXPERIENCE  │◀──────────┘
                    │              │     │                 │
                    │ Rate & share │     │ Meet your guide │  Ops team confirms
                    │ your trip    │     │ & explore!      │  & connects both
                    └──────────────┘     └─────────────────┘  parties via WhatsApp
```

### Detailed Flow

1. **Traveler Signs Up** — Quick registration via email, Google, or phone OTP (Firebase Auth)
2. **Explore Nogori Verified Guides** — Browse by destination, view Nogori trust tiers, compare services and pricing
3. **Select & Customize** — Pick a Nogori Verified guide, choose services (tour, photography, hotel booking, etc.), select dates
4. **Place Order** — Fill in trip details (group size, preferences, special requests)
5. **WhatsApp Handoff** — Order details are automatically sent to the Ghuri WhatsApp Business account via the WhatsApp Business API
6. **Ops Team Confirms** — Our team reviews the order, confirms availability with the guide, and handles payment coordination
7. **Connection Made** — A WhatsApp group is created with the traveler, guide, and a Ghuri coordinator
8. **Trip Happens** — The guide delivers an amazing local experience.
9. **Escrow Release** — Once the trip is successfully completed, escrow funds are securely released to the guide.
10. **Review & Repeat** — Traveler leaves a rating and review on the public profile; guide builds their reputation. 

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Shadcn/UI |
| **Backend / BaaS** | Firebase (Auth, Firestore, Storage, Cloud Functions, Hosting) |
| **Database** | Cloud Firestore (NoSQL) |
| **File Storage** | Firebase Storage (images, videos, documents) |
| **Authentication** | Firebase Auth (Email/Password, Google OAuth, Phone OTP) |
| **Messaging** | WhatsApp Business API (via official Cloud API or third-party like Twilio) |
| **Maps** | Google Maps JavaScript API / Mapbox |
| **Payments** | bKash / Nagad / SSLCommerz (Bangladesh) — Stripe (International) |
| **Notifications** | Firebase Cloud Messaging (FCM) + WhatsApp |
| **Analytics** | Firebase Analytics, Google Analytics 4 |
| **CI/CD** | GitHub Actions → Firebase Hosting |
| **Monitoring** | Firebase Crashlytics, Cloud Logging |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js PWA)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Home /  │  │  Guide   │  │ Booking  │  │   Admin    │  │
│  │  Search  │  │ Profile  │  │  Flow    │  │ Dashboard  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       └──────────────┴─────────────┴──────────────┘         │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / WebSocket
┌───────────────────────────┴─────────────────────────────────┐
│                     FIREBASE SERVICES                        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Firebase   │  │  Cloud      │  │  Firebase           │  │
│  │  Auth       │  │  Firestore  │  │  Storage            │  │
│  │  (Users)    │  │  (Data)     │  │  (Media)            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Cloud Functions (Serverless)                │ │
│  │                                                         │ │
│  │  • Order Processing    • WhatsApp API Integration       │ │
│  │  • Notification Engine • Payment Webhooks               │ │
│  │  • Review Moderation   • Analytics Aggregation          │ │
│  │  • Nogori Verification • Nogori Score Engine            │ │
│  │  • Safety Monitoring   • Scheduled Jobs (Cron)          │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              │  EXTERNAL INTEGRATIONS      │
              │                             │
              │  • WhatsApp Business API    │
              │  • bKash / SSLCommerz       │
              │  • Google Maps API          │
              │  • Twilio (SMS fallback)    │
              │  • Cloudinary (media CDN)   │
              └─────────────────────────────┘
```

---

## 📂 Project Structure

```
ghuri/
├── public/                     # Static assets
│   ├── images/
│   └── locales/                # i18n translation files (bn, en)
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   ├── (customer)/         # Customer dashboard, bookings, favorites
│   │   ├── (guide)/            # Guide dashboard, portfolio, services
│   │   ├── (admin)/            # Admin panel
│   │   ├── guides/             # Public guide listing & profiles
│   │   │   └── [guideId]/      # Dynamic guide profile page
│   │   ├── destinations/       # Destination pages
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Shadcn/UI primitives
│   │   ├── layout/             # Header, Footer, Sidebar, Navigation
│   │   ├── guide/              # GuideCard, PortfolioGallery, ServiceList
│   │   ├── booking/            # BookingForm, DatePicker, OrderSummary
│   │   ├── maps/               # MapView, LocationPicker
│   │   └── shared/             # Reusable components
│   ├── lib/
│   │   ├── firebase/           # Firebase config, auth helpers, db utils
│   │   ├── whatsapp/           # WhatsApp Business API client
│   │   ├── payments/           # Payment gateway integrations
│   │   └── utils/              # General utilities
│   ├── hooks/                  # Custom React hooks
│   ├── context/                # React context providers
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # Global styles
├── functions/                  # Firebase Cloud Functions
│   ├── src/
│   │   ├── orders/             # Order processing & WhatsApp dispatch
│   │   ├── notifications/      # Push & messaging notifications
│   │   ├── payments/           # Payment webhooks & reconciliation
│   │   └── scheduled/          # Cron jobs (reminders, cleanup)
│   └── package.json
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── firebase.json               # Firebase project config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🗄️ Database Schema (Firestore)

### Collections

```
users/
  └── {userId}
        ├── displayName: string
        ├── email: string
        ├── phone: string
        ├── role: "customer" | "guide" | "admin"
        ├── photoURL: string
        ├── createdAt: timestamp
        └── preferences: { languages: [], interests: [] }

guides/
  └── {guideId}
        ├── userId: string (ref → users)
        ├── bio: string
        ├── tagline: string
        ├── locations: string[]  (e.g., ["Cox's Bazar", "Bandarban"])
        ├── languages: string[]
        ├── rating: number
        ├── totalReviews: number
        ├── totalTrips: number
        ├── pricePerDay: number
        ├── nogoriStatus: "pending" | "verified" | "pro" | "elite" | "suspended"
        ├── nogoriVerifiedAt: timestamp
        ├── nogoriScore: number (0-100, composite trust score)
        ├── idVerified: boolean
        ├── backgroundCheckPassed: boolean
        ├── manualScreeningPassed: boolean
        ├── isActive: boolean
        ├── profileViews: number
        ├── coverPhoto: string
        ├── socialLinks: { facebook, instagram, youtube }
        ├── services/              (subcollection)
        │     └── {serviceId}
        │           ├── title: string
        │           ├── category: "guided_tour" | "hotel_booking" | "photography" | "videography" | "transport" | "custom"
        │           ├── description: string
        │           ├── price: number
        │           ├── priceType: "per_day" | "per_trip" | "fixed"
        │           └── portfolio: [{ type, url, caption }]
        └── availability/          (subcollection)
              └── {monthYear}
                    └── dates: { "2026-03-15": "available" | "booked" }

orders/
  └── {orderId}
        ├── customerId: string (ref → users)
        ├── guideId: string (ref → guides)
        ├── services: string[] (service IDs)
        ├── startDate: timestamp
        ├── endDate: timestamp
        ├── groupSize: number
        ├── totalPrice: number
        ├── specialRequests: string
        ├── status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
        ├── whatsappMessageId: string
        ├── paymentStatus: "unpaid" | "partial" | "paid" | "refunded"
        ├── createdAt: timestamp
        └── updatedAt: timestamp

reviews/
  └── {reviewId}
        ├── orderId: string (ref → orders)
        ├── customerId: string (ref → users)
        ├── guideId: string (ref → guides)
        ├── rating: number (1-5)
        ├── comment: string
        ├── photos: string[]
        ├── createdAt: timestamp
        └── isVerified: boolean (only from completed orders)

destinations/
  └── {destinationId}
        ├── name: string
        ├── nameBn: string
        ├── description: string
        ├── coverImage: string
        ├── location: geopoint
        ├── region: string
        ├── tags: string[]
        ├── popularGuides: string[] (guide IDs)
        └── seasonalTips: { summer, monsoon, winter }
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **pnpm** (recommended) or npm
- **Firebase CLI** (`npm install -g firebase-tools`)
- A **Firebase project** with Firestore, Auth, Storage, and Functions enabled
- A **WhatsApp Business Account** with API access

### Installation

```bash
# Clone the repository
git clone https://github.com/shifat71/ghuri.git
cd ghuri

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# WhatsApp Business API
WHATSAPP_BUSINESS_PHONE_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# Payments
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
```

### Development

```bash
# Start the dev server
pnpm dev

# Start Firebase emulators (Firestore, Auth, Functions, Storage)
firebase emulators:start

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 💰 Business Model

| Revenue Stream | Description |
|---|---|
| **Service Commission** | 10–15% platform fee on every completed booking | 
| **Promoted Destinations** | Tourism boards and hotels sponsor destination pages |
| **Subscription Tiers** | Guides unlock advanced analytics, priority support, and badge perks |
| **Corporate Packages** | Custom group travel solutions for companies and events |
 

---

## 🗺️ Roadmap

### Phase 1 — MVP (Month 1–2)
- [x] Project setup & Firebase integration
- [ ] User authentication (Email, Google, Phone OTP)
- [ ] Guide registration & Nogori Verification application flow
- [ ] Nogori Verification admin review pipeline (ID check, interview scheduling)
- [ ] Service listing with portfolio uploads
- [ ] Public guide profile pages with Nogori Verified badge display
- [ ] Customer registration & order placement
- [ ] WhatsApp Business API integration for order dispatch
- [ ] Basic search & filter for Nogori Verified guides
- [ ] Mobile-responsive design

### Phase 2 — Growth (Month 3–4)
- [ ] Nogori Pro & Nogori Elite trust tier system
- [ ] Nogori Training Program (free guide upskilling modules)
- [ ] Review & rating system (feeds into Nogori Score)
- [ ] Destination pages with curated Nogori Verified guides
- [ ] Interactive map integration
- [ ] Guide dashboard with Nogori Score analytics
- [ ] Admin panel for order, user & Nogori verification management
- [ ] Bangla language support (i18n)
- [ ] SEO optimization & blog/content pages

### Phase 3 — Monetization (Month 5–6)
- [ ] Online payment integration (bKash, Nagad, SSLCommerz)
- [ ] Commission tracking & guide payouts
- [ ] Featured listing & subscription tiers
- [ ] Nogori Safety Guarantee (refund/rebook policy engine)
- [ ] Push notifications (FCM)
- [ ] AI-powered trip recommendations
- [ ] Guide availability calendar
- [ ] Automated Nogori Score calculation & quarterly reports

### Phase 4 — Scale (Month 7+)
- [ ] Expand to other South Asian countries (Nepal, Sri Lanka, India)
- [ ] Native mobile apps (React Native / Flutter)
- [ ] Real-time chat (Firebase Realtime DB or Stream)
- [ ] Group trip coordination features
- [ ] Travel insurance integration
- [ ] Affiliate partnerships with hotels & airlines
- [ ] Public API for third-party integrations

---

## 🎨 Design Philosophy

- **Nogori Trust First** — Every interaction is anchored by the Nogori Verified badge; trust is our #1 product
- **Mobile-First** — 80%+ of our users will be on phones
- **WhatsApp-Native** — Meet users where they already are
- **Bangla-First** — Primary language support with English as secondary
- **Safety Guaranteed** — Nogori Verification + refund policy means travelers never worry
- **Performance** — Sub-2s load times, optimized images, edge caching

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

- **Website:** [ghuri.app](https://ghuri.app) *(coming soon)*
- **Email:** hello@ghuri.app
- **WhatsApp Business:** [+880 XXXX-XXXXXX](https://wa.me/880XXXXXXXXXX)
- **Facebook:** [@ghuriapp](https://facebook.com/ghuriapp)
- **Instagram:** [@ghuriapp](https://instagram.com/ghuriapp)

---

<p align="center">
  Made with ❤️ in Bangladesh 🇧🇩
</p>
<p align="center">
  <em>ঘুরি — বিশ্বস্ত ও নগরী যাচাইকৃত গাইড দিয়ে তোমার পরবর্তী অ্যাডভেঞ্চার শুরু করো।</em><br/>
  <em>Ghuri — Trusted & Nogori Verified guides for your next adventure.</em>