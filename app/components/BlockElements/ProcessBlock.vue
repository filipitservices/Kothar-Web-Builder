<template>
  <div class="process-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="process-header">
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

    <div class="process-steps">
      <div class="process-step" v-for="(step, index) in steps" :key="index">
        <div class="step-controls">
          <button 
            class="delete-btn"
            @click="removeStep(index)"
            title="Remove this step"
          >
            ×
          </button>
        </div>
        
        <div class="step-number">{{ index + 1 }}</div>
        
        <div 
          class="step-title editable"
          :class="{ 'has-local-value': step.title !== DEFAULT_TITLE }"
          @blur="updateStep(index, 'title', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ step.title }}
        </div>
        
        <div 
          class="step-description editable"
          :class="{ 'has-local-value': step.description !== DEFAULT_DESC }"
          @blur="updateStep(index, 'description', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ step.description }}
        </div>
        
        <div class="step-arrow" v-if="index < steps.length - 1">→</div>
      </div>
    </div>

    <button class="add-btn" @click="addStep" title="Add new step">
      + Add Step
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface ProcessStep {
  title: string;
  description: string;
}

const DEFAULT_TITLE = 'Step Title';
const DEFAULT_DESC = 'Describe what happens in this step.';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const title = computed(() => getField('title') ?? 'How It Works');
const subtitle = computed(() => getField('subtitle') ?? 'Simple steps to get started with our service.');

const steps = computed<ProcessStep[]>(() => {
  const stored = getField('steps');
  if (Array.isArray(stored) && stored.length > 0) return stored;
  
  return [
    { title: DEFAULT_TITLE, description: DEFAULT_DESC },
    { title: DEFAULT_TITLE, description: DEFAULT_DESC },
    { title: DEFAULT_TITLE, description: DEFAULT_DESC }
  ];
});

const addStep = () => {
  setField('steps', [...steps.value, { title: DEFAULT_TITLE, description: DEFAULT_DESC }]);
};

const removeStep = (index: number) => {
  if (index < 0 || index >= steps.value.length || steps.value.length <= 2) return;
  setField('steps', steps.value.filter((_, i) => i !== index));
};

const updateStep = (index: number, field: keyof ProcessStep, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = steps.value.map((item, i) =>
    i === index ? { ...item, [field]: newValue } : item
  );
  setField('steps', updated);
};

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>

<style scoped>
.process-block {
  padding: 14px;
  background: #f8fafc;
}

.process-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
}

.process-header .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
}

.process-steps {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: stretch;
}

.process-step {
  flex: 1;
  padding: 12px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-controls {
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

.step-number {
  width: 32px;
  height: 32px;
  background: #1e3a8a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 8px;
}

.step-title {
  font-weight: 700;
  font-size: 12px;
  color: #334155;
  margin-bottom: 6px;
}

.step-description {
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
  flex: 1;
}

.step-arrow {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #1e3a8a;
  font-weight: 700;
  z-index: 5;
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

.process-block.mobile-layout {
  padding: 10px;
}

.process-block.mobile-layout .process-header .title {
  font-size: 14px;
}

.process-block.mobile-layout .process-header .subtitle {
  font-size: 11px;
}

.process-block.mobile-layout .process-steps {
  flex-direction: column;
  gap: 10px;
}

.process-block.mobile-layout .step-arrow {
  position: static;
  transform: rotate(90deg);
  margin: 4px 0;
}
</style>
