# Ghuri — Development Progress

> Last updated: 2026-03-24

---

## How to Login as Admin

1. Sign up or log in with any Google or email account
2. Navigate to `/dev/seed-admin` in your browser
3. Click **"Elevate to Admin"** — this sets your `users` doc `role` to `"admin"`
4. Refresh the page — you will be redirected to `/dashboard/admin`
5. **First time setup:** Click **"Seed Accepted Edu Domains"** to populate the Firestore `settings/accepted_edu_domains` document with the default university domain list

> **Note:** The `/dev/seed-admin` page is a development utility. In production, remove this route or protect it with an environment check. Admin role should be set directly in Firestore Console.

---

## Document Verification Flow

### Guide Verification (Nogori Status)

```
Student registers as Guide
        │
        ▼
  Has .edu.bd / .ac.bd email?
   (checked against Firestore
    settings/accepted_edu_domains)
        │
    ┌───┴───┐
    │ YES   │ NO
    ▼       ▼
 Auto-     Must upload
 verified  Student ID
 (nogoriStatus:  (nogoriStatus:
  "verified")     "id_submitted")
                  │
                  ▼
            Admin reviews
            at /dashboard/admin
            (Guide Verifications tab)
                  │
            ┌─────┴─────┐
            │ Approve   │ Reject
            ▼           ▼
         "verified"  "rejected"
```

**Where data lives:**
- Guide profile: `guides/{uid}` collection — fields: `nogoriStatus`, `studentIdUrl`, `isStudentEmail`, `email`
- Student ID image: Firebase Storage `verification/{uid}/student_id_{timestamp}`
- Accepted edu domains: Firestore `settings/accepted_edu_domains` — field: `domains` (string array)

**Accepted domains are managed** in the Admin Panel → "Edu Domains" tab. Admin can add/remove domains and save. The app fetches this list at runtime and caches it for 5 minutes.

### Customer NID Verification

```
Customer signs up
        │
        ▼
  nidStatus: "not_submitted"
        │
        ▼
  Uploads NID on Customer Dashboard
  (or prompted when trying to book)
        │
        ▼
  nidStatus: "submitted"
  nidUrl: <Firebase Storage URL>
        │
        ▼
  Admin reviews at /dashboard/admin
  (NID Verifications tab)
        │
   ┌────┴────┐
   │ Approve │ Reject
   ▼         ▼
"verified"  "rejected"
             │
             ▼
        Customer can re-upload
```

**Where data lives:**
- User doc: `users/{uid}` collection — fields: `nidStatus`, `nidUrl`
- NID image: Firebase Storage `verification/{uid}/nid_{timestamp}`

**Booking Gate:** The `BookingWizard` checks `dbUser.nidStatus` before allowing a booking. If NID is `"not_submitted"` or `"rejected"`, the wizard shows a prompt to upload NID first (links to customer dashboard).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, Shadcn/UI (Radix) |
| Auth & DB | Firebase (Auth, Firestore, Storage) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Package Manager | pnpm |

---

## Implemented Features

### 1. Authentication & User Management
- [x] Google OAuth sign-in/sign-up
- [x] Email/password sign-in/sign-up
- [x] AuthContext with persistent session and Firestore user sync
- [x] Role-based access: `customer`, `guide`, `admin`
- [x] AuthModal with tabbed sign-in/sign-up UI
- [x] Student email auto-detection (40+ Bangladeshi university domains: `.edu.bd`, `.ac.bd`, specific unis)
- [x] User profile stored in Firestore `users` collection

### 2. Onboarding Flow (4 steps for guides, 2 for customers)
- [x] Step 1 — Role selection (Customer or Guide)
- [x] Step 2 — Guide profile setup (name, tagline, bio, avatar, cover, locations, languages, price/day)
- [x] Step 3 — Identity verification (student ID upload with preview, auto-detection banner for `.edu` emails, skip for verified student emails)
- [x] Step 4 — First service creation (title, description, category, price, pricing type) — skippable
- [x] Customer creation with `nidStatus: "not_submitted"` default
- [x] Guide creation with `nogoriStatus` tracking
- [x] File upload to Firebase Storage (`verification/{uid}/student_id_{timestamp}`)

