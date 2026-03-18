import { computed, type ComputedRef } from 'vue';
import { useAiChatStore, type AiMessage } from '~/stores/aiChat';

export interface UseAiChatReturn {
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

/**
 * Composable for AI chat functionality
 * Provides abstraction layer between components and aiChat store
 * Follows the established pattern: Component → Composable → Store
 */
export function useAiChat(): UseAiChatReturn {
  const store = useAiChatStore();

  // Computed refs for reactive access
  const messages = computed(() => store.messages);
  const isProcessing = computed(() => store.isProcessing);
  const inputText = computed(() => store.inputText);
  const hasMessages = computed(() => store.messages.length > 0);
  const messageCount = computed(() => store.messages.length);

  // Action wrappers
  const sendMessage = async (content: string): Promise<void> => {
    await store.sendMessage(content);
  };

  const cancelSend = (): void => {
    store.cancelSend();
  };

  const clearMessages = (): void => {
    store.clearMessages();
  };

  const setInputText = (text: string): void => {
    store.setInputText(text);
  };

  return {
    messages,
    isProcessing,
    inputText,
    hasMessages,
    messageCount,
    sendMessage,
    cancelSend,
    clearMessages,
    setInputText
  };
}
