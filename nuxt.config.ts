// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  
  // Global CSS — resets, typography, shared components, navbar. Page-specific CSS imported in pages.
  css: [
    '~/assets/css/style.css',
    '~/assets/css/components.css',
    '~/assets/css/navbar.css'
  ],
  
  // Runtime configuration for Firebase
  // Server-only values in runtimeConfig root, public values in runtimeConfig.public
  runtimeConfig: {
    // Server-only (private) - never exposed to client bundle
    // These are read from environment variables prefixed with NUXT_
    firebaseAdminCredentials: '', // NUXT_FIREBASE_ADMIN_CREDENTIALS
    firebaseSessionExpiryDays: 5, // NUXT_FIREBASE_SESSION_EXPIRY_DAYS
    /** Whop company API key (Bearer) — server only */
    whopApiKey: '', // NUXT_WHOP_API_KEY
    /** Whop webhook signing secret (Standard Webhooks) — server only */
    whopWebhookSecret: '', // NUXT_WHOP_WEBHOOK_SECRET
    /** Whop app id when using app-scoped API — server only */
    whopAppId: '', // NUXT_WHOP_APP_ID
    /** Existing Whop plan id for checkout sessions — server only */
    whopPlanId: '', // NUXT_WHOP_PLAN_ID
    /** Whop product id for checkAccess / members.list; optional if NUXT_WHOP_PLAN_ID is set (resolved via Plans API) */
    whopProductId: '', // NUXT_WHOP_PRODUCT_ID
    /** Whop company id (required for members.list email reconcile) — server only */
    whopCompanyId: '', // NUXT_WHOP_COMPANY_ID
    /** Secret for POST /api/cron/cleanup-abandoned-drafts (x-cron-secret or Bearer) — server only */
    abandonedDraftCronSecret: '', // NUXT_ABANDONED_DRAFT_CRON_SECRET

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
  
  // Redirect /dashboard to /gallery (Dashboard → Gallery migration)
  routeRules: {
    '/dashboard': { redirect: { to: '/gallery', statusCode: 301 } },
    '/dashboard/**': { redirect: { to: '/gallery', statusCode: 301 } }
  },

  // Nitro configuration for server-side
  nitro: {
    preset: 'firebase_app_hosting',
    // Node 22+ on Windows: Nitro workers must trust system CAs for Firebase Admin HTTPS calls.
    env: {
      NODE_OPTIONS: '--use-system-ca',
    },
    // Ensure firebase-admin is not bundled for client
    externals: {
      external: ['firebase-admin', '@whop/sdk']
    }
  },

  // Vite configuration for development server
  vite: {
    server: {
      allowedHosts: true
    }
  }
})
