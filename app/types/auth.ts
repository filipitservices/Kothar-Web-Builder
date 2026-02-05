/**
 * Authentication Type Definitions
 * Type-safe interfaces for Firebase Authentication integration
 */

/**
 * Authenticated user data returned from Firebase
 * This is the core user object used throughout the application
 */
export interface AuthUser {
  /** Firebase User ID */
  uid: string;
  /** User's email address */
  email: string | null;
  /** User's display name */
  displayName: string | null;
  /** URL to user's profile photo */
  photoURL: string | null;
  /** Whether the user's email has been verified */
  emailVerified: boolean;
}

/**
 * Extended user profile stored in Firestore
 * Contains application-specific data beyond Firebase Auth
 */
export interface UserProfile extends AuthUser {
  /** Timestamp when the user was created */
  createdAt: Date;
  /** Timestamp when the profile was last updated */
  updatedAt: Date;
  /** User preferences */
  preferences?: UserPreferences;
}

/**
 * User preferences for personalization
 */
export interface UserPreferences {
  /** UI theme preference */
  theme: 'light' | 'dark' | 'system';
  /** Whether to receive notifications */
  notifications: boolean;
}

/**
 * Authentication error structure
 * Provides consistent error handling across the application
 */
export interface AuthError {
  /** Firebase error code (e.g., 'auth/user-not-found') */
  code: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Common Firebase Auth error codes
 */
export type AuthErrorCode =
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/invalid-credential'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/popup-closed-by-user'
  | 'auth/popup-blocked'
  | 'auth/network-request-failed'
  | 'auth/too-many-requests'
  | 'auth/session-expired'
  | 'auth/session-revoked'
  | 'auth/requires-recent-login'
  | 'auth/credential-already-in-use';

/**
 * Request body for session creation endpoint
 */
export interface SessionCreateRequest {
  /** Firebase ID token from client authentication */
  idToken: string;
}

/**
 * Response from session creation endpoint
 */
export interface SessionCreateResponse {
  /** Authenticated user data */
  user: AuthUser;
}

/**
 * Response from logout endpoint
 */
export interface LogoutResponse {
  /** Whether logout was successful */
  success: boolean;
}

/**
 * Response from /api/auth/me endpoint
 */
export interface MeResponse {
  /** Authenticated user or null if not authenticated */
  user: AuthUser | null;
}

/**
 * Authentication state for the auth store
 */
export interface AuthState {
  /** Current authenticated user */
  user: AuthUser | null;
  /** Whether auth state is being loaded/checked */
  isLoading: boolean;
  /** Whether initial auth check has completed */
  isInitialized: boolean;
  /** Current auth error, if any */
  error: AuthError | null;
}

/**
 * Decoded session cookie claims from Firebase Admin SDK
 * Used server-side for session verification
 */
export interface SessionClaims {
  /** User ID */
  uid: string;
  /** User's email */
  email?: string;
  /** Whether email is verified */
  email_verified?: boolean;
  /** Display name */
  name?: string;
  /** Profile picture URL */
  picture?: string;
  /** Authentication time (Unix timestamp) */
  auth_time: number;
  /** Issued at time (Unix timestamp) */
  iat: number;
  /** Expiration time (Unix timestamp) */
  exp: number;
  /** Audience (Firebase project ID) */
  aud: string;
  /** Issuer */
  iss: string;
  /** Subject (user ID) */
  sub: string;
}

/**
 * OAuth provider names supported by the application
 */
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'twitter';

/**
 * Sign-in method types
 */
export type SignInMethod = 'email' | 'google' | 'anonymous';

/**
 * Event context auth data attached by middleware
 */
export interface EventContextAuth {
  /** Authenticated user data */
  user: AuthUser;
  /** Session claims from the verified cookie */
  claims: SessionClaims;
}

// Augment H3 event context with auth data
declare module 'h3' {
  interface H3EventContext {
    auth?: EventContextAuth;
  }
}
