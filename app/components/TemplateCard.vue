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
.template-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  background: #fff;
  border-color: #1e3a8a;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.1);
  transform: translateY(-2px);
}

.template-info {
  margin-bottom: 10px;
}

.template-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.template-description {
  margin: 0 0 8px 0;
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
}

.template-blocks {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-count {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.template-preview {
  display: flex;
  gap: 4px;
  align-items: center;
}

.preview-block {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
}

.preview-more {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  padding: 4px 8px;
  background: #e2e8f0;
  border-radius: 4px;
}
</style>
