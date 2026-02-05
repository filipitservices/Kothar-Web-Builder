// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  
  // Global CSS
  css: [
    '~/assets/css/style.css',
    '~/assets/css/components.css'
  ],
  
  // Runtime configuration for Firebase
  // Server-only values in runtimeConfig root, public values in runtimeConfig.public
  runtimeConfig: {
    // Server-only (private) - never exposed to client bundle
    // These are read from environment variables prefixed with NUXT_
    firebaseAdminCredentials: '', // NUXT_FIREBASE_ADMIN_CREDENTIALS
    firebaseSessionExpiryDays: 5, // NUXT_FIREBASE_SESSION_EXPIRY_DAYS
    
    // Public - safe to expose, embedded in client bundle
    // These are read from environment variables prefixed with NUXT_PUBLIC_
    public: {
      firebaseApiKey: '', // NUXT_PUBLIC_FIREBASE_API_KEY
      firebaseAuthDomain: '', // NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      firebaseProjectId: '', // NUXT_PUBLIC_FIREBASE_PROJECT_ID
      firebaseStorageBucket: '', // NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      firebaseMessagingSenderId: '', // NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      firebaseAppId: '', // NUXT_PUBLIC_FIREBASE_APP_ID
    }
  },
  
  // Nitro configuration for server-side
  nitro: {
    // Ensure firebase-admin is not bundled for client
    externals: {
      external: ['firebase-admin']
    }
  }
})