### 3. Student Email Verification
- [x] Utility function `isStudentEmail()` in `src/lib/verification.ts`
- [x] Checks against 40+ Bangladeshi university domains (DU, BUET, BRAC, NSU, IUB, CUET, KUET, RUET, SUST, etc.)
- [x] Generic pattern matching for `*.edu.bd` and `*.ac.bd`
- [x] Real-time detection badge on signup form (green "Student email detected" message)
- [x] Hint for non-student emails suggesting `.edu.bd` or `.ac.bd`
- [x] Auto-sets `nogoriStatus: "id_submitted"` during onboarding for student emails

### 4. NID Verification for Customers
- [x] NID upload banner on customer dashboard (4 states: not_submitted, submitted, verified, rejected)
- [x] File upload to Firebase Storage (`verification/{uid}/nid_{timestamp}`, 5MB limit)
- [x] Preview before upload
- [x] Re-upload capability on rejection
- [x] Booking gate — BookingWizard blocks booking if NID not verified/submitted
- [x] NID verification prompt with redirect to customer dashboard

### 5. Admin Verification Dashboard (`/dashboard/admin`)
- [x] Auth guard — only `role === "admin"` users can access
- [x] Guide Verifications tab — lists guides with `nogoriStatus == "id_submitted"`
- [x] NID Verifications tab — lists users with `nidStatus == "submitted"`
- [x] View uploaded document (student ID / NID) in fullscreen modal
- [x] Approve button (sets status to `"verified"`)
- [x] Reject button (sets status to `"rejected"`)
- [x] Badge count showing number of pending reviews per tab
- [x] Student email badge indicator on guide entries

### 6. Guide Listing & Discovery
- [x] Browse all guides page (`/guides`) with search and location filter
- [x] `GuideCard` component showing avatar, name, rating, price/day, location, Nogori badge
- [x] Guide detail page (`/guides/[guideId]`) with cover photo, profile info, tabbed content
- [x] Client-side search by name, service, and location
- [x] Destinations page (`/destinations`) with destination cards

### 7. Guide Profile & Services
- [x] Public profile page with cover photo, avatar, bio, tagline
- [x] In-place editing for guide owners (name, tagline, bio)
- [x] Cover photo and avatar upload (owner only)
- [x] Services tab — add/edit/delete services
- [x] Service categories: guided_tour, photography, hotel_booking, transportation
- [x] Pricing types: per_day, per_person, fixed
- [x] Portfolio tab — image grid with add/remove
- [x] Reviews tab (placeholder — "Coming Soon")
- [x] Nogori verification badge display
- [x] Locations and languages display

### 8. Social Feed (Guide Posts)
- [x] Create posts with text + image or video (50MB max)
- [x] Media upload to Firebase Storage (`guide_posts/{uid}/`)
- [x] Upload progress bar
- [x] Media preview with remove option
- [x] Feed display ordered by `createdAt` descending
- [x] Like/unlike with count and heart animation
- [x] Delete posts (owner only)
- [x] Relative timestamps (just now, minutes ago, hours ago, etc.)
- [x] Skeleton loading state
- [x] Empty state with encouragement to post
- [x] Feed tab on guide profile page
- [x] Feed section on landing page (featured guide posts)

### 9. Booking & Checkout Flow
- [x] BookingWizard — 4-step modal (dates → services → details → confirmation)
- [x] NID verification gate at step 1
- [x] Calendar date range picker
- [x] Service selection with checkboxes
- [x] Traveler details form (name, WhatsApp, group size, special requests)
- [x] Zod form validation
- [x] Total calculation: `(pricePerDay × days) + selected fixed services`
- [x] API route `POST /api/checkout` creates order in Firestore
- [x] Success confirmation with WhatsApp group mention

### 10. Customer Dashboard (`/dashboard/customer`)
- [x] Personalized welcome header
- [x] NID verification status banner (compact)
- [x] Stats row: Total Trips, Upcoming, Completed, Total Spent (৳)
- [x] Tabbed order view: All / Upcoming / Completed / Cancelled
- [x] Detailed order cards with guide avatar, name, location
- [x] Order details: dates, group size, total amount, status badge
- [x] WhatsApp button for confirmed bookings
- [x] "View Guide" link on each order
- [x] Fetches guide details for each order (name, avatar, location)
- [x] Empty state per tab
- [x] Profile settings page (`/dashboard/customer/profile`)

