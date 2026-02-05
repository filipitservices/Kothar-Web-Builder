# Firebase Authentication Integration

**Secure, SSR-compatible Firebase Authentication for SOSG using server-side session cookies.**

---

## Overview

This document describes the Firebase Authentication integration for SOSG, providing:
- Email/password sign-in and sign-up
- Google OAuth sign-in
- Server-validated HTTP-only cookie sessions for SSR
- Protected route middleware
- Typed composable API for components

---

## Architecture Decision: Session Cookie Approach

### Why Server-Side Session Cookies?

We chose **server-validated HTTP-only cookie sessions** over client-only token flow for:

| Aspect | Cookie Session (Chosen) | Client-Only Token |
|--------|------------------------|-------------------|
| **Security** | httpOnly prevents XSS token theft | Token accessible to JS |
| **SSR Support** | Server validates before render | Client-only check |
| **SEO** | Auth state known at SSR time | Requires hydration |
| **Token Refresh** | Handled server-side | Client must refresh |
| **Protected Routes** | Server can block before response | Client redirect after load |

### Authentication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Nitro Server  │    │    Firebase     │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │  1. signIn(email,pw) │                      │
         │──────────────────────────────────────────────>
         │                      │                      │
         │  2. ID Token         │                      │
         │<──────────────────────────────────────────────
         │                      │                      │
         │  3. POST /api/auth/session (ID Token)       │
         │─────────────────────>│                      │
         │                      │                      │
         │                      │  4. Verify ID Token  │
         │                      │─────────────────────>│
         │                      │                      │
         │                      │  5. Create Session   │
         │                      │─────────────────────>│
         │                      │                      │
         │                      │  6. Session Cookie   │
         │                      │<─────────────────────│
         │                      │                      │
         │  7. Set-Cookie: __session (httpOnly, secure)│
         │<─────────────────────│                      │
         │                      │                      │
         │  8. Subsequent requests include cookie      │
         │─────────────────────>│                      │
         │                      │  9. Verify Session   │
         │                      │─────────────────────>│
         │                      │                      │
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root (DO NOT commit to version control):

```env
# Firebase Client Configuration (safe to expose - embedded in client bundle)
NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NUXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin Credentials (KEEP SECRET - server-side only)
# Option 1: JSON string of service account (for platforms without file system)
NUXT_FIREBASE_ADMIN_CREDENTIALS={"type":"service_account",...}

# Option 2: Path to service account JSON file (for local development)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Session configuration
NUXT_FIREBASE_SESSION_EXPIRY_DAYS=5
```

