<p align="center">
  <img src="assets/logo.png" alt="Ghuri Logo" width="180" />
</p>

<h1 align="center">ঘুরি (Ghuri)</h1>

<p align="center">
  <strong>Trusted & Nogori Verified Travel Guides — Discover Local. Travel Authentic.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Docs</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## What is Ghuri?

**Ghuri (ঘুরি)** — Bengali for _"to wander"_ — is a marketplace connecting travelers with **Nogori (নগরী) verified** freelance travel guides across Bangladesh. Think **Fiverr meets TripAdvisor** for local tourism.

Every guide carries the **🛡️ Nogori Verified** badge — background-checked, manually screened, and endorsed by our ops team. Travelers browse profiles, explore portfolios, and book experiences. Orders are routed to **WhatsApp Business** where our team confirms and connects both parties.

> **🤖 Developers & AI Agents:** Read the [`/docs`](docs/) folder before writing code. Start with the **[AI Build Guide](docs/06-ai-build-guide.md)**.

---

## How It Works

1. **Browse** — Explore destinations & Nogori Verified guides
2. **Choose** — View profiles, portfolios & service packages
3. **Book** — Select dates, pick services, fill trip details
4. **Connect** — Order auto-sent to WhatsApp Business; ops team confirms & creates a group chat
5. **Experience** — Meet your guide & explore
6. **Review** — Rate the trip; guide builds reputation

---

## Features

**For Travelers**
- 🛡️ Nogori Verified guides only — book with confidence
- 🔍 Search by destination, language, rating, price & availability
- 📦 Curated packages — city tours, treks, photography & more
- 💬 WhatsApp-first communication — no new app needed
- 🤝 Escrow payments — funds released only after a successful trip
- ⭐ Reviews, ratings, favorites & wishlists

**For Guides**
- 🏅 Trust tiers: Verified → Pro → Elite
- 🏪 Professional storefront with portfolio showcase
- 🎯 List multiple services with transparent pricing
- 📊 Dashboard with analytics, earnings & Nogori Score

**Platform**
- 🔐 Firebase Auth (Email, Google, Phone OTP)
- 🌐 Bilingual — Bangla & English
- 📱 Mobile-first responsive PWA
- 🗺️ Google Maps integration
- 📈 Admin dashboard for managing the entire platform

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Shadcn/UI |
| **Backend** | Firebase (Auth, Firestore, Storage, Cloud Functions) |
| **Messaging** | WhatsApp Business API |
| **Maps** | Google Maps JavaScript API |
| **Payments** | bKash / SSLCommerz (BD) — Stripe (International) |
| **CI/CD** | GitHub Actions → Firebase Hosting |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18 · pnpm · Firebase CLI (`npm i -g firebase-tools`)
- Firebase project with Firestore, Auth, Storage & Functions enabled

### Setup

```bash
git clone https://github.com/shifat71/ghuri.git
cd ghuri
pnpm install
cp .env.example .env.local   # fill in your keys
```

### Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# WhatsApp Business API
WHATSAPP_BUSINESS_PHONE_ID=
WHATSAPP_ACCESS_TOKEN=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Payments
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
```

### Development

```bash
pnpm dev                          # Next.js dev server
firebase emulators:start          # Local Firebase emulators
firebase deploy --only functions  # Deploy Cloud Functions
firebase deploy --only hosting    # Deploy to Hosting
```

---

## Documentation

Detailed technical docs live in the [`/docs`](docs/) folder:

| Doc | Contents |
|---|---|
| [01 — PRD](docs/01-prd.md) | Product requirements & feature specs |
| [02 — System Architecture](docs/02-system-architecture.md) | Architecture, project structure & data flow |
| [03 — Database Schema](docs/03-database-schema.md) | Firestore collections & schema definitions |
| [04 — API & Integrations](docs/04-api-and-integrations.md) | WhatsApp, payments, maps & external APIs |
| [05 — UI/UX Guidelines](docs/05-ui-ux-guidelines.md) | Page-by-page design specs & component details |
| [06 — AI Build Guide](docs/06-ai-build-guide.md) | Step-by-step implementation guide for AI agents |

---

## Roadmap

| Phase | Focus | Key Milestones |
|---|---|---|
| **1 — MVP** | Core platform | Auth, guide profiles, Nogori Verification, booking flow, WhatsApp integration |
| **2 — Growth** | Engagement | Reviews & ratings, destination pages, maps, admin panel, i18n (Bangla) |
| **3 — Monetize** | Revenue | bKash/SSLCommerz payments, commissions, subscriptions, push notifications |
| **4 — Scale** | Expansion | South Asia expansion, native mobile apps, real-time chat, public API |

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit & push
4. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

[MIT](LICENSE)

---

## Contact

[ghuri.app](https://ghuri.app) *(coming soon)* · hello@ghuri.app · [@ghuriapp](https://instagram.com/ghuriapp)

---

<p align="center">
  Made with ❤️ in Bangladesh 🇧🇩<br/>
  <em>ঘুরি — Trusted & Nogori Verified guides for your next adventure.</em>
</p>
