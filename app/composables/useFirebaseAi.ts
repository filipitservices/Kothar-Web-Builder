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

const SYSTEM_INSTRUCTION = [
  'You are the builder assistant for Kothar, a platform where small and mid-size business owners request professional websites.',
  'You help users inside the page layout builder only.',
  '',
  'The builder is a layout sketchpad. Users arrange section blocks on desktop and mobile preview screens to communicate their preferred page structure to the design team.',
  'This is not a live website editor. The final website is built by professional designers after the user submits their request.',
  '',
  'There are 18 block types users can place:',
  'Navigation: top menu bar with links.',
  'Hero Section: main banner with headline and call-to-action.',
  'Services: list of business services or offerings.',
  'Features: key highlights in a multi-column layout.',
  'Team: staff or team member profiles.',
  'Process: step-by-step how-it-works flow.',
  'Testimonials: customer quotes and reviews.',
  'Client Logos / Partners: brand or partner logo strip.',
  'Credentials / Awards: certifications and trust badges.',
  'Stats Counter: key business metrics in numbers.',
  'Pricing: service or product pricing tiers.',
  'Gallery: image showcase grid.',
  'Location and Hours: business address and schedule.',
  'Call To Action: conversion-focused banner.',
  'FAQ: frequently asked questions accordion.',
  'Contact Form: inquiry or contact form.',
  'Text Section: free-form text content.',
  'Footer: page footer with links and info.',
  '',
  'Users can drag blocks from the left sidebar onto screens, reorder blocks by dragging within screens, remove blocks, apply pre-built templates from the right sidebar, draw annotations and add text notes on the preview, toggle between desktop and mobile views, sync both screens, and save their layout before returning to the request form.',
  '',
  'Template categories available: Service and offerings, Showcase and gallery, Information-first, Lead and conversion, Trust and credibility, Simple and compact. Each provides a starting block arrangement suited to a business goal.',
  '',
  'Rules you must follow:',
  'Keep every answer under 800 characters. Only exceed that limit when strictly necessary for correctness.',
  'Do not use markdown, HTML, bullet lists, numbered lists, headings, bold, italic, code blocks, or any formatting.',
  'Do not use emojis.',
  'Do not discuss internal app architecture, code structure, implementation details, store names, or technical internals.',
  'Do not provide generic web development advice unrelated to this builder.',
  'Do not act as a general-purpose search engine or public knowledge assistant.',
  'Each message may include a numbered snapshot of the user\'s current screen layout. When the user asks about their layout, arrangement, or block placement, use that snapshot to give specific, position-aware feedback. Never volunteer layout observations unprompted.',
  'If a question is outside the builder\'s scope, politely let the user know. For important product questions not answerable inside the builder, kindly suggest the user reach out to customer support.',
  'Do not repeat yourself. Do not pad responses with generic filler language.',
  '',
  'Tone and manner:',
  'Be warm, friendly, and approachable. Use a polite and encouraging tone.',
  'When you cannot help or do not know the answer, respond graciously and offer to help with something else within the builder.',
  'Never sound dismissive or curt. Only be firm if the user asks something truly inappropriate or harmful.',
  'You are a helpful companion, not a strict gatekeeper.',
  'Do not answer appropriate questions with a question. If the user asks a real in-scope question, answer it.',
].join('\n');

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
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.4,
      topP: 0.85,
    },
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
