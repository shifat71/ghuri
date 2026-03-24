// Recognized Bangladeshi university email domains
const STUDENT_EMAIL_DOMAINS = [
    // Public universities
    "du.ac.bd",
    "cu.ac.bd",
    "ru.ac.bd",
    "ju.ac.bd",
    "buet.ac.bd",
    "bau.edu.bd",
    "kuet.ac.bd",
    "ruet.ac.bd",
    "cuet.ac.bd",
    "sust.edu",
    "hstu.ac.bd",
    "jnu.ac.bd",
    "nstu.edu.bd",
    "pstu.ac.bd",
    "bsmrau.edu.bd",
    "sau.ac.bd",
    "ku.ac.bd",
    "nu.ac.bd",
    "bou.ac.bd",
    "just.edu.bd",
    "mbstu.ac.bd",
    "brur.ac.bd",
    "butex.edu.bd",
    "duet.ac.bd",

    // Private universities
    "bracu.ac.bd",
    "northsouth.edu",
    "iub.edu.bd",
    "aiub.edu",
    "ewubd.edu",
    "uiu.ac.bd",
    "daffodilvarsity.edu.bd",
    "aust.edu",
    "uap-bd.edu",
    "ulab.edu.bd",
    "green.edu.bd",
    "stamforduniversity.edu.bd",
    "lus.ac.bd",

    // Generic patterns
    "edu.bd",
    "ac.bd",
];

/**
 * Check if an email belongs to a recognized student domain.
 * Returns true if the email domain matches any known university domain.
 */
export function isStudentEmail(email: string): boolean {
    if (!email) return false;
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return false;

    return STUDENT_EMAIL_DOMAINS.some(
        (studentDomain) =>
            domain === studentDomain || domain.endsWith("." + studentDomain)
    );
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
