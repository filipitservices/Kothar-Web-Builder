# AI Chat System Documentation

**Complete guide to the AI chat assistant feature: architecture, layout integration, interaction model, and extensibility.**

---

## Overview

The AI Chat System provides an integrated conversational assistant within the Kothar editor. Users can interact with an AI chatbot to receive help with website design, content suggestions, and general assistance while building their sites.

### Key Features

- **Real-time messaging interface** with user/assistant message distinction
- **Minimizable panel** that collapses to header-only (44px) when not in use
- **Smooth transitions** with 0.3s ease animation between states
- **Floating overlay** — does not affect layout; overlays the screens area only
- **State persistence** via Pinia store architecture
- **Type-safe implementation** following project TypeScript conventions
- **Reactive UI** with auto-scrolling and visual feedback
- **Firebase AI Logic integration** — Real Gemini responses via streaming
- **Cancel support** — Abort in-flight requests

---

## Architecture

The AI Chat System follows the established three-layer architecture pattern used throughout Kothar:

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION LAYER                 │
│           AiChatPanel.vue Component             │
│  - Message list rendering                       │
│  - Input field, send and cancel buttons          │
│  - Visual state indicators                      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│                LOGIC LAYER                      │
│     useAiChat() + useFirebaseAi() Composables   │
│  - Store abstraction                            │
│  - Firebase AI init, model, chat session        │
│  - Streaming and cancel support                 │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│                DATA LAYER                       │
│            useAiChatStore (Pinia)               │
│  - Message state management                     │
│  - Processing state tracking                    │
│  - Immutable updates for streaming              │
└─────────────────────────────────────────────────┘
```

See [Firebase AI Logic Chat](19-FIREBASE-AI-LOGIC-CHAT.md) for SDK initialization and configuration.

---

## Data Structure

### Message Interface

```typescript
interface AiMessage {
  id: string;              // Unique identifier: "msg-{timestamp}-{random}"
  role: 'user' | 'assistant';  // Message sender
  content: string;         // Message text
  timestamp: number;       // Unix timestamp (milliseconds)
}
```

### Store State

```typescript
{
  messages: Ref<AiMessage[]>;    // Array of all chat messages
  isProcessing: Ref<boolean>;    // Whether AI is currently responding
  inputText: Ref<string>;        // Current input field value
}
```

---

## Component Integration

### Layout Hierarchy

```
ScreensPanel.vue (.screens-panel)
  ├─ DrawingControlsPanel (fixed height, at top under "Editing page layout" bar)
  └─ .screens-area (flex: 1, position: relative)
       ├─ .screens-inner (flex: 1, scrollable) — device frames
       └─ AiChatPanel (position: absolute, bottom: 0) — overlay
```

The AI Chat Panel is a **floating overlay** that does not participate in the flex layout. It is positioned at the bottom of `.screens-area`, overlaying the device frames only. DrawingControlsPanel is at the top of the panel and remains fully visible and accessible. Opening or closing the chat does not affect the dimensions of screens or other controls.

### Scaling System Integration

The `useScreenScaling` composable does **not** include the AI chat in its layout calculations. The chat is an overlay and consumes no vertical space.

**Scaling Logic**:
- Measures total panel height
- Subtracts consumed height from **DrawingControlsPanel only** (and gaps)
- Calculates scale factors based on width and height constraints
- Result: Screens never get cut off vertically; layout remains stable when chat is opened or closed

**Dynamic Recalculation**:
- ResizeObserver monitors panel and DrawingControlsPanel
- MutationObserver detects structural changes
- Debounced resize handler prevents excessive recalculations

**Layout Modes**:
- Side-by-side (≥1100px): Shared scale based on combined width and max height
- Stacked (<1100px): Independent width scales, shared height scale for both screens

### Layout Safety

1. **ScreensPanel** uses `flex-direction: column` with `gap: var(--space-md)`
2. **.screens-area** wraps screens and overlay; `flex: 1`, `position: relative`, `overflow: hidden`
3. **.screens-inner** has `flex: 1` and `overflow: auto` for scrollable screen area
4. **DrawingControlsPanel** has fixed height (`flex-shrink: 0`)
5. **AiChatPanel** is `position: absolute` at bottom of `.screens-area`; does not affect layout
6. **useScreenScaling** considers only DrawingControlsPanel when computing usable height

**Result**: The chat overlays the screens area without compressing or clipping content. Layout stability is preserved regardless of chat visibility.

---

## Component API

### AiChatPanel.vue

**Purpose**: Renders the chat interface with message history and input controls

**Props**: None (uses composable for state access)

**Emits**: None (state changes via composable/store)

**Internal State**:
```typescript
{
  isMinimized: Ref<boolean>;  // Tracks minimized/expanded state
}
```

**Features**:
- Auto-scrolling message container
- Empty state promexpanded, `44px` minimized (responsive: `140px`/`44px` on mobile)
- Transition: `height 0.3s ease`
- Typing indicator during processing
- Clear chat button (hidden when minimized)
- **Minimize/expand toggle button** (▼/▲ icon)
- Keyboard support (Enter to send)
- Disabled state during processing
- **Smooth height transitions** (0.3s ease)

**Minimized Behavior**:
- Panel height: `44px` (header only)
- Chat body (`chat-messages`, `chat-input-wrapper`) hidden via `v-if`
- Clear button hidden when minimized
- Minimize button always visible
- Scaling system automatically recalculates available space
- No layout break or overflow

**Styling**:
- Height: `260px` (responsive: `200px` on mobile)
- Border radius: `12px`
- Colors: Uses existing design tokens (`#1e3a8a`, `#e2e8f0`, etc.)
- Shadow: `0 2px 8px rgba(15, 23, 42, 0.06)` (consistent with other panels)