### 11. Guide Dashboard (`/dashboard/guide`)
- [x] Earnings grid: Total Earned, Paid Out (90%), Pending, Platform Fee (10%)
- [x] Quick stats: Total Orders, Completed, Pending, Rating, Verification Status
- [x] Tabbed layout: Orders / Feed / Earnings
- [x] Orders tab — detailed order cards with status badges
- [x] Accept/Decline buttons for pending orders
- [x] Mark Completed button for confirmed orders
- [x] Earnings tab — summary card (gross, fee, net, upcoming)
- [x] Transaction history list (completed orders with net payout)
- [x] Feed tab — create posts + view own feed
- [x] Verification badge display using `getVerificationBadge()`
- [x] Profile settings page (`/dashboard/guide/profile`)

### 12. Landing Page & Navigation
- [x] Hero section with gradient background and CTA
- [x] Category cards (Travel Guide, Photography, Hotel Booking, Transportation)
- [x] Featured destinations carousel
- [x] Guide feed section on homepage
- [x] Sticky navbar with logo, nav links, user dropdown
- [x] Mobile bottom navigation (Explore, Search, Bookings, Profile)
- [x] Responsive design (mobile-first with `md` breakpoint)
- [x] Dark mode support

### 13. Security Rules
- [x] **Firestore rules** — role-based access control:
  - Users: own doc read/write, admin reads all
  - Guides: public read, owner/admin write
  - Guide posts: public read, owner CRUD
  - Orders: customer reads own, guide reads assigned, admin reads all; auth create; admin/guide update
  - Helper functions: `isAuth()`, `isOwner()`, `isAdmin()`
- [x] **Storage rules** — path-based with size limits:
  - `guide_posts/{userId}/` — 50MB, owner write, public read
  - `guide_profiles/{userId}/` — 10MB, owner write, public read
  - `verification/{userId}/` — 5MB, owner write, authenticated read

### 14. API Routes
- [x] `POST /api/checkout` — creates order document in Firestore
- [x] `GET /api/seed` — populates demo data (2 guides, 3 posts)

---

## Not Yet Implemented (Remaining for Full Functionality)

### Priority 1 — Core Missing Features

#### Payment System
- [ ] Payment gateway integration (e.g., bKash, Nagad, SSLCommerz for Bangladesh)
- [ ] Payment page/flow after booking confirmation
- [ ] Payment verification and reconciliation
- [ ] Payout system for guides (currently calculated but not processed)
- [ ] Transaction receipts / invoices
- [ ] Refund handling for cancelled bookings

#### Messaging & Communication
- [ ] In-app messaging / chat between customer and guide
- [ ] WhatsApp integration (currently just displays number, no deep-link API)
- [ ] Booking status notifications (in-app, push, email)
- [ ] Email notifications (booking confirmation, status changes, verification updates)

#### Reviews & Ratings
- [ ] Review submission form (customer → guide after trip completion)
- [ ] Star rating system (1-5)
- [ ] Review display on guide profile (Reviews tab currently shows "Coming Soon")
- [ ] Average rating calculation and update on guide profile
- [ ] Review moderation by admin

### Priority 2 — User Experience Enhancements

