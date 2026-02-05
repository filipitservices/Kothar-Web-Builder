<template>
  <div class="ai-chat-panel" :class="{ 'minimized': isMinimized }">
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
          <div class="message-content">{{ message.content }}</div>
        </div>
        
        <div v-if="isProcessing" class="message message-assistant processing">
          <div class="message-content">
            <span class="typing-indicator">
              <span></span><span></span><span></span>
            </span>
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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 160px;
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
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: #ffffff;
  border-bottom: 1px solid #1e3a8a;
  flex-shrink: 0;
  cursor: pointer;
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
  gap: 6px;
  align-items: center;
}

.header-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: 4px 8px;
  transition: all 0.2s ease;
  line-height: 1;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  background: #f8fafc;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #64748b;
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
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-user .message-content {
  background: #1e3a8a;
  color: #ffffff;
  border-bottom-right-radius: 3px;
}

.message-assistant .message-content {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 3px;
}

.message.processing .message-content {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.typing-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
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
  gap: 8px;
  padding: 10px 12px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d6dee9;
  border-radius: 8px;
  font-size: 12px;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s ease;
  outline: none;
  min-width: 0;
}

.chat-input:focus {
  border-color: #1e3a8a;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-input::placeholder {
  color: #94a3b8;
}

.send-btn {
  padding: 8px 14px;
  background: #1e3a8a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
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
  background: #1e40af;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #94a3b8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ai-chat-panel {
    height: 140px;
  }
  
  .ai-chat-panel.minimized {
    height: 44px;
  }
  
  .chat-messages {
    padding: 8px;
  }
  
  .message-content {
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>
