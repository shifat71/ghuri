# API & Integrations (WhatsApp, Auth, Maps)

## 1. Firebase Authentication
Ghuri relies on Firebase Auth to manage identity.

*   **Methods Enabled:** Google OAuth, Email/Password, and Phone Auth (OTP).
*   **Phone Auth is Critical:** Because Ghuri relies on WhatsApp for order communication, verifying a valid mobile number is essential either during sign-up or during checkout if they used Google/Email.
*   **Implementation Note:** An AI agent should use `signInWithPopup` for Google and `RecaptchaVerifier` for Phone Auth.

## 2. WhatsApp Business API Integration

The core differentiator of Ghuri is completely bypassing complex in-app messaging. When a traveler books a service, Ghuri's backend creates a lead that is managed entirely through a WhatsApp Business account.

### Workflow for the AI Agent building this:
1.  A user places an order on the client side (Next.js). The client `POST`s this to a Next.js API Route (e.g., `/api/orders`) or a Firebase Cloud Function.
2.  The API/Function creates a document in the `orders` Firestore collection.
3.  The API/Function then formats a clear, readable text message.

**Message Template Example:**
```text
🚨 *NEW GHURI ORDER!* 🚨
*Order ID:* #GHR-9812
*Traveler:* John Doe
*Traveler Contact:* +8801700000000 (Checked)

*Selected Guide:* Rafiqul Islam (Nogori Verified 🛡️)
*Service:* Full Day Photography (Sylhet)
*Dates:* 12-Nov-2026 to 13-Nov-2026
*Group Size:* 2

*Total Price:* ৳4,000 (Unpaid)

_Ops action required: Please create a WhatsApp Group with John and Rafiqul ASAP to confirm escrow payment!_
```

4.  The server securely sends this to the Meta WhatsApp Cloud API using standard `fetch` or `axios`:
    ```javascript
    fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: process.env.GHURI_ADMIN_WHATSAPP_NUMBER,
        type: "text",
        text: { body: messageTemplate }
      })
    });
    ```

## 3. Escrow Payments (Future/Phase 2)
For the MVP, "Escrow" means the traveler sends money via bKash/Nagad to the **Ghuri Admin Account** on WhatsApp. Ghuri holds the money manually, and sends it to the guide after the tour. 
*   **Automated Escrow (Phase 3):** To be built with SSLCommerz (for card logic) or bKash API. The system holds `paymentStatus: 'partial_escrow'`.

## 4. Google Maps & Locations
*   **Search/Autocomplete:** Implementation should use the Google Maps Places API for the main search bar on the homepage so users can search valid destinations (e.g. typing "Cox's" auto-fills to "Cox's Bazar, Bangladesh").
*   **Map Displays:** The individual Destination pages or Guide Profiles should feature a small read-only map showing the rough operating radius of the guide.
