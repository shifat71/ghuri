import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

/**
 * Real-time hook that subscribes to a guide's blocked dates.
 * Used by the customer booking calendar to prevent selecting
 * unavailable dates — stays live-synced as the guide updates.
 */
export function useGuideAvailability(guideId: string | null) {
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
    const [serviceCharge, setServiceCharge] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!guideId) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, "guides", guideId),
            (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    // Parse unavailable dates from ISO strings
                    const dates: Date[] = (data.unavailableDates || [])
                        .map((d: string) => new Date(d))
                        .filter((d: Date) => !isNaN(d.getTime()));
                    setUnavailableDates(dates);
                    setServiceCharge(data.serviceCharge ?? null);
                }
                setLoading(false);
            },
            (error) => {
                console.error("useGuideAvailability error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [guideId]);

    return { unavailableDates, serviceCharge, loading };
}
