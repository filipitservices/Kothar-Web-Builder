<template>
  <div class="auth-container">
    <!-- Auth Content -->
    <main class="auth-main">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-card-header">
          <h1 class="auth-title">{{ isSignUp ? 'Create Account' : 'Welcome Back' }}</h1>
          <p class="auth-subtitle">
            {{ isSignUp 
              ? 'Start building beautiful websites today' 
              : 'Sign in to continue to your projects' 
            }}
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="auth-error" role="alert">
          <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ error.message }}</span>
          <button class="error-dismiss" @click="clearError" aria-label="Dismiss error">×</button>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="auth-success" role="status">
          <svg class="success-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Auth Form -->
        <form class="auth-form" @submit.prevent="handleSubmit">
          <!-- Display Name (Sign Up only) -->
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

          <!-- Email -->
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

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="auth-submit"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>{{ isSignUp ? 'Create Account' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or continue with</span>
        </div>

        <!-- Social Auth -->
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

        <!-- Toggle Mode -->
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
    </main>

    <!-- Footer -->
    <footer class="auth-footer">
      <p>&copy; 2026 SOSG. All rights reserved.</p>
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

// Form state
const isSignUp = ref(false);
const successMessage = ref<string | null>(null);

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// Get redirect URL from query params
const redirectUrl = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' ? redirect : '/dashboard';
});

// Toggle between sign-in and sign-up
function toggleMode(): void {
  isSignUp.value = !isSignUp.value;
  clearError();
  successMessage.value = null;
  form.password = '';
  form.confirmPassword = '';
}

// Handle form submission
async function handleSubmit(): Promise<void> {
  clearError();
  successMessage.value = null;

  // Validate passwords match for sign-up
  if (isSignUp.value && form.password !== form.confirmPassword) {
    // Create a local error state since we can't set the store error directly
    return;
  }

  try {
    if (isSignUp.value) {
      await signUpWithEmail(form.email, form.password, form.displayName || undefined);
    } else {
      await signInWithEmail(form.email, form.password);
    }
    
    // Success - redirect to intended page
    await router.push(redirectUrl.value);
    
  } catch {
    // Error is automatically set in the composable
    // Focus the email field for correction
  }
}

// Handle Google sign-in
async function handleGoogleSignIn(): Promise<void> {
  clearError();
  successMessage.value = null;

  try {
    await signInWithGoogle();
    
    // Success - redirect
    await router.push(redirectUrl.value);
    
  } catch {
    // Error is automatically set
  }
}
</script>

<style scoped>
/* Auth Page Container */
.auth-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
}

/* Main Content */
.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Auth Card */
.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.auth-card-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Error Message */
.auth-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.error-dismiss {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #dc2626;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

/* Success Message */
.auth-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.success-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.forgot-password {
  font-size: 0.75rem;
  color: #1e3a8a;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Submit Button */
.auth-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  margin-top: 0.5rem;
}

.auth-submit:hover:not(:disabled) {
  background: #1e2d7d;
}

.auth-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.auth-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.auth-divider span {
  padding: 0 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Social Auth */
.social-auth {
  display: flex;
  gap: 0.75rem;
}

.social-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.social-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.social-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.social-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Toggle Mode */
.auth-toggle {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.toggle-link {
  background: none;
  border: none;
  color: #1e3a8a;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.toggle-link:hover {
  text-decoration: underline;
}

/* Footer */
.auth-footer {
  padding: 1rem 2rem;
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-main {
    padding: 1rem;
  }
}
</style>
