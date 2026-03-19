import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export interface Order {
    id: string;
    customerId: string;
    guideId: string;
    guideName?: string;
    customerName?: string;
    destination?: string;
    startDate?: any;
    endDate?: any;
    totalPrice?: number;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'cancelled_by_admin' | 'rejected';
    paymentStatus?: string;
    specialRequests?: string;
    guideEarning?: number;
    platformFee?: number;
    createdAt?: any;
    reviewed?: boolean;
    updatedAt?: any;
}

/**
 * Real-time hook for orders.
 * - For guides: subscribes to all orders where guideId == uid
 * - For customers: subscribes to all orders where customerId == uid
 * Any booking change is instantly reflected in both dashboards.
 */
export function useOrders(role: 'guide' | 'customer') {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const field = role === 'guide' ? 'guideId' : 'customerId';
        const q = query(
            collection(db, "orders"),
            where(field, "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Order[];
                setOrders(data);
                setLoading(false);
            },
            (error) => {
                console.error("useOrders error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid, role]);

    return { orders, loading };
}
