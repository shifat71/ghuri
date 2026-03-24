import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// ─── Fallback hardcoded domains (used when Firestore is unavailable) ────
const FALLBACK_DOMAINS = [
    "du.ac.bd", "cu.ac.bd", "ru.ac.bd", "ju.ac.bd", "buet.ac.bd",
    "bau.edu.bd", "kuet.ac.bd", "ruet.ac.bd", "cuet.ac.bd", "sust.edu",
    "hstu.ac.bd", "jnu.ac.bd", "nstu.edu.bd", "pstu.ac.bd", "bsmrau.edu.bd",
    "sau.ac.bd", "ku.ac.bd", "nu.ac.bd", "bou.ac.bd", "just.edu.bd",
    "mbstu.ac.bd", "brur.ac.bd", "butex.edu.bd", "duet.ac.bd",
    "bracu.ac.bd", "northsouth.edu", "iub.edu.bd", "aiub.edu", "ewubd.edu",
    "uiu.ac.bd", "daffodilvarsity.edu.bd", "aust.edu", "uap-bd.edu",
    "ulab.edu.bd", "green.edu.bd", "stamforduniversity.edu.bd", "lus.ac.bd",
    "edu.bd", "ac.bd",
];

// ─── Module-level cache for Firestore-fetched domains ───────────────────
let _cachedDomains: string[] | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch accepted edu email domains from Firestore.
 * Results are cached for 5 minutes. Falls back to hardcoded list on error.
 */
export async function getAcceptedDomains(): Promise<string[]> {
    const now = Date.now();
    if (_cachedDomains && (now - _cacheTimestamp) < CACHE_TTL) {
        return _cachedDomains;
    }

    try {
        const snap = await getDoc(doc(db, "settings", "accepted_edu_domains"));
        if (snap.exists()) {
            const data = snap.data();
            _cachedDomains = data.domains as string[];
            _cacheTimestamp = now;
            return _cachedDomains;
        }
    } catch (error) {
        console.warn("Failed to fetch edu domains from Firestore, using fallback:", error);
    }

    // Return fallback if Firestore doc doesn't exist or fetch failed
    return FALLBACK_DOMAINS;
}

/**
 * Seed the accepted edu domains document in Firestore.
 * Only creates if it doesn't already exist.
 */
export async function seedAcceptedDomains(): Promise<void> {
    const snap = await getDoc(doc(db, "settings", "accepted_edu_domains"));
    if (!snap.exists()) {
        await setDoc(doc(db, "settings", "accepted_edu_domains"), {
            domains: FALLBACK_DOMAINS,
            updatedAt: new Date(),
        });
    }
}

/**
 * Check email against a given list of accepted domains.
 */
export function checkEmailAgainstDomains(email: string, domains: string[]): boolean {
    if (!email) return false;
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!emailDomain) return false;

    return domains.some(
        (d) => emailDomain === d || emailDomain.endsWith("." + d)
    );
}

/**
 * Synchronous check using hardcoded fallback domains.
 * Use this for instant UI hints (e.g., signup form).
 * For actual verification decisions, use isStudentEmailAsync().
 */
export function isStudentEmail(email: string): boolean {
    return checkEmailAgainstDomains(email, _cachedDomains || FALLBACK_DOMAINS);
}

/**
 * Async check using Firestore-stored accepted domains.
 * Use this for actual verification decisions (onboarding, booking gate).
 */
export async function isStudentEmailAsync(email: string): Promise<boolean> {
    const domains = await getAcceptedDomains();
    return checkEmailAgainstDomains(email, domains);
}

/**
 * Get verification status label and color for display
 */
export function getVerificationBadge(status: string): {
    label: string;
    color: string;
    bgColor: string;
} {
    switch (status) {
        case "verified":
            return {
                label: "Nogori Verified",
                color: "text-emerald-700",
                bgColor: "bg-emerald-50",
            };
        case "pro":
            return {
                label: "Nogori Pro",
                color: "text-purple-700",
                bgColor: "bg-purple-50",
            };
        case "id_submitted":
            return {
                label: "Under Review",
                color: "text-blue-700",
                bgColor: "bg-blue-50",
            };
        case "rejected":
            return {
                label: "Verification Rejected",
                color: "text-red-700",
                bgColor: "bg-red-50",
            };
        default:
            return {
                label: "Pending Verification",
                color: "text-amber-700",
                bgColor: "bg-amber-50",
            };
    }
}

export type NidStatus = "not_submitted" | "submitted" | "verified" | "rejected";

export function getNidBadge(status: NidStatus): {
    label: string;
    color: string;
    bgColor: string;
} {
    switch (status) {
        case "verified":
            return {
                label: "NID Verified",
                color: "text-emerald-700",
                bgColor: "bg-emerald-50",
            };
        case "submitted":
            return {
                label: "NID Under Review",
                color: "text-blue-700",
                bgColor: "bg-blue-50",
            };
        case "rejected":
            return {
                label: "NID Rejected",
                color: "text-red-700",
                bgColor: "bg-red-50",
            };
        default:
            return {
                label: "NID Not Submitted",
                color: "text-amber-700",
                bgColor: "bg-amber-50",
            };
    }
}
