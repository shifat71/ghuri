# Product Requirements Document (PRD)
**Project Name:** Ghuri (ঘুরি)
**Version:** 1.0 (MVP)

## 1. Product Overview
Ghuri is a localized, double-sided SaaS marketplace that connects travelers with "Nogori Verified" (city-approved/trusted) freelance travel guides. It focuses on bypassing traditional booking agencies by offering a modern social-feed-style UI where guides can showcase their services (photography, tours, hotel booking) and travelers can book them directly. All communications and operations are heavily integrated with WhatsApp to match the regional user behaviors of South Asia (specifically Bangladesh).

## 2. Target Audience
1. **Travelers (Customers):** Young professionals, families, and solo backpackers looking for authentic, customized, and culturally immersive travel experiences at a fair price. They value trust, verification, and easy communication.
2. **Freelance Guides (Providers):** Local experts, photographers, and students who have in-depth knowledge of their regions. They need a professional storefront to market their skills safely and securely.

## 3. Core Value Propositions
* **Nogori Verification:** Trust is the primary product. Guides undergo strict identity checks, interviews, and community endorsements before listing.
* **WhatsApp-Native Workflow:** No in-app chat systems that get ignored. Bookings immediately transition to WhatsApp groups monitored by the Ghuri Operations team.
* **Service Diversity:** Guides are not just "tour guides". They can sell hotel booking help, drone videography, personal photography, and local food tours as modular services.

## 4. User Journeys (MVP Scope)

### 4.1. The Traveler Journey
1. **Discovery:** User visits the web app (PWA), browses a feed of top guides and destinations. They do not need to log in to browse.
2. **Filtering:** User filters by location (e.g., "Sylhet"), dates, and service type (e.g., "Photography").
3. **Profile View:** User clicks a guide, views their bio, "Nogori Verified" status, and a gallery of their past work/reels.
4. **Booking:** User selects a specific service package (e.g., "Full-Day Photography + Tour"), selects the dates via a calendar UI, and hits "Book Now".
5. **Authentication Prompt:** If not logged in, user signs in via Google or Phone OTP.
6. **Checkout/Form:** User provides trip details (Headcount, special requirements).
7. **Handoff:** The application displays a confirmation and provides a link to continue in WhatsApp. The backend simultaneously pushes the structured order data to the Ghuri WhatsApp Business API.

### 4.2. The Guide Journey
1. **Application:** Guide signs up and submits a "Nogori Verification" application (NID, Photos, References).
2. **Onboarding:** Once approved by the admin, the guide gets access to their Dashboard.
3. **Profile Setup:** Guide sets up their storefront. They upload a profile picture, cover photo, bio, and add their modular "Services" (with specific prices per day/trip).
4. **Availability:** Guide blocks out dates they are unavailable on their calendar.
5. **Fulfillment:** Guide receives a WhatsApp message from a Ghuri Admin with a new customer group chat link. They coordinate and deliver the service.

## 5. Non-Functional Requirements
* **Mobile-First:** >80% traffic will be from mobile browsers. UI must feel like a native app (bottom navigation, swipeable galleries).
* **Performance:** High Core Web Vitals. The site should load fast even on 3G networks. Images must be heavily optimized using Next.js `next/image` or a CDN like Cloudinary.
* **Internationalization:** Ready for English and Bangla (`bn`) support from day 1, though MVP might launch strictly in English or Bangla.

## 6. MVP Out of Scope (For Phase 2)
* In-app instant messaging (using WhatsApp for MVP).
* Complex AI Matchmaking (using manual/basic filtering for MVP).
* Automated Escrow payouts (payments will be handled partially manually or via basic SSLCommerz redirect first, payouts done via bank transfer by admins).
