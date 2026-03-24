import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, addDoc, Timestamp } from "firebase/firestore";

// Re-initialize client SDK for server-side API route context
function getClientFirestore() {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
}

/**
 * POST /api/book
 * Creates a booking order after server-side validation:
 * - Guide exists and is not suspended
 * - Date is not blocked by the guide
 * - Pricing is calculated with admin commission settings
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerId, customerName, guideId, startDate, endDate, destination, specialRequests, groupSize } = body;

        if (!customerId || !guideId || !startDate) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const db = getClientFirestore();

        // 1. Fetch guide
        const guideSnap = await getDoc(doc(db, "guides", guideId));
        if (!guideSnap.exists()) {
            return NextResponse.json({ error: "Guide not found." }, { status: 404 });
        }
        const guideData = guideSnap.data();

        if (guideData.nogoriStatus === "suspended") {
            return NextResponse.json({ error: "Guide is currently unavailable." }, { status: 403 });
        }

        // 2. Check guide availability
        const blockedDates: string[] = guideData.unavailableDates || [];
        const requestedDay = new Date(startDate).toISOString().split("T")[0];
        const isBlocked = blockedDates.some(
            d => new Date(d).toISOString().split("T")[0] === requestedDay
        );
        if (isBlocked) {
            return NextResponse.json({ error: "The selected date is unavailable." }, { status: 409 });
        }

        // 3. Fetch admin settings for commission
        const settingsSnap = await getDoc(doc(db, "admin_settings", "global"));
        const commissionPercent = settingsSnap.exists() ? (settingsSnap.data().commissionPercent ?? 10) : 10;
        const minCharge = settingsSnap.exists() ? (settingsSnap.data().minCharge ?? 500) : 500;

        const serviceCharge: number = guideData.serviceCharge ?? minCharge;
        const platformFee = Math.round(serviceCharge * (commissionPercent / 100));
        const guideEarning = serviceCharge - platformFee;

        // 4. Create the order document
        const orderRef = await addDoc(collection(db, "orders"), {
            customerId,
            customerName: customerName || "Customer",
            guideId,
            guideName: guideData.name || "Guide",
            destination: destination || "",
            startDate: Timestamp.fromDate(new Date(startDate)),
            endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
            groupSize: groupSize || 1,
            specialRequests: specialRequests || "",
            totalPrice: serviceCharge,
            platformFee,
            guideEarning,
            status: "pending",
            paymentStatus: "unpaid",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return NextResponse.json({ success: true, orderId: orderRef.id }, { status: 201 });
    } catch (error: any) {
        console.error("Booking API error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
