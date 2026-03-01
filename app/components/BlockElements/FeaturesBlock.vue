<template>
  <div class="features-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="features-header">
      <div 
        class="title editable"
        :class="{ 'has-local-value': isLocalValue('title') }"
        @blur="updateField('title', $event)"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ title }}
      </div>
      <div 
        class="subtitle editable"
        :class="{ 'has-local-value': isLocalValue('subtitle') }"
        @blur="updateField('subtitle', $event)"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ subtitle }}
      </div>
    </div>

    <div class="features-grid">
      <div class="feature-item" v-for="(feature, index) in features" :key="index">
        <div class="feature-controls">
          <button 
            class="delete-btn"
            @click="removeFeature(index)"
            title="Remove this feature"
          >
            ×
          </button>
        </div>
        
        <div class="feature-icon">►</div>
        
        <div 
          class="feature-title editable"
          :class="{ 'has-local-value': feature.title !== DEFAULT_TITLE }"
          @blur="updateFeature(index, 'title', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ feature.title }}
        </div>
        
        <div 
          class="feature-text editable"
          :class="{ 'has-local-value': feature.text !== DEFAULT_TEXT }"
          @blur="updateFeature(index, 'text', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ feature.text }}
        </div>
      </div>
    </div>

    <button class="add-btn" @click="addFeature" title="Add new feature">
      + Add Feature
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface Feature {
  title: string;
  text: string;
}

const DEFAULT_TITLE = 'Feature title';
const DEFAULT_TEXT = 'Brief description of benefit.';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue } = useBlockData(props.blockId, props.screenType);

const title = computed(() => getField('title') ?? 'Key features');
const subtitle = computed(() => getField('subtitle') ?? 'Explain why customers choose you.');

const features = computed<Feature[]>(() => {
  const stored = getField('features');
  if (Array.isArray(stored) && stored.length > 0) return stored;
  
  return [
    { title: DEFAULT_TITLE, text: DEFAULT_TEXT },
    { title: DEFAULT_TITLE, text: DEFAULT_TEXT },
    { title: DEFAULT_TITLE, text: DEFAULT_TEXT }
  ];
});

const addFeature = () => {
  setField('features', [...features.value, { title: DEFAULT_TITLE, text: DEFAULT_TEXT }]);
};

const removeFeature = (index: number) => {
  if (index < 0 || index >= features.value.length || features.value.length <= 3) return;
  setField('features', features.value.filter((_, i) => i !== index));
};

const updateFeature = (index: number, field: keyof Feature, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = features.value.map((item, i) =>
    i === index ? { ...item, [field]: newValue } : item
  );
  setField('features', updated);
};

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>

<style scoped>
.features-block {
  padding: 14px;
  background: #f8fafc;
}

.features-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
}

.features-header .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.feature-item {
  padding: 10px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  position: relative;
  min-width: 0;
  width: 100%;
}

.feature-controls {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.15s ease;
  pointer-events: auto;
  z-index: 20;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.feature-icon {
  font-size: 14px;
  color: #1e3a8a;
  margin-bottom: 6px;
}

.feature-title {
  font-weight: 700;
  font-size: 12px;
  color: #334155;
  margin-bottom: 4px;
}

.feature-text {
  font-size: 11px;
  color: #64748b;
}

.add-btn {
  display: block;
  background: #dbeafe;
  border: 1px solid #7dd3fc;
  color: #0369a1;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.15s ease;
}

.add-btn:hover {
  background: #bfdbfe;
  border-color: #38bdf8;
}

.features-block.mobile-layout {
  padding: 10px;
}

.features-block.mobile-layout .features-header .title {
  font-size: 14px;
}

.features-block.mobile-layout .features-header .subtitle {
  font-size: 11px;
}

.features-block.mobile-layout .features-grid {
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}
</style>
