# AI Chat System Documentation

**Complete guide to the AI chat assistant feature: architecture, layout integration, interaction model, and extensibility.**

---

## Overview

The AI Chat System provides an integrated conversational assistant within the SOSG editor. Users can interact with an AI chatbot to receive help with website design, content suggestions, and general assistance while building their sites.

### Key Features

- **Real-time messaging interface** with user/assistant message distinction
- **Minimizable panel** that collapses to header-only (44px) when not in use
- **Smooth transitions** with 0.3s ease animation between states
- **Non-intrusive layout placement** below drawing controls
- **State persistence** via Pinia store architecture
- **Type-safe implementation** following project TypeScript conventions
- **Reactive UI** with auto-scrolling and visual feedback
- **Extensible design** ready for AI service integration

---

## Architecture

The AI Chat System follows the established three-layer architecture pattern used throughout SOSG:

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION LAYER                 │
│           AiChatPanel.vue Component             │
│  - Message list rendering                       │
│  - Input field and send button                  │
│  - Visual state indicators                      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│                LOGIC LAYER                      │
│          useAiChat() Composable                 │
│  - Store abstraction                            │
│  - Computed reactive properties                 │
│  - Action wrappers                              │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│                DATA LAYER                       │
│            useAiChatStore (Pinia)               │
│  - Message state management                     │
│  - Processing state tracking                    │
│  - Message persistence                          │
└─────────────────────────────────────────────────┘
```

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
index.vue (Main Page)
  └─ ScreensPanel.vue
       ├─ ScreensInner (flex: 1, scrollable)
       │    ├─ DesktopScreen
       │    └─ MobileScreen
       ├─ DrawingControlsPanel (fixed height)
       └─ AiChatPanel (fixed height: 160px)
```

### Scaling System Integration

The AI Chat Panel integrates with the existing `useScreenScaling` composable:

**Enhanced Scaling Logic**:
- Original: Calculated scale based on width constraints only
- Updated: Calculates scale based on BOTH width and height constraints
- Height calculation: Measures panel height, subtracts DrawingControls + AiChat heights + gaps
- Scale selection: Uses minimum of width scale and height scale (most restrictive wins)
- Result: Screens never get cut off vertically, always fit in available space

**Dynamic Recalculation**:
- ResizeObserver monitors panel, DrawingControls, and AiChat dimensions
- MutationObserver detects when panels are added/removed
- Debounced resize handler prevents excessive recalculations
- Automatic scaling on window resize and element dimension changes

**Layout Modes**:
- Side-by-side (≥1100px): Shared scale based on combined width and max height
- Stacked (<1100px): Independent width scales, shared height scale for both screens

The AI Chat Panel is positioned:
- **Vertically**: Below `DrawingControlsPanel`, at the bottom of `ScreensPanel`
- **Horizontally**: Full width of the screens container
- **Z-index**: Standard stacking (no overlay)
- **Flex behavior**: Fixed height (160px), does not compress screens

### Layout Safety

The implementation preserves proper vertical space distribution through intelligent scaling:

1. **ScreensPanel** uses `flex-direction: column` with `gap: 12px`
2. **ScreensInner** has `flex: 1` and `overflow: auto` for scrollable screen area
3. **DrawingControlsPanel** and **AiChatPanel** have fixed heights (`flex-shrink: 0`)
4. Container uses `min-height: 0` to enable proper flex overflow behavior
5. **useScreenScaling composable** dynamically calculates available vertical space:
   - Measures total panel height
   - Subtracts consumed height from fixed panels (DrawingControls + AiChat)
   - Accounts for gaps between elements
   - Calculates scale factors based on BOTH width AND height constraints
   - Uses the more restrictive constraint to prevent visual cutoff

**Result**: Adding the chat panel reduces available screen space proportionally without clipping or breaking the simulation screens. The screens automatically scale down to fit the remaining vertical space while maintaining proper aspect ratios. The screens container remains scrollable if needed.

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
- Height: `160px` (responsive: `140px` on mobile)
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

**`addMessage(role: 'user' | 'assistant', content: string): void`**

Adds a new message to the chat history.

```typescript
const store = useAiChatStore();
store.addMessage('user', 'Hello!');
```

**`clearMessages(): void`**

Removes all messages from history.

**`setProcessing(processing: boolean): void`**

Updates the processing state (for loading indicators).

**`setInputText(text: string): void`**

Updates the input field value.

**`sendMessage(content: string): Promise<void>`**