### Runtime Config in nuxt.config.ts

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-only (private) - never exposed to client
    firebaseAdminCredentials: '',
    firebaseSessionExpiryDays: 5,
    
    // Public - safe to expose, embedded in client bundle
    public: {
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: '',
    }
  }
})
```

### Security Notes

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Never commit service account JSON files** - Add `*.json` patterns for credentials
3. **Use platform secret storage** in production (Vercel, Netlify, etc.)
4. **Minimum IAM privileges** - Service account only needs:
   - `Firebase Authentication Admin` role
   - `Firebase Authentication Viewer` role (for read-only operations)

### Important: Nuxt JSON Parsing Behavior

Nuxt's `runtimeConfig` automatically parses environment variables that start with `{` into JavaScript objects. This means `NUXT_FIREBASE_ADMIN_CREDENTIALS` may arrive in server code as either:
- A **string** (if overridden via CLI or non-JSON format)
- An **object** (auto-parsed by Nuxt from the .env file)

The `server/utils/firebase-admin.ts` utility handles both cases automatically. No action needed - just be aware that if you log `config.firebaseAdminCredentials`, it may already be an object.

---

## File Structure

### New Files Added

```
app/
├── plugins/
│   └── firebase.client.ts          # Firebase Client SDK initialization
├── composables/
│   └── useAuth.ts                  # Client-facing auth composable
├── middleware/
│   ├── auth.ts                     # Route protection middleware (protected routes)
│   └── guest.ts                    # Guest-only middleware (login/signup pages)
├── pages/
│   └── login.vue                   # Login/signup page
├── types/
│   └── auth.ts                     # Auth type definitions
├── stores/
│   └── auth.ts                     # Auth Pinia store

server/
├── utils/
│   └── firebase-admin.ts           # Admin SDK initialization (memoized)
├── api/
│   └── auth/
│       ├── session.post.ts         # Create session cookie endpoint
│       ├── logout.post.ts          # Clear session endpoint
│       └── me.get.ts               # Get current user endpoint
```

### File Responsibilities

| File | Purpose |
|------|---------|
| `plugins/firebase.client.ts` | Initializes Firebase Client SDK from runtimeConfig.public |
| `composables/useAuth.ts` | Provides reactive auth state and methods to components |
| `stores/auth.ts` | Pinia store for centralized auth state |
| `middleware/auth.ts` | Protects routes requiring authentication (SSR-safe) |
| `middleware/guest.ts` | Redirects authenticated users away from guest pages |
| `pages/login.vue` | Login and signup UI |
| `types/auth.ts` | TypeScript interfaces for auth data |
| `server/utils/firebase-admin.ts` | Memoized Admin SDK initialization |
| `server/api/auth/session.post.ts` | Exchanges ID token for session cookie |
| `server/api/auth/logout.post.ts` | Clears session cookie and revokes session |
| `server/api/auth/me.get.ts` | Verifies session and returns user data |

---

## API Reference

### useAuth Composable

```typescript
import { useAuth } from '~/composables/useAuth';

const {
  // State
  currentUser,        // Ref<AuthUser | null>
  isAuthenticated,    // ComputedRef<boolean>
  isLoading,          // Ref<boolean>
  error,              // Ref<AuthError | null>
  
  // Methods
  signInWithEmail,    // (email: string, password: string) => Promise<AuthUser>
  signUpWithEmail,    // (email: string, password: string, displayName?: string) => Promise<AuthUser>
  signInWithGoogle,   // () => Promise<AuthUser>
  signOut,            // () => Promise<void>
  sendPasswordReset,  // (email: string) => Promise<void>
  refreshUser,        // () => Promise<void>
} = useAuth();
```

### Server Endpoints

#### POST /api/auth/session

Creates a session cookie from an ID token.

**Request:**
```typescript
{
  idToken: string;
}
```

**Response:**
```typescript
{
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }
}
```

#### POST /api/auth/logout

Clears the session cookie.

**Response:**
```typescript
{
  success: true
}
```

#### GET /api/auth/me

Returns the current authenticated user from session cookie.

**Response (authenticated):**
```typescript
{
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }
}
```

**Response (not authenticated):**
```typescript
{
  user: null
}
```

---

## Usage Examples

### Basic Authentication in Components

```vue
<script setup lang="ts">
const { currentUser, isAuthenticated, signInWithEmail, signOut, error } = useAuth();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await signInWithEmail(email.value, password.value);
    navigateTo('/builder');
  } catch (e) {
    // Error is automatically set in error ref
  }
};
</script>

<template>
  <div v-if="isAuthenticated">
    <p>Welcome, {{ currentUser?.displayName || currentUser?.email }}</p>
    <button @click="signOut">Sign Out</button>
  </div>
  <div v-else>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="handleLogin">Sign In</button>
    <p v-if="error">{{ error.message }}</p>
  </div>
</template>
```

### Protecting Routes

The `auth` middleware protects routes that require authentication. It runs on **both SSR and client-side navigation**, ensuring:
- No protected UI leaks during server-side rendering
- No UI flicker before redirect on client navigation
- Proper cookie forwarding during SSR via `useRequestFetch`

Add the `auth` middleware to any page that requires authentication:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});
</script>
```

**Currently Protected Routes:**
- `/builder` - Website builder interface (requires authentication)

**How It Works:**

1. Middleware intercepts navigation before page renders
2. On SSR: Uses `useRequestFetch` to forward session cookies to `/api/auth/me`
3. On client: Uses `$fetch` which automatically includes cookies
4. If user is not authenticated, redirects to `/login?redirect={originalPath}`
5. After login, user is redirected back to the original protected route

### Guest-Only Routes

The `guest` middleware protects routes that should only be accessible to unauthenticated users:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
});
</script>
```

**Currently Guest-Only Routes:**
- `/login` - Redirects authenticated users to `/builder`
- `/reset-password` - Redirects authenticated users to `/builder`

### Checking Auth in Server Routes

```typescript
// server/api/protected-route.ts
export default defineEventHandler(async (event) => {
  const user = event.context.auth;
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    });
  }
  
  // User is authenticated
  return { data: 'protected data' };
});
```

---

## User Profile Data Model

### TypeScript Interface

```typescript
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Application-specific fields
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}
```

### Firestore Collection Structure

If storing user profiles in Firestore:

```
/users/{uid}
  - uid: string
  - email: string
  - displayName: string | null
  - photoURL: string | null
  - createdAt: timestamp
  - updatedAt: timestamp
