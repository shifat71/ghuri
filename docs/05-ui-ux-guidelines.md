# UI/UX & Design Guidelines

Ghuri must look less like a boring corporate booking site (like Agoda/Booking.com) and more like a modern, visual-first social app (like Instagram or Airbnb).

## 1. Design Tokens (Tailwind)

### Colors
*   **Primary (Brand):** Deep Teal or Vibrant Orange (to represent adventure and kites). For example: `teal-600` (`#0d9488`) or `orange-500` (`#f97316`).
*   **Backgrounds:** `slate-50` (`#f8fafc`) for light mode. `slate-900` (`#0f172a`) for deep dark mode.
*   **Text & Typography:** `slate-800` for primary text, `slate-500` for secondary. 
*   **Nogori Trust Green:** Use a vibrant, reassuring green (`emerald-500`) specifically and only for the "Nogori Verified" badges.

### Typography
*   **Font Family:** `Inter`, `Outfit`, or `Plus Jakarta Sans` for clean, modern geometry. 
*   Must support `Hind Siliguri` or `Noto Sans Bengali` for accurate Bangla rendering.

## 2. Component Guidelines (Shadcn/React)

*   **Cards:** Highly visual. Guide cards should have large `aspect-square` or `aspect-[4/5]` images covering 70% of the card, with elegant gradients at the bottom holding the guide's name and Nogori verification badge.
*   **Borders & Radius:** Use rounded corners heavily (`rounded-2xl` or `rounded-3xl`) to make the interface feel friendly and modern ("squircle" aesthetics).
*   **Shadows:** Soft, diffused drop shadows rather than harsh borders (`shadow-xl shadow-slate-200/50`).
*   **Micro-interactions:** Implement Framer Motion for:
    *   Hovering over a guide card slightly lifts it `scale-[1.02]`.
    *   Page transitions slide or fade gracefully.

## 3. Recommended App Structure Layout
### Mobile (Primary)
*   **Bottom Navigation Bar (PWA):** Fixed at the bottom containing: Explore (Home), Search, Bookings, Profile.
*   **Top App Bar:** Minimal, showing the Ghuri logo and a notification bell.

### Desktop (Secondary)
*   **Standard Top Navbar:** Logo on the left, Search input in the center, Auth/Profile on the right.
*   **Grid Layouts:** Using responsive Tailwind grids (e.g., `grid-cols-1 md:grid-cols-3 lg:grid-cols-4`).

## 4. The "Verified Portfolio" View
When a user clicks on a guide's profile, the layout should resemble an Instagram profile:
1.  **Header:** Guide's Profile picture, Total Trips, Rating, and "Nogori Verified" Badge.
2.  **Bio:** Short, punchy.
3.  **Action Buttons:** A primary robust "Book Services" button + "Share" button.
4.  **Tabs:**
    *   *Services:* A list of what they offer (e.g., "Drone Video", "City Tour").
    *   *Portfolio:* A standard 3-column square photo grid showing past trips.
    *   *Reviews:* Scrollable list of verified customer reviews.
