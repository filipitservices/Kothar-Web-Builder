/**
 * Authentication Composable
 * 
 * Provides the primary client-facing API for authentication.
 * Uses Firebase Client SDK for sign-in operations and exchanges tokens
 * with the server for secure session cookie creation.
 * 
 * This composable abstracts Firebase specifics and provides a clean,
 * typed API for components.
 * 
 * Usage:
 * ```ts
 * const { 
 *   currentUser, 
 *   isAuthenticated, 
 *   signInWithEmail, 
 *   signOut 
 * } = useAuth();
 * ```
 */

import { computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue';
import { logger } from '~/utils/logger';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  type User,
  type Unsubscribe,
  type AuthError as FirebaseAuthError
} from 'firebase/auth';
import { getFirebaseAuth } from '~/plugins/firebase.client';
import { useAuthStore } from '~/stores/auth';
import { useOrdersStore } from '~/stores/orders';
import { useWhopAccessStore } from '~/stores/whopAccess';
import { useUnsavedChangesStore } from '~/stores/unsavedChanges';
import type { AuthUser, AuthError, MeResponse, SessionCreateResponse } from '~/types/auth';

/**
 * Map Firebase error codes to user-friendly messages
 */
function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/popup-closed-by-user': 'Sign-in was cancelled',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/requires-recent-login': 'Please sign in again to continue',
  };
  
  return errorMessages[code] || 'An authentication error occurred';
}

/**
 * Convert Firebase User to our AuthUser type
 */
function firebaseUserToAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

/**
 * Create an AuthError from a Firebase error
 */
function createAuthError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message: string };
    return {
      code: firebaseError.code,
      message: getErrorMessage(firebaseError.code),
    };
  }
  
  return {
    code: 'auth/unknown',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
}

/**
 * Exchange Firebase ID token for server session cookie
 */
async function exchangeTokenForSession(idToken: string): Promise<AuthUser> {
  const response = await $fetch<SessionCreateResponse>('/api/auth/session', {
    method: 'POST',
    body: { idToken },
  });
  
  return response.user;
}

/**
 * Authentication composable interface
 */
export interface UseAuthReturn {
  // State
  currentUser: ComputedRef<AuthUser | null>;
  isAuthenticated: ComputedRef<boolean>;
  isLoading: Ref<boolean>;
  isInitialized: Ref<boolean>;
  error: Ref<AuthError | null>;
  
  // Methods
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Main authentication composable
 */
export function useAuth(): UseAuthReturn {
  function shouldFallbackToRedirect(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const firebaseError = error as FirebaseAuthError & { message?: string };
    const code = firebaseError.code ?? '';
    const message = (firebaseError.message ?? '').toLowerCase();
    if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
      return true;
    }
    return message.includes('cross-origin-opener-policy') || message.includes('window.close');
  }

  const authStore = useAuthStore();
  let unsubscribe: Unsubscribe | null = null;
  
  // Computed values from store
  const currentUser = computed(() => authStore.currentUser);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isLoading = computed(() => authStore.isLoading);
  const isInitialized = computed(() => authStore.isInitialized);
  const error = computed(() => authStore.error);
  
