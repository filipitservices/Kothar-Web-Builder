<template>
  <div class="template-card" @click="$emit('click')">
    <div class="template-info">
      <h4 class="template-name">{{ template.name }}</h4>
      <p class="template-description">{{ template.description }}</p>
      <div class="template-blocks">
        <span class="block-count">{{ template.blocks.length }} blocks</span>
      </div>
    </div>
    <div class="template-preview">
      <div
        v-for="(block, index) in previewBlocks"
        :key="index"
        class="preview-block"
        :title="block.label"
      >
        <span class="block-icon">{{ getBlockIcon(block.type) }}</span>
      </div>
      <div v-if="hasMoreBlocks" class="preview-more">
        +{{ remainingBlocksCount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BLOCK_ICONS } from '~/constants/builder';
import type { Template } from '~/stores/templates';

interface TemplateCardProps {
  template: Template;
  maxPreviewBlocks?: number;
}

const props = withDefaults(defineProps<TemplateCardProps>(), {
  maxPreviewBlocks: 3
});

defineEmits<{
  click: [];
}>();

const previewBlocks = computed(() =>
  props.template.blocks.slice(0, props.maxPreviewBlocks)
);

const hasMoreBlocks = computed(() =>
  props.template.blocks.length > props.maxPreviewBlocks
);

const remainingBlocksCount = computed(() =>
  props.template.blocks.length - props.maxPreviewBlocks
);

const getBlockIcon = (blockType: string): string => {
  return BLOCK_ICONS[blockType] || '📦';
};
</script>

<style scoped>
/* Sibling language to Available Items: soft cloudy depth, green (success) family — tokens only */
.template-card {
  border-radius: var(--radius-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, opacity 0.15s ease;
  border: 1px solid
    color-mix(
      in srgb,
      var(--color-border) 72%,
      color-mix(in srgb, var(--color-success-tint) 60%, var(--color-success))
    );
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--color-text) 5%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-white) 55%, transparent),
    0 14px 28px -12px color-mix(in srgb, var(--color-success) 9%, transparent);
  background:
    radial-gradient(
      ellipse 115% 95% at 50% -8%,
      color-mix(in srgb, var(--color-success-tint) 78%, var(--color-white)) 0%,
      transparent 52%
    ),
    radial-gradient(
      95% 75% at 96% 12%,
      color-mix(in srgb, var(--color-success) 13%, var(--color-white)) 0%,
      transparent 46%
    ),
    radial-gradient(
      85% 70% at 4% 88%,
      color-mix(in srgb, var(--color-primary-tint) 38%, var(--color-white)) 0%,
      transparent 50%
    ),
    radial-gradient(
      100% 85% at 48% 52%,
      color-mix(in srgb, var(--color-success-tint) 30%, var(--color-white)) 0%,
      transparent 58%
    ),
    radial-gradient(
      110% 90% at 72% 100%,
      color-mix(in srgb, var(--color-accent-warm-tint) 16%, var(--color-white)) 0%,
      transparent 40%
    ),
    linear-gradient(
      156deg,
      var(--color-white) 0%,
      color-mix(in srgb, var(--color-success-tint) 26%, var(--color-white)) 32%,
      color-mix(in srgb, var(--color-bg-muted) 78%, var(--color-success-tint)) 72%,
      color-mix(in srgb, var(--color-success-tint) 16%, var(--color-bg-muted)) 100%
    );
}

.template-card:hover {
  border-color: color-mix(in srgb, var(--color-border-hover) 55%, var(--color-success));
  box-shadow:
    var(--focus-ring-primary),
    0 1px 2px color-mix(in srgb, var(--color-text) 5%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-white) 45%, var(--color-success-tint)),
    0 var(--space-xs) var(--space-md) color-mix(in srgb, var(--color-success) 14%, transparent),
    0 18px 36px -14px color-mix(in srgb, var(--color-success) 11%, transparent);
}

.template-info {
  margin-bottom: var(--space-sm);
}

.template-name {
  margin: 0 0 var(--space-xs) 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
}

.template-description {
  margin: 0 0 var(--space-sm) 0;
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.template-blocks {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-count {
  font-size: 0.625rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--color-text-muted) 72%, var(--color-success));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--color-primary-tint) 38%, var(--color-success-tint)) 0%,
    color-mix(in srgb, var(--color-success-tint) 55%, var(--color-white)) 100%
  );
  border: 1px solid color-mix(in srgb, var(--color-border) 58%, var(--color-success-tint));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-white) 50%, transparent);
}

.template-preview {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.preview-block {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: color-mix(in srgb, var(--color-white) 45%, var(--color-success-tint));
  border: 1px solid color-mix(in srgb, var(--color-border) 62%, var(--color-success-tint));
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-white) 55%, transparent);
}

.preview-more {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: var(--space-xs) var(--space-sm);
  background: color-mix(in srgb, var(--color-success-tint) 55%, var(--color-bg-subtle));
  border: 1px solid color-mix(in srgb, var(--color-border) 65%, var(--color-success-tint));
  border-radius: var(--radius-sm);
}
</style>
