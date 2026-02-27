# AI Agent Implementation Guide

**Welcome, AI Dev Agent!**
If you have been prompted to build the "Ghuri" platform based on this codebase, this document is your absolute source of truth. Please read through `01-prd.md` to `05-ui-ux-guidelines.md` first to gain contextual understanding. When you are ready to write code, follow these exact step-by-step phases.

---

## 🛑 Critical Instructions for the AI
1.  **Never assume dependencies:** Always check `package.json` first. If setting up a new Next.js app, use `npx create-next-app@latest ./`.
2.  **Typescript Strictness:** Treat all warnings as errors. Strictly type everything using interfaces defined in `03-database-schema.md`.
3.  **UI Components:** When asked to build UI, use Shadcn/UI. Run the `npx shadcn-ui@latest add [component]` command rather than coding custom complex accessible primitives from scratch.
4.  **Task Boundaries:** If you have access to a `task_boundary` or similar tool, break these phases into single task boundaries so the human user can review them block by block.

---

## Phase 1: Foundation (Day 1)
1.  **Init Next.js:** Ensure the project is initialized with Next.js 14 App Router, Tailwind CSS, TypeScript.
2.  **Configure Styles:** Set up `globals.css` with the design tokens specified in `05-ui-ux-guidelines.md` (Teal/Orange primary colors, Inter font).
3.  **Shadcn Setup:** Initialize shadcn/ui and add the core base components (`button`, `input`, `card`, `dialog`, `sheet` for mobile menus).
4.  **Firebase Init:** Create a `src/lib/firebase/config.ts` file. Set up the `app`, `auth`, `firestore`, and `storage` modules using standard `.env.local` Next.js public variables.

## Phase 2: Core Layouts & Structural UI (Day 2)
1.  **Shared Layout:** Create a responsive standard `<Navbar />` and a Mobile-only `<BottomNav />` (since this is mobile-first).
2.  **Landing Page UI:** Create a highly visual homepage with:
    *   Hero section with a search bar (Where to?).
    *   "Top Destinations" horizontal scrolling row.
    *   "Featured Nogori Verified Guides" grid.
3.  **Mock Data Injection:** Write a seeder script or create local JSON files to mock 5 Guides and 3 Destinations. The UI should be perfectly viewable without the database fully wired up yet.

## Phase 3: The Guide Profile & Booking Flow (Day 3)
1.  **Dynamic Profile Route:** Create `src/app/guides/[guideId]/page.tsx`.
2.  **Profile Architecture:** Implement the Instagram-style Header, Bio, Tabbed switching (Services | Portfolio | Reviews). View `05-ui-ux-guidelines.md` for layout rules.
3.  **Booking Wizard (Complex Component):**
    *   When the user clicks "Book", open a Shadcn `<Sheet>` or `<Dialog>`.
    *   Step 1: Select Date Range (Use Shadcn Calendar component).
    *   Step 2: Select Services (Checkbox list).
    *   Step 3: Provide Traveler details (Name, WhatsApp Phone Number, Group size).
    *   *Store this temporary booking state in Zustand or standard React State.*

## Phase 4: Authentication & Backend Wiring (Day 4)
1.  **Auth Flow:** Implement a clean Login/Register modal using Firebase Google Auth provider and plain Email/Password.
2.  **Firebase Queries:** 
    *   Replace the mock data on the homepage with a real Firestore query to `guides`.
    *   Wire up the dynamic route `guides[guideId]` to fetch the profile, and its sub-collections (`portfolio`, `services`).
3.  **Order Submission API:** Create the backend logic (`src/app/api/checkout/route.ts`). It should receive the booking payload, verify the user is authenticated, create a document in the `orders` collection, and prepare the text for WhatsApp.

## Phase 5: The WhatsApp Handoff (Day 5)
1.  **Meta Webhooks API:** Implement the server-side `fetch` request using the WhatsApp Business API detailed in `04-api-and-integrations.md`.
2.  **Success State:** Once the API route successfully hits Firestore AND WhatsApp, redirect the user application to `src/app/customer/success`, showing them a fun animation and explaining that the Ops team is connecting them via WhatsApp shortly.

## Phase 6: Dashboards (Day 6)
1.  **Customer Dashboard:** Simple list of their orders and statuses (Pending, Confirmed, Completed). Feature to drop a review.
2.  **Guide Dashboard:** A restricted area for the Guide to edit their bio, upload new portfolio images to Firebase Storage, and see their requested bookings.