#### Search & Discovery
- [ ] Dedicated search page (`/search` — BottomNav links to it but route doesn't exist)
- [ ] Advanced filters (price range, rating, availability, language, service category)
- [ ] Location-based search with map integration
- [ ] "How It Works" page (`/how-it-works` — linked in navbar but route doesn't exist)
- [ ] Guide availability calendar (guides set available dates, customers see them)

#### Social Features
- [ ] Comment functionality on feed posts (button exists, no backend)
- [ ] Share functionality for posts (button exists, no backend)
- [ ] Bookmark/save posts (button exists, no backend)
- [ ] User-to-user following system
- [ ] Activity feed / timeline
- [ ] Hashtag or location tagging on posts

#### Notifications
- [ ] Notification center (bell icon exists in navbar but no functionality)
- [ ] Push notifications (booking updates, new messages, verification status)
- [ ] Email notifications for key events
- [ ] In-app toast/snackbar notifications for actions

### Priority 3 — Platform & Operations

#### Admin Features
- [ ] Analytics dashboard (total users, bookings, revenue, growth metrics)
- [ ] Content moderation tools (flag/remove inappropriate posts)
- [ ] User management (suspend/ban users, role changes)
- [ ] Bulk verification operations
- [ ] Platform fee configuration (currently hardcoded at 10%)
- [ ] Report generation and export

#### Guide Features
- [ ] Availability management (set available dates, block dates)
- [ ] Pricing tiers (peak season, weekday/weekend pricing)
- [ ] Service packages (bundle multiple services)
- [ ] Guide portfolio with categorized albums
- [ ] Guide statistics and insights (profile views, booking conversion rate)

#### Customer Features
- [ ] Wishlist / saved guides
- [ ] Trip planning tools
- [ ] Group booking management
- [ ] Booking modification / rescheduling
- [ ] Past trip photo galleries

### Priority 4 — Technical & Infrastructure

#### Performance & SEO
- [ ] Server-side rendering optimization for guide pages (SEO)
- [ ] Image optimization and CDN (next/image with Firebase Storage)
- [ ] Lazy loading for feed images/videos
- [ ] Pagination for guides list, feed, and orders (currently loads all)
- [ ] Caching strategy for Firestore reads

#### Security & Reliability
- [ ] Rate limiting on API routes
- [ ] Input sanitization and XSS protection
- [ ] CSRF protection
- [ ] Fraud detection for bookings
- [ ] Error boundary components
- [ ] Proper error handling and user-facing error messages
- [ ] Logging and monitoring (Sentry, Firebase Analytics)

#### DevOps
- [ ] CI/CD pipeline
- [ ] Staging environment
- [ ] Automated testing (unit, integration, e2e)
- [ ] Environment variable management (currently uses fallback mock values)
- [ ] Database migration strategy
- [ ] Backup and disaster recovery

---

## File Structure Overview

```
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout with providers
│   ├── globals.css                       # Global styles + Tailwind
│   ├── onboarding/page.tsx               # 4-step onboarding wizard
│   ├── guides/
│   │   ├── page.tsx                      # Browse all guides
│   │   └── [guideId]/page.tsx            # Guide detail + booking
│   ├── destinations/page.tsx             # Browse destinations
│   ├── dashboard/
│   │   ├── customer/
│   │   │   ├── page.tsx                  # Customer dashboard
│   │   │   └── profile/page.tsx          # Customer profile settings
│   │   ├── guide/
│   │   │   ├── page.tsx                  # Guide dashboard
│   │   │   └── profile/page.tsx          # Guide profile settings
│   │   └── admin/page.tsx                # Admin verification panel
│   └── api/
│       ├── checkout/route.ts             # Booking API
│       └── seed/route.ts                 # Demo data seeder
├── components/
│   ├── auth/AuthModal.tsx                # Auth modal (signin/signup)
│   ├── booking/BookingWizard.tsx          # Multi-step booking wizard
│   ├── guide/
│   │   ├── GuideCard.tsx                 # Guide listing card
│   │   ├── GuideFeed.tsx                 # Social feed display
│   │   ├── CreatePost.tsx                # Post creation form
│   │   └── GuideSearchClient.tsx         # Search/filter client
│   ├── layout/
│   │   ├── NavbarClient.tsx              # Top navigation bar
│   │   └── BottomNav.tsx                 # Mobile bottom nav
│   └── ui/                              # Shadcn/Radix components
├── contexts/
│   └── AuthContext.tsx                   # Auth provider + Firestore sync
└── lib/
    ├── verification.ts                   # Email verification + badge utils
    ├── utils.ts                          # Tailwind class merge utility
    └── firebase/
        └── config.ts                     # Firebase app initialization
```

---

## Firestore Collections

| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `users` | All registered users | role, displayName, email, nidUrl, nidStatus, isStudentEmail |
| `guides` | Public guide profiles | name, bio, services[], locations[], nogoriStatus, pricePerDay, rating |
| `orders` | Bookings | customerId, guideId, status, totalAmount, dates, travelerDetails |
| `guide_posts` | Social feed posts | guideId, content, mediaUrl, mediaType, likes[], createdAt |

---

## Summary

| Category | Done | Remaining |
|----------|------|-----------|
| Auth & Onboarding | 7 features | — |
| Verification System | 5 features | — |
| Guide Features | 6 features | 5 features |
| Customer Features | 4 features | 5 features |
| Booking Flow | 3 features | 3 features (payments) |
| Social Feed | 5 features | 4 features |
| Admin Panel | 3 features | 4 features |
| Search & Discovery | 2 features | 5 features |
| Notifications | — | 3 features |
| Technical/Infra | 2 features (rules) | 12 features |

**Overall: ~37 features implemented, ~41 remaining for a fully production-ready platform.**

The app is a solid **functional MVP** — users can sign up, get verified, browse guides, book services, and manage their trips/orders. The biggest gaps are **payments**, **messaging**, **reviews**, and **notifications** — the features that turn an MVP into a production product.
