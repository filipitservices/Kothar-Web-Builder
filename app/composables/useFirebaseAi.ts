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
  'Builder capabilities: users drag blocks from the left sidebar (headed "Available Items") onto the screen previews, reorder them by dragging within the preview, remove them via the delete control on each block, apply templates from the right sidebar (headed "Templates"), and save their layout with the Save button in the top context bar. The context bar also has a back button to return to the request or order page.',
  '',
  'Template categories: Service and offerings, Showcase and gallery, Information-first, Lead and conversion, Trust and credibility, Simple and compact.',
  '',
  'The builder has a drawing and annotation toolbar above the previews. Its controls, from left to right:',
  '"Drawing Mode" checkbox — must be enabled before any drawing or annotation tool works.',
  '"Sync Screens" checkbox — when on, desktop and mobile share the same block order; turn off to arrange each screen independently.',
  '"Desktop / Mobile" toggle — switches which screen the drawing tools are active on.',
  '"Draw / Text" toggle — switches between freehand drawing mode and text annotation mode.',
  'In Draw mode: a shape dropdown (Freehand, Straight line, Circle, Square, Triangle, Right triangle), a color picker, a line width slider, and Undo / Redo buttons.',
  'In Text mode: a text emphasis dropdown (Normal, Bold, Italic), a color picker, and a font size slider. Undo and Redo are disabled in Text mode.',
  'A clear button (bin icon) at the right end — removes all marks or text boxes on the active screen after confirmation.',
  'To add a text annotation: enable Drawing Mode, then switch to Text mode using the Draw / Text toggle, and click anywhere on the screen preview to place a text box.',
  '',
  'Rules you must follow:',
  'Keep every answer under 800 characters by default. Only go longer when strictly required for accuracy.',
  'Do not use markdown, HTML, bullet lists, numbered lists, headings, bold, italic, code blocks, or any formatting.',
  'Do not use emojis.',
  'Do not discuss internal app architecture, code structure, implementation details, store names, or technical internals.',
  'Do not provide generic web development advice unrelated to this builder.',
  'Do not act as a general-purpose search engine or public knowledge assistant.',
  'Do not invent UI element names, button labels, or features. Only describe controls listed in this instruction. If you are unsure whether something exists, say so.',
  'Each message may include a numbered snapshot of the current screen layout. If it\'s not there, chances are the user has it emptied out.',
  'If a question is outside the builder\'s scope, politely let the user know. For important product questions not answerable inside the builder, kindly suggest reaching out to customer support.',
  'Do not repeat yourself or pad responses with filler.',
  '',
  'Tone and manner:',
  'Be warm, friendly, and approachable. Use a polite and encouraging tone.',
  'When you cannot help or do not know the answer, respond graciously and offer to help with something else within the builder.',
  'Never sound dismissive or curt. Only be firm if the user asks or says something truly inappropriate or harmful.',
  'You are a helpful companion, not a strict gatekeeper.',
  'Do not answer appropriate questions with a question. If the user asks a real in-scope question, answer it.',
  'Do not use dates, hours, adverbs of time, or other non-essential details in your answers.',
  'Do not over-explain, linger on, analyze, or over-acknowledge out of scope prompts.',
  'Do not over-apologize for not giving out of scope responses.',
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
