/**
 * Firebase AI Logic composable
 *
 * Owns Firebase AI initialization, model creation, and chat session.
 * Single place for system instruction, model config, and chat lifecycle.
 *
 * Architecture: Logic layer — used by aiChat store via useAiChat orchestration.
 * No direct Firebase imports in components; composable is the abstraction.
 *
 * @see docs/19-FIREBASE-AI-LOGIC-CHAT.md
 */

import { ref, type Ref } from 'vue';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { getFirebaseApp } from '~/plugins/firebase.client';
import { logger } from '~/utils/logger';

const SYSTEM_INSTRUCTION = `You are the Small Business Website Assistant: a content strategist, concise copywriter, SEO advisor, and UX-aware design consultant for small and mid-size business websites. Stay focused on website content, structure, and user experience. Do not use emojis. Do not use markdown.`;

const MODEL_NAME = 'gemini-2.5-flash';

export interface UseFirebaseAiReturn {
  sendMessage: (content: string, options?: { signal?: AbortSignal }) => Promise<string>;
  streamMessage: (
    content: string,
    onChunk: (chunk: string) => void,
    options?: { signal?: AbortSignal }
  ) => Promise<string>;
  cancelRequest: () => void;
  isReady: Ref<boolean>;
  resetChat: () => void;
}

let chatSession: ReturnType<ReturnType<typeof getGenerativeModel>['startChat']> | null = null;
let currentAbortController: AbortController | null = null;

function createChatSession() {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: MODEL_NAME,
    systemInstruction: SYSTEM_INSTRUCTION
  });
  return model.startChat();
}

function getOrCreateChat() {
  if (!chatSession) {
    chatSession = createChatSession();
  }
  return chatSession;
}

export function useFirebaseAi(): UseFirebaseAiReturn {
  const isReady = ref(false);

  function ensureReady(): void {
    if (import.meta.server) return;
    const app = getFirebaseApp();
    if (app && !isReady.value) {
      isReady.value = true;
    }
  }

  function resetChat(): void {
    chatSession = null;
  }

  function cancelRequest(): void {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  }

  async function sendMessage(
    content: string,
    options?: { signal?: AbortSignal }
  ): Promise<string> {
    if (import.meta.server) {
      return 'AI chat is only available in the browser.';
    }
    ensureReady();
    const app = getFirebaseApp();
    if (!app) {
      logger.error('[Firebase AI] App not initialized');
      return 'Firebase is not configured. Please check your setup.';
    }

    currentAbortController = options?.signal ? null : new AbortController();
    const signal = options?.signal ?? currentAbortController?.signal;

    try {
      const chat = getOrCreateChat();
      const result = await chat.sendMessage(content, { signal });
      const text = result.response?.text?.() ?? '';
      return text || 'I could not generate a response. Please try again.';
    } catch (err) {
      const error = err as Error & { name?: string };
      if (error.name === 'AbortError') {
        return '';
      }
      logger.error('[Firebase AI] sendMessage failed:', error);
      return 'Sorry, I encountered an error. Please try again.';
    } finally {
      if (currentAbortController && !options?.signal) {
        currentAbortController = null;
      }
    }
  }

  async function streamMessage(
    content: string,
    onChunk: (chunk: string) => void,
    options?: { signal?: AbortSignal }
  ): Promise<string> {
    if (import.meta.server) {
      return 'AI chat is only available in the browser.';
    }
    ensureReady();
    const app = getFirebaseApp();
    if (!app) {
      logger.error('[Firebase AI] App not initialized');
      return 'Firebase is not configured. Please check your setup.';
    }

    currentAbortController = options?.signal ? null : new AbortController();
    const signal = options?.signal ?? currentAbortController?.signal;

    let fullText = '';
    try {
      const chat = getOrCreateChat();
      const result = await chat.sendMessageStream(content, { signal });
      for await (const chunk of result.stream) {
        const chunkText = chunk.text?.() ?? '';
        if (chunkText) {
          fullText += chunkText;
          onChunk(chunkText);
        }
      }
      return fullText || 'I could not generate a response. Please try again.';
    } catch (err) {
      const error = err as Error & { name?: string };
      if (error.name === 'AbortError') {
        return fullText;
      }
      logger.error('[Firebase AI] streamMessage failed:', error);
      if (!fullText) {
        return 'Sorry, I encountered an error. Please try again.';
      }
      return fullText;
    } finally {
      if (currentAbortController && !options?.signal) {
        currentAbortController = null;
      }
    }
  }

  return {
    sendMessage,
    streamMessage,
    cancelRequest,
    isReady,
    resetChat
  };
}
