<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="handleClose">
      <div
        class="modal-container show-modal"
        :aria-busy="loading"
        role="dialog"
        aria-modal="true"
        aria-labelledby="show-modal-title"
      >
        <!-- Header -->
        <div class="modal-header">
          <div class="show-modal__info">
            <span class="text-label">{{ template?.industry }}</span>
            <h2 id="show-modal-title" class="text-title">{{ template?.name }}</h2>
          </div>
          <div class="show-modal__actions">
            <div class="toggle-group">
              <button
                type="button"
                class="toggle-group__btn"
                :class="{ 'toggle-group__btn--active': viewMode === 'desktop' }"
                :disabled="loading"
                @click="viewMode = 'desktop'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                Desktop
              </button>
              <button
                type="button"
                class="toggle-group__btn"
                :class="{ 'toggle-group__btn--active': viewMode === 'mobile' }"
                :disabled="loading"
                @click="viewMode = 'mobile'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                Mobile
              </button>
            </div>
            <button
              type="button"
              class="modal-close"
              :disabled="loading"
              title="Close"
              aria-label="Close preview"
              @click="handleClose"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body - Device Frame -->
        <div class="modal-body show-modal__body" ref="contentRef">
          <div
            v-if="loading"
            class="show-modal__loading"
            role="status"
            aria-live="polite"
            aria-label="Preparing your request"
          >
            <span class="show-modal__spinner" aria-hidden="true"></span>
            <span class="show-modal__loading-text">Preparing your request…</span>
          </div>
          <div class="show-modal__device">
            <div 
              v-if="viewMode === 'desktop'" 
              class="device-frame device-frame--desktop"
              :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
            >
              <div class="screen-content" ref="desktopContentRef">
                <ShowcaseRenderer 
                  v-if="template" 
                  :template="template" 
                  view-mode="desktop"
                />
              </div>
            </div>

            <div 
              v-else 
              class="device-frame device-frame--mobile"
              :style="{ transform: `scale(${mobileScale})`, transformOrigin: 'top center' }"
            >
              <div class="screen-content" ref="mobileContentRef">
                <ShowcaseRenderer 
                  v-if="template" 
                  :template="template" 
                  view-mode="mobile"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <p class="text-muted text-clamp-2">{{ template?.description }}</p>
          <div class="show-modal__footer-actions">
            <button
              type="button"
              class="btn btn--secondary"
              :disabled="loading"
              @click="handleClose"
            >
              Close Preview
            </button>
            <button
              type="button"
              class="btn btn--primary"
              :disabled="loading"
              @click="handleChoose"
            >
              Choose This Design
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import ShowcaseRenderer from '~/components/showcase/ShowcaseRenderer.vue';

interface ShowcaseModalProps {
  template: ShowcaseTemplate | null;
  /** When true, shows in-modal loading state and disables actions. */
  loading?: boolean;
}

interface ShowcaseModalEmits {
  close: [];
  choose: [templateId: string];
}

const props = withDefaults(defineProps<ShowcaseModalProps>(), { loading: false });
const emit = defineEmits<ShowcaseModalEmits>();

// State
const viewMode = ref<'desktop' | 'mobile'>('desktop');
const contentRef = ref<HTMLElement | null>(null);
const desktopContentRef = ref<HTMLElement | null>(null);
const mobileContentRef = ref<HTMLElement | null>(null);

// Natural frame dimensions (matching ScreenCard from the builder)
const DESKTOP_NATURAL_WIDTH = 700;
const DESKTOP_NATURAL_HEIGHT = 550;
const MOBILE_NATURAL_WIDTH = 330;
const MOBILE_NATURAL_HEIGHT = 600;

// Scaling
const scale = ref(1);
const mobileScale = ref(1);

const calculateScale = () => {
  if (!contentRef.value) return;

  const isNarrowViewport = window.matchMedia('(max-width: 900px)').matches;
  const horizontalPadding = isNarrowViewport ? 24 : 80;
  const verticalPadding = isNarrowViewport ? 24 : 60;
  const containerWidth = Math.max(0, contentRef.value.clientWidth - horizontalPadding);
  const containerHeight = Math.max(0, contentRef.value.clientHeight - verticalPadding);

  // Desktop scale
  const desktopWidthScale = containerWidth / DESKTOP_NATURAL_WIDTH;
  const desktopHeightScale = containerHeight / (DESKTOP_NATURAL_HEIGHT + 60); // Include stand
  scale.value = Math.max(0.25, Math.min(1, desktopWidthScale, desktopHeightScale));

  // Mobile scale
  const mobileWidthScale = containerWidth / MOBILE_NATURAL_WIDTH;
  const mobileHeightScale = containerHeight / MOBILE_NATURAL_HEIGHT;
  mobileScale.value = Math.max(0.25, Math.min(1, mobileWidthScale, mobileHeightScale));
};

// Handlers
const handleClose = () => {
  emit('close');
};

const handleChoose = () => {
  if (props.loading || !props.template) return;
  emit('choose', props.template.id);
};

// Keyboard handling (do not close while loading)
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !props.loading) {
    handleClose();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  // Calculate initial scale after DOM settles
  requestAnimationFrame(() => {
    calculateScale();
  });
  window.addEventListener('resize', calculateScale);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', calculateScale);
  document.body.style.overflow = '';
});

// Recalculate on view mode change
watch(viewMode, () => {
  requestAnimationFrame(() => {
    calculateScale();
  });
});
</script>

<style src="~/assets/css/components.css"></style>
<style scoped>
/**
 * ShowcaseModal - Component-specific styles only
 * 
 * Shared styles (buttons, modal, device-frames, toggle-group) 
 * are imported from components.css
 */

/* Modal sizing for this specific use case */
.show-modal {
  max-width: min(1200px, calc(100vw - (2 * var(--space-lg))));
  height: min(900px, calc(100dvh - var(--space-2xl)));
}

/* Header layout */
.show-modal__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.show-modal__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Body - device preview area */
.show-modal__body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: var(--color-bg-subtle);
  overflow: auto;
}

/* Loading overlay: does not change modal size; sits over body */
.show-modal__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  background: var(--color-bg);
  z-index: 1;
}

.show-modal__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: show-modal-spin 0.7s linear infinite;
}

.show-modal__loading-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

@keyframes show-modal-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .show-modal__spinner {
    animation: none;
    border-top-color: var(--color-primary);
    border-right-color: var(--color-primary);
  }
}

.show-modal__device {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
}

/* Footer actions */
.show-modal__footer-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .modal-overlay {
    padding: 0;
  }

  .show-modal {
    max-width: 100%;
    max-height: 100dvh;
    height: 100dvh;
    border-radius: 0;
  }

  .modal-header {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: var(--space-md);
  }

  .show-modal__actions {
    width: 100%;
    justify-content: space-between;
  }

  .toggle-group {
    flex: 1;
  }

  .toggle-group__btn {
    flex: 1;
    justify-content: center;
  }

  .show-modal__body {
    align-items: flex-start;
    padding: var(--space-md);
  }

  .show-modal__device {
    align-items: flex-start;
    min-height: 100%;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: var(--space-md);
  }

  .show-modal__footer-actions {
    justify-content: stretch;
    width: 100%;
  }

  .show-modal__footer-actions .btn {
    flex: 1;
  }
}
</style>
