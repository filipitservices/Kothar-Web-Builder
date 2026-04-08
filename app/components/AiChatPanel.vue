<template>
  <div
    class="ai-chat-panel"
    :class="{ 'minimized': isMinimized }"
    role="complementary"
    aria-label="Website Builder AI Assistant"
  >
    <div class="chat-header" @click="toggleMinimized">
      <span class="chat-icon">🤖</span>
      <span class="chat-title">AI Assistant</span>
      <div class="header-actions">
        <button 
          v-if="hasMessages && !isMinimized" 
          class="header-btn clear-btn" 
          @click="clearMessages"
          title="Clear chat history"
        >
          ✕
        </button>
        <button 
          class="header-btn minimize-btn" 
          :title="isMinimized ? 'Expand chat' : 'Minimize chat'"
        >
          {{ isMinimized ? '▲' : '▼' }}
        </button>
      </div>
    </div>
    
    <div v-if="!isMinimized" class="chat-body">
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-if="!hasMessages" 
          class="empty-state"
        >
          <p>Ask me anything about your website design!</p>
        </div>
        
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="`message-${message.role}`"
        >
          <div class="message-content">
            <template v-if="message.role === 'assistant' && !message.content && isProcessing">
              <span class="typing-indicator">
                <span></span><span></span><span></span>
              </span>
            </template>
            <template v-else>{{ message.content }}</template>
          </div>
        </div>
      </div>
      
      <div class="chat-input-wrapper">
        <input
          v-model="localInputText"
          type="text"
          class="chat-input"
          placeholder="Type your message..."
          @keydown.enter="handleSend"
          :disabled="isProcessing"
        />
        <button
          v-if="isProcessing"
          class="cancel-btn"
          @click="cancelSend"
          title="Cancel"
        >
          ✕
        </button>
        <button 
          class="send-btn" 
          @click="handleSend"
          :disabled="!localInputText.trim() || isProcessing"
          title="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useAiChat } from '~/composables/useAiChat';

const {
  messages,
  isProcessing,
  inputText,
  hasMessages,
  sendMessage,
  cancelSend,
  clearMessages,
  setInputText
} = useAiChat();

const messagesContainer = ref<HTMLElement | null>(null);
const localInputText = ref('');
const isMinimized = ref(true);

const toggleMinimized = () => {
  isMinimized.value = !isMinimized.value;
};

// Sync local input with store
watch(inputText, (newVal) => {
  localInputText.value = newVal;
});

watch(localInputText, (newVal) => {
  setInputText(newVal);
});

const handleSend = async () => {
  if (!localInputText.value.trim() || isProcessing.value) return;
  
  await sendMessage(localInputText.value);
  localInputText.value = '';
  
  // Scroll to bottom after message is added
  await nextTick();
  scrollToBottom();
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Auto-scroll when new messages arrive
watch(messages, async () => {
  await nextTick();
  scrollToBottom();
}, { deep: true });
</script>

<style scoped>
.ai-chat-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  pointer-events: auto;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  height: 350px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  transition: height 0.3s ease;
}

.ai-chat-panel.minimized {
  height: 44px;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary-tint);
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.chat-icon {
  font-size: 16px;
  line-height: 1;
}

.chat-title {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: var(--radius-sm);
  align-items: center;
}

.header-btn {
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-white);
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: var(--space-xs) var(--space-sm);
  transition: all 0.2s ease;
  line-height: 1;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.minimize-btn {
  font-size: 12px;
}

.chat-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-height: 0;
  background: var(--color-bg-muted);
}

.chat-messages::-webkit-scrollbar {
  width: var(--radius-sm);
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--color-border-hover);
  border-radius: var(--radius-sm);
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--color-text-muted);
  font-size: 12px;
  text-align: center;
  font-style: italic;
}

.empty-state p {
  margin: 0;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  align-self: flex-end;
}

.message-assistant {
  align-self: flex-start;
}

.message-content {
  padding: var(--space-sm) var(--space-md);
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-user .message-content {
  background: var(--color-primary);
  color: var(--color-white);
  border-bottom-right-radius: var(--radius-sm);
}

.message-assistant .message-content {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: var(--radius-sm);
}

.message.processing .message-content {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.typing-indicator {
  display: inline-flex;
  gap: var(--space-xs);
  align-items: center;
  padding: 2px 0;
}

.typing-indicator span {
  width: var(--radius-sm);
  height: var(--radius-sm);
  border-radius: 50%;
  background: var(--color-text-muted);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}

.chat-input-wrapper {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--color-text);
  background: var(--color-bg-muted);
  transition: all 0.2s ease;
  outline: none;
  min-width: 0;
}

.chat-input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: var(--focus-ring-primary);
}

.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-input::placeholder {
  color: var(--color-placeholder);
}

.cancel-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.cancel-btn:hover {
  background: var(--color-border-hover);
  color: var(--color-text);
}

.send-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.send-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: var(--focus-ring-primary);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--color-text-muted);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ai-chat-panel {
    height: 200px;
  }

  .ai-chat-panel.minimized {
    height: 44px;
  }

  .chat-messages {
    padding: var(--space-sm);
  }

  .message-content {
    font-size: 11px;
    padding: var(--radius-sm) var(--space-sm);
  }
}
</style>
