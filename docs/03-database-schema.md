# Database Schema (Firestore) & TypeScript Types

Because Firestore is a NoSQL document database, data should be structured for fast reads. We will duplicate small amounts of data (like names and avatars) to avoid N+1 query problems.

## 1. Collections & Documents

### `users` Collection
Stores both travelers and guides (Basic Auth Profile).
```typescript
interface User {
  id: string; // Firebase Auth UID
  role: 'customer' | 'guide' | 'admin';
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### `guides` Collection
Extends the user profile with guide-specific data. The document ID should match the user's Auth UID.
```typescript
interface GuideProfile {
  userId: string; // Same as document ID
  bio: string;
  tagline: string;
  locations: string[]; // e.g., ["Sylhet", "Sreemangal"]
  languages: string[]; // e.g., ["Bangla", "English"]
  
  // Verification & Trust
  nogoriStatus: 'pending' | 'verified' | 'pro' | 'elite' | 'suspended';
  manualScreeningPassed: boolean;
  
  // Stats
  rating: number; // calculated average (e.g. 4.8)
  totalReviews: number;
  totalTrips: number;
  
  isActive: boolean; // Can be toggled to hide profile
  coverPhotoURL: string;
  
  // Sub-collections:
  // - /services
  // - /reviews
  // - /portfolio
}
```

### `guides/{guideId}/services` Sub-collection
The specific modular offerings a guide has.
```typescript
interface GuideService {
  id: string;
  title: string; // e.g., "Full Day Photography"
  category: 'guided_tour' | 'hotel_booking' | 'photography' | 'videography' | 'custom';
  description: string;
  price: number; // stored in lowest denominator (e.g., paisa/cents) or raw BDT
  priceType: 'per_day' | 'per_trip' | 'fixed';
  isActive: boolean;
}
```

### `guides/{guideId}/portfolio` Sub-collection
Images or videos showcasing their work.
```typescript
interface PortfolioItem {
  id: string;
  type: 'image' | 'video_link';
  url: string; // Firebase Storage URL or YouTube link
  caption: string;
  createdAt: FirebaseFirestore.Timestamp;
}
```

### `orders` Collection
Top-level collection so admins can query all orders easily.
```typescript
interface Order {
  id: string;
  customerId: string; // Ref to users
  guideId: string;    // Ref to guides
  
  // Snapshot of what was booked (prevents issues if guide changes prices later)
  serviceSnapshot: {
    serviceId: string;
    title: string;
    price: number;
    priceType: 'per_day' | 'per_trip' | 'fixed';
  }[];
  
  // Customer snapshot (for quick rendering)
  customerName: string;
  customerPhone: string;
  
  // Trip details
  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;
  groupSize: number;
  specialRequests: string;
  totalPrice: number;
  
  // Status tracking
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial_escrow' | 'paid_in_full' | 'refunded';
  
  // Integrations
  whatsappMessageId?: string; // ID of the dispatched message to Ops
  
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

## 2. Firestore Security Rules (Conceptual)

An AI agent implementing this should set up the following rules:

1. **Users:** Can read all `users` (to see names/avatars). Can only write to their own `userId`.
2. **Guides:** Anyone can read guides where `isActive == true` and `nogoriStatus != 'suspended'`. Only the guide owner and admins can write to a guide doc.
3. **Orders:** Customers can read/create their own orders. Guides can read orders where `guideId == request.auth.uid`. Admins can read/write all.
4. **Services/Portfolio:** Anyone can read. Only the guide owner can write.