  /**
   * Initialize auth state
   * Checks server session and sets up client listener
   */
  async function initializeAuth(): Promise<void> {
    if (authStore.isInitialized) {
      return;
    }
    
    authStore.setLoading(true);
    
    try {
      // First, check server session (works on both client and SSR)
      const response = await $fetch<MeResponse>('/api/auth/me');
      
      if (response.user) {
        authStore.setUser(response.user);
      }
      
    } catch (error) {
      logger.warn('[Auth] Failed to check session:', error);
    }
    
    // Set up client-side auth state listener (only on client)
    if (import.meta.client) {
      const auth = getFirebaseAuth();
      
      if (auth) {
        try {
          const redirectResult = await getRedirectResult(auth);
          if (redirectResult?.user) {
            const idToken = await redirectResult.user.getIdToken();
            const user = await exchangeTokenForSession(idToken);
            authStore.setUser(user);
          }
        } catch (error) {
          logger.warn('[Auth] Failed to complete redirect sign-in:', error);
        }

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User is signed in on client
            // If we don't have a server session, create one
            if (!authStore.currentUser || authStore.currentUser.uid !== firebaseUser.uid) {
              try {
                const idToken = await firebaseUser.getIdToken();
                const user = await exchangeTokenForSession(idToken);
                authStore.setUser(user);
              } catch (error) {
                logger.warn('[Auth] Failed to sync session:', error);
                // Keep client-side state for now
                authStore.setUser(firebaseUserToAuthUser(firebaseUser));
              }
            }
          } else {
            // User is signed out on client
            // Only clear if we think we're authenticated
            if (authStore.isAuthenticated) {
              // Re-check server session in case it's still valid
              try {
                const response = await $fetch<MeResponse>('/api/auth/me');
                if (!response.user) {
                  authStore.clearUser();
                }
              } catch {
                authStore.clearUser();
              }
            }
          }
        });
      }
    }
    
    authStore.setInitialized();
  }
  
  /**
   * Sign in with email and password
   */
  async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
    authStore.setLoading(true);
    authStore.setError(null);
    
    try {
      const auth = getFirebaseAuth();
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      // Sign in with Firebase
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get ID token
      const idToken = await credential.user.getIdToken();
      
      // Exchange for session cookie
      const user = await exchangeTokenForSession(idToken);
      
      authStore.setUser(user);
      authStore.setLoading(false);
      
      return user;
      
    } catch (error) {
      const authError = createAuthError(error);
      authStore.setError(authError);
      authStore.setLoading(false);
      throw authError;
    }
  }
  
  /**
   * Sign up with email and password
   */
  async function signUpWithEmail(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<AuthUser> {
    authStore.setLoading(true);
    authStore.setError(null);
    
    try {
      const auth = getFirebaseAuth();
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      // Create account
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await firebaseUpdateProfile(credential.user, { displayName });
      }
      
      // Get fresh ID token (includes updated claims)
      const idToken = await credential.user.getIdToken(true);
      
      // Exchange for session cookie
      const user = await exchangeTokenForSession(idToken);
      
      authStore.setUser(user);
      authStore.setLoading(false);
      
      return user;
      
    } catch (error) {
      const authError = createAuthError(error);
      authStore.setError(authError);
      authStore.setLoading(false);
      throw authError;
    }
  }
  
  /**
   * Sign in with Google OAuth
   */
  async function signInWithGoogle(): Promise<AuthUser | null> {
    authStore.setLoading(true);
    authStore.setError(null);
    
    try {
      const auth = getFirebaseAuth();
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const provider = new GoogleAuthProvider();
      
      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      let credential: Awaited<ReturnType<typeof signInWithPopup>> | null = null;
      try {
        credential = await signInWithPopup(auth, provider);
      } catch (error) {
        if (shouldFallbackToRedirect(error)) {
          await signInWithRedirect(auth, provider);
          return null;
        }
        throw error;
      }
      
      // Get ID token
      const idToken = await credential.user.getIdToken();
      
      // Exchange for session cookie
      const user = await exchangeTokenForSession(idToken);
      
      authStore.setUser(user);
      authStore.setLoading(false);
      
      return user;
      
    } catch (error) {
      const authError = createAuthError(error);
      authStore.setError(authError);
      authStore.setLoading(false);
      throw authError;
    }
  }
  
  /**
   * Sign out
   */
  async function signOut(): Promise<void> {
    authStore.setLoading(true);
    authStore.setError(null);
    
    try {
      // Clear server session first
      await $fetch('/api/auth/logout', { method: 'POST' });
      
      // Sign out of Firebase client
      const auth = getFirebaseAuth();
      if (auth) {
        await firebaseSignOut(auth);
      }
      
      authStore.clearUser();
      authStore.setLoading(false);
      useWhopAccessStore().reset();
      useOrdersStore().unsubscribeFromOrders();
      useUnsavedChangesStore().prepareForAuthTerminatedNavigation();
      
    } catch (error) {
      // Even if server logout fails, clear local state
      authStore.clearUser();
      authStore.setLoading(false);
      useWhopAccessStore().reset();
      useOrdersStore().unsubscribeFromOrders();
      useUnsavedChangesStore().prepareForAuthTerminatedNavigation();
      logger.warn('[Auth] Sign out error:', error);
    }
  }
  
  /**
   * Send password reset email
   */
  async function sendPasswordReset(email: string): Promise<void> {
    authStore.setError(null);
    
    try {
      const auth = getFirebaseAuth();
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      await sendPasswordResetEmail(auth, email);
      
    } catch (error) {
      const authError = createAuthError(error);
      authStore.setError(authError);
      throw authError;
    }
  }
  
  /**
   * Update user profile
   */
  async function updateProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
    authStore.setError(null);
    
    try {
      const auth = getFirebaseAuth();
      
      if (!auth?.currentUser) {
        throw new Error('No authenticated user');
      }
      
      await firebaseUpdateProfile(auth.currentUser, data);
      
      // Update local state
      if (authStore.currentUser) {
        authStore.setUser({
          ...authStore.currentUser,
          displayName: data.displayName ?? authStore.currentUser.displayName,
          photoURL: data.photoURL ?? authStore.currentUser.photoURL,
        });
      }
      
      // Refresh session to sync with server
      const idToken = await auth.currentUser.getIdToken(true);
      await exchangeTokenForSession(idToken);
      
    } catch (error) {
      const authError = createAuthError(error);
      authStore.setError(authError);
      throw authError;
    }
  }
  
  /**
   * Refresh user data from server
   */
  async function refreshUser(): Promise<void> {
    try {
      const response = await $fetch<MeResponse>('/api/auth/me');
      
      if (response.user) {
        authStore.setUser(response.user);
      } else {
        authStore.clearUser();
      }
    } catch (error) {
      logger.warn('[Auth] Failed to refresh user:', error);
    }
  }
  
  /**
   * Clear current error
   */
  function clearError(): void {
    authStore.setError(null);
  }
  
  // Initialize on mount (client-side only)
  if (import.meta.client) {
    onMounted(() => {
      initializeAuth();
    });
    
    // Cleanup listener on unmount
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    });
  }
  
  return {
    // State
    currentUser,
    isAuthenticated,
    isLoading: computed(() => authStore.isLoading),
    isInitialized: computed(() => authStore.isInitialized),
    error: computed(() => authStore.error),
    
    // Methods
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    updateProfile,
    refreshUser,
    clearError,
  };
}