Complete flow: validates input, adds user message, triggers AI response, updates state.

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
Typing indicator appears
      ↓
AI response generated (currently simulated, 1s delay)
      ↓
Assistant message added to chat (role: 'assistant')
      ↓
Processing state set to false
      ↓
Chat scrolls to bottom
      ↓
Use

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
```r can send next message
```

### Visual Feedback

- **User messages**: Right-aligned, blue background (`#1e3a8a`), white text
- **Assistant messages**: Left-aligned, white background, bordered
- **Processing state**: Gray bubble with animated typing dots
- **Empty state**: Centered italic prompt text
- **Disabled input**: Opacity reduced, cursor not-allowed

---

## Styling System

### Design Tokens (Consistent with Project)

**Colors**:
- Primary blue: `#1e3a8a` (brand color, header, user messages)
- Light gray: `#f8fafc` (backgrounds, disabled states)
- Border gray: `#e2e8f0` (borders, dividers)
- Text dark: `#0f172a` (primary text)
- Text muted: `#64748b` (placeholder, empty state)

**Spacing**:
- Panel padding: `12px` (header), `10px` (input area)
- Gap between elements: `8px` (standard), `12px` (panel-level)
- Border radius: `12px` (panel), `8px` (inputs), `10px` (messages)

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
- Panel height: `140px` (reduced from `160px`)
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

### Connecting to Real AI Services

The current implementation uses a placeholder response system. To integrate a real AI service:

1. **Update `sendMessage()` in [stores/aiChat.ts](../app/stores/aiChat.ts)**:

```typescript
const sendMessage = async (content: string): Promise<void> => {
  if (!content.trim() || isProcessing.value) return;

  addMessage('user', content.trim());
  setInputText('');
  setProcessing(true);

  try {
    // Replace with actual API call
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content })
    });
    
    const data = await response.json();
    addMessage('assistant', data.reply);
  } catch (error) {
    console.error('AI chat error:', error);
    addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
  } finally {
    setProcessing(false);
  }
};
```

2. **Create API endpoint** (e.g., `server/api/ai-chat.ts`):

```typescript
export default defineEventHandler(async (event) => {
  const { message } = await readBody(event);
  
  // Call OpenAI, Claude, or other AI service
  const reply = await callAiService(message);
  
  return { reply };
});
```

### Adding Context Awareness

To make the AI aware of the current editor state:

```typescript
import { useBusinessStore } from '~/stores/business';
import { useBlocksStore } from '~/stores/blocks';

const sendMessage = async (content: string): Promise<void> => {
  const businessData = useBusinessStore().getBusinessInfo();
  const blocksData = useBlocksStore().screens;
  
  const contextualMessage = {
    userMessage: content,
    context: {
      business: businessData,
      blocks: blocksData
    }
  };
  
  // Send contextualMessage to AI service
};
```

### Streaming Responses

For real-time AI responses (token-by-token):

```typescript
const sendMessage = async (content: string): Promise<void> => {
  // ... add user message ...
  
  const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const assistantMessage: AiMessage = {
    id: assistantMessageId,
    role: 'assistant',
    content: '',
    timestamp: Date.now()
  };
  
  messages.value = [...messages.value, assistantMessage];
  
  const response = await fetch('/api/ai-chat-stream', {
    method: 'POST',
    body: JSON.stringify({ message: content })
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Update message content incrementally
    const index = messages.value.findIndex(m => m.id === assistantMessageId);
    messages.value[index].content += chunk;
  }
  
  setProcessing(false);
};
```

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

const messages = useLocalStorage<AiMessage[]>('sosg-ai-chat-history', []);

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

### Planned Features

1. **Context-Aware Responses**: AI suggestions based on current blocks and business data
2. **Quick Actions**: Buttons to apply AI suggestions (e.g., "Add this block")
3. **Voice Input**: Speech-to-text for message composition
4. **Message History Search**: Filter and search past conversations
5. **Multi-Turn Context**: AI remembers previous messages in conversation
6. **Code Snippets**: Syntax-highlighted code blocks in assistant responses
7. **Attachment Support**: Upload images or files for AI analysis
8. **Chat Export**: Download conversation as text or PDF

### Integration Opportunities

- **Template Suggestions**: AI recommends templates based on business type
- **Content Generation**: Generate block content from business data
- **Design Feedback**: AI critiques layout and suggests improvements
- **Accessibility Review**: AI checks for WCAG compliance issues
- **SEO Optimization**: AI provides meta tag and content recommendations

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