---

## Composable API

### useAiChat()

**File**: [composables/useAiChat.ts](../app/composables/useAiChat.ts)

**Purpose**: Abstraction layer between components and aiChat store

**Returns**:

```typescript
interface UseAiChatReturn {
  messages: ComputedRef<AiMessage[]>;
  isProcessing: ComputedRef<boolean>;
  inputText: ComputedRef<string>;
  hasMessages: ComputedRef<boolean>;
  messageCount: ComputedRef<number>;
  sendMessage: (content: string) => Promise<void>;
  cancelSend: () => void;
  clearMessages: () => void;
  setInputText: (text: string) => void;
}
```

**Usage Example**:

```typescript
import { useAiChat } from '~/composables/useAiChat';

const {
  messages,
  isProcessing,
  hasMessages,
  sendMessage,
  clearMessages
} = useAiChat();

// Send a message
await sendMessage('How do I customize the navbar?');

// Clear chat history
clearMessages();
```

---

## Store API

### useAiChatStore

**File**: [stores/aiChat.ts](../app/stores/aiChat.ts)

**Purpose**: Centralized state management for AI chat data

**State**:

```typescript
{
  messages: Ref<AiMessage[]>;
  isProcessing: Ref<boolean>;
  inputText: Ref<string>;
}
```

**Actions**:

**`addMessage(role: 'user' | 'assistant', content: string): string`**

Adds a new message to the chat history. Returns the message id.

**`updateAssistantMessage(messageId: string, content: string): void`**

Updates an assistant message content (used for streaming). Immutable update.

**`clearMessages(): void`**

Removes all messages from history and resets the Firebase chat session.

**`cancelSend(): void`**

Cancels the in-flight AI request and clears processing state.

**`setProcessing(processing: boolean): void`**

Updates the processing state (for loading indicators).

**`setInputText(text: string): void`**

Updates the input field value.

**`sendMessage(content: string): Promise<void>`**

Complete flow: validates input, adds user message, streams AI response via Firebase AI Logic, updates state.

```typescript
await store.sendMessage('Help me with my hero section');
```

---

## Interaction Model

### User Flow

```
User types message
      ↓
User presses Enter or clicks Send button
      ↓
Input validation (must have content, not already processing)
      ↓
User message added to chat (role: 'user')
      ↓
Input field cleared
      ↓
Processing state set to true
      ↓
Assistant message placeholder added (empty content)
      ↓
Firebase AI streamMessage() streams response chunks
      ↓
Store updates assistant message incrementally (immutable)
      ↓
Typing indicator shown until first chunk arrives
      ↓
Processing state set to false when stream completes
      ↓
Chat scrolls to bottom
      ↓
User can send next message (or cancel during processing)
```

### Minimize/Expand Flow

```
User clicks minimize button (▼)
      ↓
isMinimized ref set to true
      ↓
- **Minimized state**: Header only visible, body hidden, expand button (▲)
- **Expanded state**: Full chat UI visible, minimize button (▼)
CSS transition animates height: 160px → 44px
      ↓
v-if removes chat-body from DOM
      ↓
useScreenScaling detects height change via ResizeObserver
      ↓
Screens recalculate scale factors
      ↓
Screens automatically expand to use freed vertical space
      ↓
User clicks expand button (▲)
      ↓
isMinimized ref set to false
      ↓
CSS transition animates height: 44px → 160px
      ↓
v-if adds chat-body back to DOM
      ↓
useScreenScaling detects height change
      ↓
Screens recalculate and scale down proportionally
```

### Visual Feedback

