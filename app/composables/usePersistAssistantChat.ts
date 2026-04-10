/**
 * Hydrates builder AI chat from the order document and debounces writes to Firestore.
 */

import { watch, onUnmounted, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { doc, updateDoc, serverTimestamp, getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebaseApp } from '~/plugins/firebase.client';
import { useAiChatStore, type AiMessage } from '~/stores/aiChat';
import type { OrderWithId } from '~/types/order';

const DEBOUNCE_MS = 600;

function messagesSnapshot(msgs: readonly AiMessage[]): string {
  return JSON.stringify(
    msgs.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    }))
  );
}

async function persistAssistantChat(
  userId: string,
  orderId: string,
  msgs: readonly AiMessage[]
): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;
  const db = getFirestore(app) as Firestore;
  const ref = doc(db, 'users', userId, 'orders', orderId);
  await updateDoc(ref, {
    assistantChatMessages: msgs.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    })),
    updatedAt: serverTimestamp()
  });
}

/**
 * Call from builder routes after the active order ref is available.
 * Hydrates chat when `order` changes; persists store messages with debounce.
 */
export function usePersistAssistantChat(
  order: Ref<OrderWithId | null>,
  userId: Ref<string | null | undefined>
): void {
  const aiChat = useAiChatStore();
  const { messages } = storeToRefs(aiChat);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastPersistedJson = '';

  function hydrateFromOrder(doc: OrderWithId): void {
    const raw = doc.assistantChatMessages;
    const next: AiMessage[] = (raw ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    }));
    aiChat.replaceMessagesFromServer(next);
    lastPersistedJson = messagesSnapshot(messages.value);
  }

  watch(
    () => order.value?.id,
    (orderId, prevOrderId) => {
      if (orderId !== prevOrderId && prevOrderId !== undefined) {
        aiChat.clearMessages();
        lastPersistedJson = messagesSnapshot(messages.value);
      }
      const doc = order.value;
      if (!doc) {
        aiChat.clearMessages();
        lastPersistedJson = messagesSnapshot(messages.value);
        return;
      }
      hydrateFromOrder(doc);
    },
    { immediate: true }
  );

  watch(
    messages,
    (msgs) => {
      const oid = order.value?.id;
      const uid = userId.value?.trim();
      if (!oid || !uid) return;

      const snap = messagesSnapshot(msgs);
      if (snap === lastPersistedJson) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        void (async () => {
          try {
            await persistAssistantChat(uid, oid, msgs);
            lastPersistedJson = messagesSnapshot(messages.value);
          } catch {
            // Non-fatal; user can retry by sending another message
          }
        })();
      }, DEBOUNCE_MS);
    },
    { deep: true }
  );

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });
}
