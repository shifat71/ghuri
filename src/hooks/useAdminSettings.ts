import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface AdminSettings {
    minCharge: number;
    maxCharge: number;
    commissionPercent: number;
    destinations: { id: number; name: string; category: string; image: string }[];
}

const DEFAULT_SETTINGS: AdminSettings = {
    minCharge: 500,
    maxCharge: 5000,
    commissionPercent: 10,
    destinations: [],
};

/**
 * Real-time hook for admin_settings/global.
 * Any component using this will reactively update whenever
 * the admin changes pricing or destinations.
 */
export function useAdminSettings() {
    const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "admin_settings", "global"),
            (snap) => {
                if (snap.exists()) {
                    setSettings({ ...DEFAULT_SETTINGS, ...snap.data() } as AdminSettings);
                }
                setLoading(false);
            },
            (error) => {
                console.error("useAdminSettings error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { settings, loading };
}