- **User messages**: Right-aligned, `var(--color-primary)` background, white text
- **Assistant messages**: Left-aligned, `var(--color-bg)` background, bordered
- **Processing state**: Typing indicator when waiting for first chunk; streaming content as it arrives
- **Cancel button**: Shown during processing; subtle secondary style
- **Empty state**: Centered italic prompt text
- **Disabled input**: Opacity reduced, cursor not-allowed

---

## Styling System

### Design Tokens (Consistent with Project)

All styling uses tokens from `app/assets/css/style.css`. No hardcoded hex values.

**Colors**: `--color-primary`, `--color-bg`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-placeholder`, etc.

**Spacing**: `--space-xs` through `--space-3xl` (rem scale)

**Radius**: `--radius-sm`, `--radius-md`, `--radius-lg`

**Typography**:
- Title: `13px`, `font-weight: 600`
- Messages: `12px`, `line-height: 1.5`
- Input: `12px`

**Shadows**:
- Panel: `0 2px 8px rgba(15, 23, 42, 0.06)` (subtle, consistent)
- Hover states: `0 2px 8px rgba(30, 58, 138, 0.3)` (interactive elements)

---

## Responsive Behavior

### Breakpoints

**Mobile (≤768px)**:
- Panel height: `180px` (reduced from `220px`)
- Message padding: `6px 10px` (reduced from `8px 12px`)
- Font size: `11px` (reduced from `12px`)
- Inner padding: `8px` (reduced from `12px`)

### Flex Behavior

The chat panel maintains fixed height across all viewports:
- Does not grow/shrink with available space
- Always visible at bottom of screens container
- Scrollable message area handles overflow

---

## Extensibility

### Firebase AI Logic Integration

The chat uses **Firebase AI Logic** (Gemini) via `useFirebaseAi` composable. The model is configured with a builder-specific system instruction and constrained generation config (low temperature, capped output tokens). See [Firebase AI Logic Chat](19-FIREBASE-AI-LOGIC-CHAT.md) for:

- SDK initialization, model configuration, and generation config
- Builder-scoped system instruction and context injection
- App Check setup (recommended before production)
- Function calling (planned)
- Rollback procedure

### Builder Context Injection (Implemented)

The AI assistant is aware of the current builder state. When the user sends a message, the `aiChat` store reads the current block layout from `requestLayoutStore` and prepends a context line to the message sent to the model. The UI displays the user's original message unchanged.

```typescript
// In aiChat store — simplified
function buildContextualMessage(userMessage: string): string {
  const layoutStore = useRequestLayoutStore();
  if (!layoutStore.active || layoutStore.blocks.length === 0) {
    return userMessage;
  }
  const labels = layoutStore.blocks.map((b) => b.label).join(', ');
  return `[Current layout: ${labels}]\n${userMessage}`;
}
```

- Context uses block labels only (no IDs, types, or internal identifiers).
- The system instruction tells the assistant to only reference layout context when the user asks about layout or placement.
- See [Firebase AI Logic Chat](19-FIREBASE-AI-LOGIC-CHAT.md) for full details on context injection and the system instruction.

### Streaming Responses

Streaming is implemented via `useFirebaseAi().streamMessage()`. The store adds an empty assistant message, then calls `streamMessage` with an `onChunk` callback that updates the message content via `updateAssistantMessage`. See `app/stores/aiChat.ts` and `app/composables/useFirebaseAi.ts`.

### Adding Message Actions

Extend the UI with message-specific actions:

```vue
<template>
  <div class="message" :class="`message-${message.role}`">
    <div class="message-content">{{ message.content }}</div>
    <div class="message-actions" v-if="message.role === 'assistant'">
      <button @click="copyMessage(message.content)">📋 Copy</button>
      <button @click="regenerateResponse(message)">🔄 Regenerate</button>
    </div>
  </div>
</template>
```

### Persisting Chat History

To save messages across sessions:

```typescript
// In aiChat store
import { useLocalStorage } from '@vueuse/core';

const messages = useLocalStorage<AiMessage[]>('kothar-ai-chat-history', []);

