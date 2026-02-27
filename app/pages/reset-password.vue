<template>
  <div class="auth-container">
    <!-- Main Content -->
    <main class="auth-main">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-card-header">
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <!-- Success Message -->
        <div v-if="emailSent" class="auth-success" role="status">
          <svg class="success-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div>
            <p><strong>Check your email</strong></p>
            <p>We've sent a password reset link to {{ email }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="auth-error" role="alert">
          <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ error.message }}</span>
          <button class="error-dismiss" @click="clearError" aria-label="Dismiss error">×</button>
        </div>

        <!-- Reset Form -->
        <form v-if="!emailSent" class="auth-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>

          <button 
            type="submit" 
            class="auth-submit"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>Send Reset Link</span>
          </button>
        </form>

        <!-- Actions after email sent -->
        <div v-if="emailSent" class="reset-actions">
          <button type="button" class="auth-submit secondary" @click="emailSent = false">
            Try another email
          </button>
        </div>

        <!-- Back to Login -->
        <div class="auth-toggle">
          <NuxtLink to="/login" class="back-link">
            ← Back to sign in
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="auth-footer">
      <p>&copy; 2026 {{ appConfig.appName }}. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  middleware: 'guest', // Redirect authenticated users away
});

const { sendPasswordReset, error, isLoading, clearError } = useAuth();
const appConfig = useAppConfig();

const email = ref('');
const emailSent = ref(false);

async function handleSubmit(): Promise<void> {
  clearError();
  
  try {
    await sendPasswordReset(email.value);
    emailSent.value = true;
  } catch {
    // Error is automatically set in the composable
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
  line-height: 1.5;
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
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.auth-success p {
  margin: 0;
}

.auth-success p:first-child {
  margin-bottom: 0.25rem;
}

.success-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
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
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
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

.auth-submit.secondary {
  background: white;
  color: #1e3a8a;
  border: 1px solid #1e3a8a;
}

.auth-submit.secondary:hover:not(:disabled) {
  background: #f0f4ff;
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

/* Reset Actions */
.reset-actions {
  margin-top: 1rem;
}

/* Toggle / Back Link */
.auth-toggle {
  text-align: center;
  margin-top: 1.5rem;
}

.back-link {
  font-size: 0.875rem;
  color: #1e3a8a;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
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
