import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const useAiChatStore = defineStore('aiChat', () => {
  // State
  const messages = ref<AiMessage[]>([]);
  const isProcessing = ref(false);
  const inputText = ref('');

  // Actions
  const addMessage = (role: 'user' | 'assistant', content: string): void => {
    const message: AiMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      role,
      content,
      timestamp: Date.now()
    };
    messages.value = [...messages.value, message];
  };

  const clearMessages = (): void => {
    messages.value = [];
  };

  const setProcessing = (processing: boolean): void => {
    isProcessing.value = processing;
  };

  const setInputText = (text: string): void => {
    inputText.value = text;
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isProcessing.value) return;

    // Add user message
    addMessage('user', content.trim());
    setInputText('');
    setProcessing(true);

    // Simulate AI response (replace with actual API call in production)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addMessage('assistant', `I received your message: "${content.trim()}". This is a placeholder response. Connect to an AI service for real functionality.`);
    } catch (error) {
      addMessage('assistant', 'Sorry, I encountered an error processing your request.');
    } finally {
      setProcessing(false);
    }
  };

  return {
    messages,
    isProcessing,
    inputText,
    addMessage,
    clearMessages,
    setProcessing,
    setInputText,
    sendMessage
  };
});
