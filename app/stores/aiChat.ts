import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useFirebaseAi } from '~/composables/useFirebaseAi';
import { useRequestLayoutStore } from '~/stores/requestLayout';

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

  function buildContextualMessage(userMessage: string): string {
    const layoutStore = useRequestLayoutStore();
    if (!layoutStore.active || layoutStore.blocks.length === 0) {
      return userMessage;
    }
    const numbered = layoutStore.blocks
      .map((b, i) => `${i + 1}. ${b.label}`)
      .join(', ');
    return `[Current screen layout, top to bottom: ${numbered}]\n${userMessage}`;
  }

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isProcessing.value) return;

    const userText = content.trim();
    addMessage('user', userText);
    setInputText('');
    setProcessing(true);

    const contextualMessage = buildContextualMessage(userText);
    const assistantMessageId = addMessage('assistant', '');
    const firebaseAi = useFirebaseAi();

    try {
      const fullText = await firebaseAi.streamMessage(
        contextualMessage,
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