```

---

## Security Rules

### Recommended Firestore Rules

Place in `/firebase/firestore.rules` or Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects/sites belong to users
    match /projects/{projectId} {
      allow read, write: if request.auth != null 
        && resource.data.ownerId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### Session Cookie Security

- **httpOnly**: Prevents JavaScript access (XSS protection)
- **secure**: Only sent over HTTPS
- **sameSite**: 'lax' to prevent CSRF while allowing navigation
- **maxAge**: Matches session expiry (default 5 days)

---

## Session Management

### Session Lifecycle

1. **Creation**: After successful client-side sign-in, ID token is exchanged for session cookie
2. **Validation**: On each request, middleware verifies session cookie with Admin SDK
3. **Refresh**: Session cookies are not automatically refreshed; user must re-authenticate after expiry
4. **Revocation**: On sign-out, cookie is cleared and optionally all sessions revoked

### Session Expiry Configuration

```env
# Set session expiry (1-14 days, default 5)
NUXT_FIREBASE_SESSION_EXPIRY_DAYS=5
```

### Token Theft Detection

The auth middleware checks if the session has been revoked. If token theft is suspected:

1. Call `revokeRefreshTokens(uid)` server-side to invalidate all sessions
2. User will be forced to re-authenticate on next request

---

## Error Handling

### Error Types

```typescript
interface AuthError {
  code: string;
  message: string;
}

// Common error codes
type AuthErrorCode =
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/popup-closed-by-user'
  | 'auth/network-request-failed'
  | 'auth/session-expired'
  | 'auth/session-revoked';
```

### Error Messages

The composable provides user-friendly error messages:

| Code | Message |
|------|---------|
| `auth/user-not-found` | No account found with this email |
| `auth/wrong-password` | Incorrect password |
| `auth/email-already-in-use` | An account with this email already exists |
| `auth/weak-password` | Password must be at least 6 characters |
| `auth/invalid-email` | Invalid email address |
| `auth/popup-closed-by-user` | Sign-in was cancelled |
| `auth/network-request-failed` | Network error. Please try again. |

---

## Local Development

### Running with Firebase Emulator (Optional)

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Initialize Firebase in project:
   ```
   firebase init emulators
   ```

3. Start emulators:
   ```
   firebase emulators:start
   ```

4. Enable emulator in development (add to plugin):
   ```typescript
   if (process.dev) {
     connectAuthEmulator(auth, 'http://localhost:9099');
   }
   ```

### Testing Authentication

1. Start the dev server: `pnpm dev`
2. Navigate to `/login`
3. Create a test account or sign in with existing credentials
4. Verify protected routes redirect unauthenticated users

---

## Migration Notes

### Existing Users

If migrating from another auth system:
1. Export existing user data
2. Use Firebase Admin SDK's `importUsers()` to migrate
3. Notify users about password reset if hashes are incompatible

### Rolling Back

To disable Firebase Auth:
1. Remove `auth` middleware from protected routes
2. Delete `/app/plugins/firebase.client.ts`
3. Delete `/server/api/auth/` directory
4. Remove Firebase-related runtime config from `nuxt.config.ts`
5. Uninstall packages: `pnpm remove firebase firebase-admin`

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Firebase app not initialized" | Ensure plugin runs before composable |
| "Invalid API key" | Check NUXT_PUBLIC_FIREBASE_API_KEY |
| "Permission denied" | Verify Firestore rules allow operation |
| "Session cookie expired" | User must re-authenticate |
| "Admin SDK not initialized" | Check server credentials |

### Debug Mode

Enable Firebase debug logging:
```typescript
// In firebase.client.ts
import { setLogLevel } from 'firebase/app';
if (process.dev) {
  setLogLevel('debug');
}
```

---

## Dependencies

Required packages:
```json
{
  "dependencies": {
    "firebase": "^11.x",
    "firebase-admin": "^13.x"
  }
}
```

Install with:
```
pnpm add firebase firebase-admin
```
