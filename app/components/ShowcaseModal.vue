<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="handleClose">
      <div class="modal-container showcase-modal">
        <!-- Header -->
        <div class="modal-header">
          <div class="showcase-modal__header-info">
            <span class="text-label">{{ template?.industry }}</span>
            <h2 class="text-title">{{ template?.name }}</h2>
          </div>
          <div class="showcase-modal__header-actions">
            <div class="toggle-group">
              <button 
                class="toggle-group__btn" 
                :class="{ 'toggle-group__btn--active': viewMode === 'desktop' }"
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
                class="toggle-group__btn"
                :class="{ 'toggle-group__btn--active': viewMode === 'mobile' }"
                @click="viewMode = 'mobile'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                Mobile
              </button>
            </div>
            <button class="modal-close" @click="handleClose" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body - Device Frame -->
        <div class="modal-body showcase-modal__body" ref="contentRef">
          <div class="showcase-modal__device-container">
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
          <div class="showcase-modal__footer-actions">
            <button class="btn btn--secondary" @click="handleClose">
              Close Preview
            </button>
            <button class="btn btn--primary" @click="handleChoose">
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
}

interface ShowcaseModalEmits {
  close: [];
  choose: [templateId: string];
}

const props = defineProps<ShowcaseModalProps>();
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
  
  const containerWidth = contentRef.value.clientWidth - 80; // Padding
  const containerHeight = contentRef.value.clientHeight - 60; // Padding
  
  // Desktop scale
  const desktopWidthScale = containerWidth / DESKTOP_NATURAL_WIDTH;
  const desktopHeightScale = containerHeight / (DESKTOP_NATURAL_HEIGHT + 60); // Include stand
  scale.value = Math.min(1, desktopWidthScale, desktopHeightScale);
  
  // Mobile scale
  const mobileWidthScale = containerWidth / MOBILE_NATURAL_WIDTH;
  const mobileHeightScale = containerHeight / MOBILE_NATURAL_HEIGHT;
  mobileScale.value = Math.min(1, mobileWidthScale, mobileHeightScale);
};

// Handlers
const handleClose = () => {
  emit('close');
};

const handleChoose = () => {
  if (props.template) {
    emit('choose', props.template.id);
  }
};

// Keyboard handling
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
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
.showcase-modal {
  max-width: var(--container-max);
  height: calc(100vh - var(--space-3xl));
  max-height: 900px;
}

/* Header layout */
.showcase-modal__header-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.showcase-modal__header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Body - device preview area */
.showcase-modal__body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  background: #f3f4f6;
  overflow: hidden;
}

.showcase-modal__device-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Footer actions */
.showcase-modal__footer-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .showcase-modal {
    max-width: none;
    max-height: none;
    height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .showcase-modal__footer-actions {
    justify-content: stretch;
  }

  .showcase-modal__footer-actions .btn {
    flex: 1;
  }
}
</style>
