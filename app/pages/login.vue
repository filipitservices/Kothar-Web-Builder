<template>
  <div class="auth-container">
    <main class="auth-main">
      <section class="auth-shell" aria-labelledby="auth-title">
        <div class="auth-panel">
          <h1 id="auth-title" class="auth-panel__title">Website delivery without generic-builder friction.</h1>
          <p class="auth-panel__text">Start from professional templates, shape the direction, and move to a polished launch with full control.</p>
          <ul class="auth-panel__list">
            <li>Choose a proven template base</li>
            <li>Customize business details with a structured flow</li>
            <li>Track requests and live sites in one place</li>
          </ul>
        </div>

        <div class="auth-card">
          <div class="auth-card-header">
            <h2 class="auth-title">{{ isSignUp ? 'Create Account' : 'Welcome Back' }}</h2>
            <p class="auth-subtitle">
              {{ isSignUp
                ? 'Create your account to start your first website request.'
                : 'Sign in to continue to your templates, requests, and sites.'
              }}
            </p>
          </div>

          <div v-if="displayedError" class="auth-error" role="alert">
            <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>{{ displayedError }}</span>
            <button class="error-dismiss" @click="clearMessages" aria-label="Dismiss error">×</button>
          </div>

          <div v-if="successMessage" class="auth-success" role="status">
            <svg class="success-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ successMessage }}</span>
          </div>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div v-if="isSignUp" class="form-group">
              <label for="displayName" class="form-label">Name</label>
              <input
                id="displayName"
                v-model="form.displayName"
                type="text"
                class="form-input"
                placeholder="Your name"
                autocomplete="name"
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
            </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="form-label">
              Password
              <NuxtLink 
                v-if="!isSignUp" 
                to="/reset-password" 
                class="forgot-password"
              >
                Forgot password?
              </NuxtLink>
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              :autocomplete="isSignUp ? 'new-password' : 'current-password'"
              required
              minlength="6"
            />
          </div>

          <!-- Confirm Password (Sign Up only) -->
          <div v-if="isSignUp" class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="form-input"
              placeholder="••••••••"
              autocomplete="new-password"
              required
              minlength="6"
            />
          </div>

          <button 
            type="submit" 
            class="auth-submit"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>{{ isSignUp ? 'Create Account' : 'Sign In' }}</span>
          </button>
          </form>

          <div class="auth-divider">
            <span>or continue with</span>
          </div>

          <div class="social-auth">
            <button
              type="button"
              class="social-button google"
              :disabled="isLoading"
              @click="handleGoogleSignIn"
            >
              <svg class="social-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
          </div>

          <div class="auth-toggle">
            <span v-if="isSignUp">
              Already have an account?
              <button type="button" class="toggle-link" @click="toggleMode">Sign in</button>
            </span>
            <span v-else>
              Don't have an account?
              <button type="button" class="toggle-link" @click="toggleMode">Create one</button>
            </span>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="auth-footer">
      <p>&copy; 2026 {{ appConfig.appName }}. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  middleware: 'guest', // Redirect authenticated users away
});

const route = useRoute();
const router = useRouter();

const { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  error, 
  isLoading,
  clearError 
} = useAuth();

const appConfig = useAppConfig();

// Form state
const isSignUp = ref(false);
const successMessage = ref<string | null>(null);
const localError = ref<string | null>(null);
const displayedError = computed(() => localError.value ?? error.value?.message ?? null);

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

/** Resolve redirect path: query param, or landing-destination API, or /gallery fallback. */
async function getRedirectUrl(): Promise<string> {
  const redirect = route.query.redirect;
  if (typeof redirect === 'string') return redirect;
  try {
    const res = await $fetch<{ destination?: string; error?: string }>('/api/user/landing-destination');
    if (res && typeof res.destination === 'string') return res.destination;
  } catch {
    // Fallback on error
  }
  return '/gallery';
}

// Toggle between sign-in and sign-up
function toggleMode(): void {
  isSignUp.value = !isSignUp.value;
  clearError();
  localError.value = null;
  successMessage.value = null;
  form.password = '';
  form.confirmPassword = '';
}

function clearMessages(): void {
  clearError();
  localError.value = null;
}

// Handle form submission
async function handleSubmit(): Promise<void> {
  clearMessages();
  successMessage.value = null;

  // Validate passwords match for sign-up
  if (isSignUp.value && form.password !== form.confirmPassword) {
    localError.value = 'Passwords do not match.';
    return;
  }

  try {
    if (isSignUp.value) {
      await signUpWithEmail(form.email, form.password, form.displayName || undefined);
    } else {
      await signInWithEmail(form.email, form.password);
    }
    
    // Success - redirect to intended page
    await router.push(await getRedirectUrl());
    
  } catch {
    // Error is automatically set in the composable
    // Focus the email field for correction
  }
}

// Handle Google sign-in
async function handleGoogleSignIn(): Promise<void> {
  clearMessages();
  successMessage.value = null;

  try {
    const user = await signInWithGoogle();
    if (!user) {
      // Redirect flow started (popup fallback). Browser navigates away.
      return;
    }
    
    // Success - redirect
    await router.push(await getRedirectUrl());
    
  } catch {
    // Error is automatically set
  }
}
</script>
<style scoped src="~/assets/css/auth.css"></style>
