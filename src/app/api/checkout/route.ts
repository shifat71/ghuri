import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guideId, travelerDetails, selectedServices, dates, totalAmount, title } = body;

        if (!travelerDetails || !selectedServices || !dates) {
            return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
        }

        // Prepare the order document
        const orderData = {
            guideId,
            title,
            travelerDetails,
            selectedServices,
            dates,
            totalAmount,
            status: "pending", // pending, confirmed, completed, cancelled
            createdAt: serverTimestamp(),
        };

        // Save order to Firestore
        const ordersRef = collection(db, "orders");
        const docRef = await addDoc(ordersRef, orderData);

        return NextResponse.json({
            success: true,
            orderId: docRef.id,
            message: "Order successfully created"
        });

    } catch (error: any) {
        console.error("Checkout API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process checkout" }, { status: 500 });
    }
}
