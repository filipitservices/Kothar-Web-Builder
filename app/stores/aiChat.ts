import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useFirebaseAi } from '~/composables/useFirebaseAi';

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
  const addMessage = (role: 'user' | 'assistant', content: string): string => {
    const id = `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const message: AiMessage = {
      id,
      role,
      content,
      timestamp: Date.now()
    };
    messages.value = [...messages.value, message];
    return id;
  };

  const updateAssistantMessage = (messageId: string, content: string): void => {
    messages.value = messages.value.map((m) =>
      m.id === messageId ? { ...m, content } : m
    );
  };

  const clearMessages = (): void => {
    messages.value = [];
    useFirebaseAi().resetChat();
  };

  const setProcessing = (processing: boolean): void => {
    isProcessing.value = processing;
  };

  const setInputText = (text: string): void => {
    inputText.value = text;
  };

  const cancelSend = (): void => {
    useFirebaseAi().cancelRequest();
    setProcessing(false);
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isProcessing.value) return;

    addMessage('user', content.trim());
    setInputText('');
    setProcessing(true);

    const assistantMessageId = addMessage('assistant', '');
    const firebaseAi = useFirebaseAi();

    try {
      const fullText = await firebaseAi.streamMessage(
        content.trim(),
        (chunk) => {
          const current = messages.value.find((m) => m.id === assistantMessageId);
          const nextContent = (current?.content ?? '') + chunk;
          updateAssistantMessage(assistantMessageId, nextContent);
        }
      );

      if (fullText) {
        updateAssistantMessage(assistantMessageId, fullText);
      } else {
        messages.value = messages.value.filter((m) => m.id !== assistantMessageId);
      }
    } catch {
      updateAssistantMessage(
        assistantMessageId,
        'Sorry, I encountered an error. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return {
    messages,
    isProcessing,
    inputText,
    addMessage,
    updateAssistantMessage,
    clearMessages,
    setProcessing,
    setInputText,
    cancelSend,
    sendMessage
  };
});
