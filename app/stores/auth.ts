/**
 * Authentication Pinia Store
 * 
 * Centralized authentication state management.
 * This store maintains the auth state and is used by the useAuth composable.
 * 
 * The store is SSR-safe and handles hydration properly.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthUser, AuthError, AuthState } from '~/types/auth';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null);
  const isLoading = ref<boolean>(true);
  const isInitialized = ref<boolean>(false);
  const error = ref<AuthError | null>(null);
  
  // Getters
  const isAuthenticated = computed<boolean>(() => user.value !== null);
  
  const currentUser = computed<AuthUser | null>(() => user.value);
  
  const uid = computed<string | null>(() => user.value?.uid || null);
  
  const displayName = computed<string | null>(() => 
    user.value?.displayName || user.value?.email || null
  );
  
  // Actions
  
  /**
   * Set the current user
   * Called after successful authentication
   */
  function setUser(newUser: AuthUser | null): void {
    user.value = newUser;
    error.value = null;
  }
  
  /**
   * Set loading state
   */
  function setLoading(loading: boolean): void {
    isLoading.value = loading;
  }
  
  /**
   * Mark initialization as complete
   * Called after initial auth state check
   */
  function setInitialized(): void {
    isInitialized.value = true;
    isLoading.value = false;
  }
  
  /**
   * Set an authentication error
   */
  function setError(newError: AuthError | null): void {
    error.value = newError;
  }
  
  /**
   * Clear the current user and error
   * Called on sign out
   */
  function clearUser(): void {
    user.value = null;
    error.value = null;
  }
  
  /**
   * Reset the entire auth state
   * Useful for testing or hard resets
   */
  function $reset(): void {
    user.value = null;
    isLoading.value = true;
    isInitialized.value = false;
    error.value = null;
  }
  
  return {
    // State (as refs for reactivity)
    user,
    isLoading,
    isInitialized,
    error,
    
    // Getters (as computed)
    isAuthenticated,
    currentUser,
    uid,
    displayName,
    
    // Actions
    setUser,
    setLoading,
    setInitialized,
    setError,
    clearUser,
    $reset,
  };
});

// Export type for use in other files
export type AuthStore = ReturnType<typeof useAuthStore>;
