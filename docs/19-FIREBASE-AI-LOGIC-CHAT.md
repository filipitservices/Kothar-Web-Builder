# Firebase AI Logic Chat

**Integration of Firebase AI Logic (Gemini) with the Kothar AI chat assistant.**

---

## Overview

Firebase AI Logic provides client SDKs to access Google's generative AI models (Gemini) directly from the web app. The Kothar AI chat uses this SDK instead of calling the Gemini API directly because:

- **No API key in client code** — Firebase manages the Gemini API key server-side
- **App Check support** — Can enforce reCAPTCHA Enterprise before production
- **Unified Firebase project** — Same project as Auth, Firestore, Storage
- **Per-user rate limits** — Built-in protection when configured

The chat runs entirely in the browser; no server-side AI proxy is required.

---

## SDK Initialization

**File**: `app/composables/useFirebaseAi.ts`

- **getAI**: `getAI(firebaseApp, { backend: new GoogleAIBackend() })` — Uses Gemini Developer API backend
- **getGenerativeModel**: `getGenerativeModel(ai, { model, systemInstruction, generationConfig })`
- **Model**: `gemini-2.5-flash` (configurable per Firebase docs; `gemini-2.0-flash` is deprecated)
- **Start chat**: `model.startChat()` — Returns a `ChatSession` that manages history

The composable is a singleton for the chat session: `getOrCreateChat()` creates a session once and reuses it until `resetChat()` is called (e.g. when the user clears messages).

### Generation Config

The model is configured with constrained generation parameters to enforce brevity and consistency:

```typescript
generationConfig: {
  maxOutputTokens: 256,  // Hard cap (~800 chars); system instruction enforces 400-char soft limit
  temperature: 0.4,      // Focused, consistent answers
  topP: 0.85,            // Slightly constrained token sampling
}
```

---

## App Check Setup

**Status**: Not yet implemented. App Check is recommended before production.

**Planned setup**:

1. Firebase Console → App Check → Register web app with reCAPTCHA Enterprise provider
2. Add `firebaseRecaptchaSiteKey` to `nuxt.config.ts` `runtimeConfig.public` if needed
3. Initialize App Check in `app/plugins/firebase.client.ts` before AI usage:
   ```ts
   initializeAppCheck(app, { provider, isTokenAutoRefreshEnabled: true });
   ```
4. Add `useLimitedUseAppCheckTokens: true` to `getAI()` options when App Check is active
5. Enable enforcement for Firebase AI Logic API in Firebase Console

**Dev vs prod**: Unenforced mode is acceptable for local/dev; enforcement required before production.

---

## IAM and Permissions

For client-only usage (Gemini Developer API), no extra IAM roles are needed. Firebase manages the API key.

For admin features (prompt templates, configs), document `roles/firebasevertexai.viewer` (read) and `roles/firebasevertexai.admin` (write) as optional.

---

## Assistant Role

The system instruction in `useFirebaseAi` is purpose-built for the builder context. It defines:

- **Role**: Builder assistant for Kothar (not a generic AI or public search bot).
- **Builder knowledge**: Describes the builder as a layout sketchpad where users arrange section blocks. Enumerates all 18 block types with purpose descriptions. Lists builder capabilities (drag, reorder, remove, templates, drawing, sync, save). Lists template categories.
- **Output constraints**: Under 400 characters by default. No markdown, HTML, formatting, emojis, bullet/numbered lists. No padding or filler.
- **Scope rules**: Builder-only answers. No app internals. Out-of-scope questions get a short redirect or a suggestion to contact customer support.
- **Layout awareness rule**: Only reference the user's current block arrangement when the user explicitly asks about layout or placement.

The full instruction text lives in `SYSTEM_INSTRUCTION` at the top of `app/composables/useFirebaseAi.ts`.

### Builder Context Injection

When the user sends a message, the `aiChat` store reads the current block layout from `requestLayoutStore` and prepends a context line to the message sent to the model. The UI displays the user's original message unchanged.

- Format: `[Current layout: Navigation, Hero Section, Services, Contact Form, Footer]\n{user message}`
- Only included when `requestLayoutStore.active` is true and blocks are non-empty.
- Uses block labels only (no IDs, types, or internal identifiers).
- The system instruction tells the assistant to only reference this context when the user asks about layout.

**Data sent to Gemini**: Block labels from the current layout (e.g. "Navigation", "Hero Section"). No user PII, no block IDs, no internal state.

---

## Function Calling

**Status**: Not yet implemented. Planned for a future phase.

**Planned functions** (from integration plan):

| Function                | Purpose                              | Parameters                              |
| ----------------------- | ------------------------------------ | --------------------------------------- |
| `createPageTemplate`    | Suggest a new page template/section  | `templateName`, `description`           |
| `suggestCopyVariants`   | Return copy alternatives for a block | `blockId`, `fieldName`, `context`       |
| `populateBlockWithText` | Suggest text for an existing block   | `blockId`, `fieldName`, `suggestedText` |

**Important**: The model returns structured args; the **client** must validate and execute. No direct store mutation from unvalidated model output.

---

## PII and Sensitive Data

- Do not include user PII in system instructions or function args beyond what is necessary (e.g. business name for context)
- Do not send passwords, tokens, or credentials to Gemini
- Document what data is sent to Gemini when adding new context or function parameters

---

## Data Flow

```
User types → AiChatPanel handleSend → useAiChat.sendMessage → aiChatStore.sendMessage
  → store reads requestLayoutStore.blocks (context injection)
  → builds contextualMessage = "[Current layout: ...]\n" + userText
  → stores userText in messages (for UI display)
  → sends contextualMessage to useFirebaseAi.streamMessage
  → Firebase Chat API (sendMessageStream)
  → Chunks streamed → aiChatStore.updateAssistantMessage (immutable)
  → Vue reactivity → AiChatPanel re-renders
```

---

## Testing

1. **Manual**: Open the builder, expand the AI chat panel, send a message. Verify streaming and cancel.
2. **Firebase Console**: Ensure Gemini API is enabled (Firebase AI Logic → Get started).
3. **App Check**: When configured, use debug tokens for local testing; see Firebase App Check docs.

---

## Rollback

1. Disable AI Logic in Firebase Console (or remove Gemini API provider)
2. Revert `app/stores/aiChat.ts` to use a placeholder response instead of `useFirebaseAi`
3. Optionally add a feature flag to toggle between placeholder and Firebase AI

---

## Related Documentation

- [AI Chat System](10-AI-CHAT-SYSTEM.md) — Architecture, layout, composable API
- [Architecture](02-ARCHITECTURE.md) — Three-layer design, data flow
- [Firebase Auth](16-FIREBASE-AUTH.md) — Auth and session boundaries
