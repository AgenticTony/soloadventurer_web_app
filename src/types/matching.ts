// Matching & Connections types
// Aligned with the shared Supabase schema used by the mobile app

// ── Activities ──────────────────────────────────────────────────

export interface Activity {
  id: string;
  name: string;
  description: string | null;
  category: string;
  iconName: string | null;
  isActive: boolean;
  isLocationSpecific: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  activityId: string;
  createdAt: string;
}

// ── Connections ─────────────────────────────────────────────────

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';
export type MatchType = 'geographic_overlap' | 'activity_match' | 'combined_match';

export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  matchType: MatchType | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined profile data (when querying with select)
  requester?: ConnectionProfile;
  recipient?: ConnectionProfile;
}

export interface ConnectionProfile {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  homeCountry: string | null;
}

// ── Match Discovery ────────────────────────────────────────────

export interface PotentialMatch {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  homeCountry: string | null;
  destinationName: string | null;
  startDate: string | null;
  endDate: string | null;
  overlapDays: number;
  distanceMeters: number | null;
  matchType: MatchType;
  matchScore: number | null;
  sharedActivities: string[];
  emailVerified?: boolean;
  isOnline?: boolean;
}

// ── Semantic / Composite Matching (Sprint 8) ───────────────────

/** Raw match result returned by the `find-potential-matches-semantic` edge function */
export interface SemanticMatchResult {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  homeCountry: string | null;
  destinationName: string | null;
  startDate: string | null;
  endDate: string | null;
  overlapDays: number;
  distanceMeters: number | null;
  semanticScore: number;
  compositeScore: number;
  matchPercentage: number;
  sharedActivityCount: number;
  sharedActivities: string[];
  /** Breakdown of individual scoring factors (0–1 each) */
  factors: MatchFactors;
}

export interface MatchFactors {
  semantic: number;     // pgvector cosine similarity (weight 0.40)
  dateOverlap: number;  // trip date overlap percentage (weight 0.25)
  activities: number;   // Jaccard similarity on shared activities (weight 0.15)
  destination: number;  // country + exact destination match (weight 0.10)
  age: number;          // age-range proximity (weight 0.10)
}

/** Confidence tier derived from composite score */
export type MatchConfidence = 'high' | 'medium' | 'low';

/** Extended match with composite scoring data */
export interface CompositeMatch extends PotentialMatch {
  semanticScore: number;
  compositeScore: number;
  matchPercentage: number;
  sharedActivityCount: number;
  confidence: MatchConfidence;
  factors: MatchFactors;
}

/** Score thresholds for match confidence tiers */
export const MATCH_CONFIDENCE_THRESHOLDS = {
  high: 80,
  medium: 50,
  low: 0,
} as const;

export function getMatchConfidence(percentage: number): MatchConfidence {
  if (percentage >= MATCH_CONFIDENCE_THRESHOLDS.high) return 'high';
  if (percentage >= MATCH_CONFIDENCE_THRESHOLDS.medium) return 'medium';
  return 'low';
}

// ── Messages ───────────────────────────────────────────────────

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
}

export interface ChatPreview {
  connectionId: string;
  otherUser: ConnectionProfile;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}