// Messages now persist in localStorage automatically
```

---

## Best Practices

### Component Usage

✅ **Do**:
- Import via composable: `const { sendMessage } = useAiChat()`
- Let the store manage state persistence
- Use computed properties for derived state
- Follow unidirectional data flow

❌ **Don't**:
- Import store directly in components (use composable)
- Mutate message arrays directly (use store actions)
- Store chat state in component local refs
- Block UI thread with synchronous operations

### State Management

✅ **Do**:
- Call `sendMessage()` for all message sending
- Use `clearMessages()` to reset chat
- Check `isProcessing` before sending
- Validate input before submission

❌ **Don't**:
9. **Persistent Minimize State**: Remember user's minimize preference across sessions
10. **Keyboard Shortcut**: Toggle minimize/expand with hotkey (e.g., Ctrl+M)
- Manually push to `messages` array
- Mutate message objects after creation
- Bypass the composable abstraction layer
- Ignore processing state checks

### Styling

✅ **Do**:
- Use existing design tokens and color variables
- Match border radius and shadow patterns
- Follow responsive breakpoint conventions
- Maintain consistent spacing scales

❌ **Don't**:
- Introduce new color values outside the design system
- Use fixed pixel widths (use flex/responsive units)
- Add inline styles (use scoped CSS)
- Override global styles without scoping

---

## Future Enhancements

### Implemented

1. **Context-Aware Responses**: Assistant sees the current block layout and can comment on arrangement when asked.
2. **Builder-Scoped System Instruction**: Assistant understands all 18 block types, template categories, and builder capabilities.
3. **Generation Config**: Temperature, maxOutputTokens, and topP tuned for brevity and consistency.

### Planned Features

1. **Quick Actions**: Buttons to apply AI suggestions (e.g., "Add this block")
2. **Function Calling**: Model returns structured actions the client validates and executes
3. **Voice Input**: Speech-to-text for message composition
4. **Message History Search**: Filter and search past conversations
5. **Attachment Support**: Upload images or files for AI analysis
6. **Chat Export**: Download conversation as text or PDF

### Integration Opportunities

- **Template Suggestions**: AI recommends templates based on business type
- **Content Generation**: Generate block content from business data
- **Design Feedback**: AI critiques layout and suggests improvements

---

## Technical Notes

### TypeScript

All types are strictly defined:
- `AiMessage` interface in store
- `UseAiChatReturn` interface in composable
- Props and emits fully typed in component
- No use of `any` or type assertions

### Reactivity

- Store uses `ref()` for primitive state
- Composable exposes `computed()` refs for read-only access
- Component uses `watch()` for side effects (scroll, sync)
- Immutable update patterns (spread operator for arrays)

### Performance

- Message rendering uses `:key="message.id"` for efficient diffing
- Auto-scroll debounced via `nextTick()`
- Input field uses local `v-model` to avoid excessive store updates
- Typing indicator CSS animation (no JavaScript timer)

### Accessibility

- Semantic HTML (`<input>`, `<button>`)
- ARIA labels on interactive elements (via `title` attribute)
- Keyboard navigation support (Enter to send)
- Focus states for all interactive controls
- Sufficient color contrast ratios (WCAG AA compliant)

---

## Troubleshooting

### Chat not appearing

**Check**:
1. Component imported in `ScreensPanel.vue`
2. No CSS `display: none` overrides
3. Browser console for mount errors

### Messages not sending

**Check**:
1. Input field not disabled (`isProcessing === false`)
2. Content validation passing (non-empty, trimmed)
3. Store action `sendMessage()` not throwing errors

### Layout breaking

**Check**:
1. `ScreensPanel` has `flex-direction: column`
2. `screens-inner` has `flex: 1` and `min-height: 0`
3. `AiChatPanel` has fixed height in CSS
4. No hardcoded heights on parent containers
5. **Scaling calculation includes height constraints** - verify `useScreenScaling` considers vertical space

**Solution**: The `useScreenScaling` composable automatically accounts for the chat panel's height when calculating screen scales. If screens appear cut off:
- Check browser console for ResizeObserver errors
- Verify `.ai-chat-panel` class is present in DOM
- Ensure panel has correct fixed height (160px default, 140px mobile)
- Try resizing window to trigger recalculation

### Styling inconsistencies

**Check**:
1. Using correct color tokens from design system
2. Border radius matches other panels (`12px`)
3. Shadows consistent with project patterns
4. Font sizes and weights match existing components

---

## Related Documentation

- [Architecture Deep Dive](02-ARCHITECTURE.md) - System design patterns
- [Data Flow Reference](04-DATA-FLOW.md) - State management architecture
- [API Reference](05-API-REFERENCE.md) - Store and composable APIs
- [Component Catalog](06-COMPONENT-CATALOG.md) - All UI components

---

## File Locations

- **Component**: [app/components/AiChatPanel.vue](../app/components/AiChatPanel.vue)
- **Composable**: [app/composables/useAiChat.ts](../app/composables/useAiChat.ts)
- **Store**: [app/stores/aiChat.ts](../app/stores/aiChat.ts)
- **Integration**: [app/components/ScreensPanel.vue](../app/components/ScreensPanel.vue)
- **Documentation**: [docs/10-AI-CHAT-SYSTEM.md](10-AI-CHAT-SYSTEM.md)
