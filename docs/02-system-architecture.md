# System Architecture & Tech Stack

## 1. Tech Stack Overview

### Frontend
* **Framework:** Next.js 14 (App Router)
* **Library:** React 18
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn/UI (Built on Radix UI), Lucide React (Icons)
* **Animations:** Framer Motion (for smooth, social-media-style transitions)
* **State Management:** Zustand (for global state) & React Context (for Auth)
* **Data Fetching:** SWR or React Query (for client-side caching) + Firebase SDK

### Backend & BaaS (Firebase)
* **Authentication:** Firebase Auth (Email/Password, Google, Phone OTP)
* **Database:** Cloud Firestore (NoSQL)
* **Storage:** Firebase Cloud Storage
* **Serverless Functions:** Firebase Cloud Functions (Node.js/TypeScript)
* **Hosting:** Vercel (Recommended for Next.js App Router) or Firebase Hosting

### Third-Party Integrations
* **WhatsApp:** Meta Cloud API for WhatsApp Business (for order routing)
* **Maps:** Google Maps API (Places API for location autocomplete, Maps JS for display)
* **Payment Gateway (BD localized):** SSLCommerz or AamarPay (to be implemented via webhook functions)

## 2. High-Level Architecture Flow

1. **Client Layer (Next.js):** 
   Renders pages server-side where SEO is needed (Guide public profiles, Destination landing pages). Client-heavy interactions (Booking forms, Dashboards) use Client Components (`"use client"`).
   
2. **Firebase Auth:** 
   Handles session tokens. Next.js middleware verifies session cookies for protected routes (`/dashboard`, `/admin`).

3. **Firestore Database:** 
   Stores structured data. Follows denormalized NoSQL patterns to minimize read operations (e.g., storing a guide's basic info inside an `order` document).

4. **Cloud Functions (The "Operations" Engine):** 
   Triggers on Firestore document creation. 
   * *Example:* When an `orders` document is created, a Cloud Function triggers, formats the order details into text, and sends an HTTP POST request to the WhatsApp Business API.

## 3. Directory Structure Guidelines (for AI Agents)

```text
/src
  /app                     # Next.js App Router
    /(public)              # Group for public pages
      /guides              # Guide listings
        /[id]              # Individual guide profile logic
      /destinations        # Destination pages
    /(auth)                # Login, Register
    /(protected)
      /customer            # Customer dashboard
      /guide               # Guide dashboard
      /admin               # Admin moderation tools
    /api                   # Next.js API Routes (if not using Cloud Functions)
  /components
    /ui                    # Shadcn/UI primitives (buttons, inputs, dialogs)
    /shared                # Shared components (Navbar, Footer, Loaders)
    /guide                 # Guide-specific components (ProfileCard, ServiceList)
    /booking               # Booking flow components (DatePickers, PriceWizard)
  /lib
    /firebase              # Firebase configuration and initialization
    /whatsapp              # WhatsApp API wrapper functions
    /utils.ts              # cn(), date formatting, currency formatters
  /types                   # TypeScript interfaces and types
  /hooks                   # Custom React hooks (useAuth, useGuide)
```

## 4. Security & Rules
* **Firestore Security Rules:** Critical to ensure travelers can only read public profiles and write to their own orders, while guides can only edit their own profile documents.
* **Environment Variables:** All secrets (WhatsApp Token, Firebase Admin keys) must be securely kept in `.env.local` or Cloud Secret Manager.

## 5. Deployment Pipeline
* Pushes to `main` branch should trigger a GitHub Actions workflow.
* The workflow runs TypeScript type-checking, ESLint, and builds the Next.js app.
* If passing, it deploys to Vercel/Firebase Hosting.
