<template>
  <div class="hero-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="hero-text">
      <div 
        class="eyebrow editable"
        :class="{ 'has-local-value': isLocalValue('eyebrow') }"
        @blur="updateEyebrow"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ eyebrow }}
      </div>
      <div 
        class="headline editable"
        :class="{ 'has-local-value': isLocalValue('headline') }"
        @blur="updateHeadline"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ headline }}
      </div>
      <div 
        class="subhead editable"
        :class="{ 'has-local-value': isLocalValue('subhead') }"
        @blur="updateSubhead"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ subhead }}
      </div>
      <div class="cta-row">
        <button class="btn primary">
          <span
            class="editable"
            :class="{ 'has-local-value': isLocalValue('primaryCta') }"
            @blur="updatePrimaryCta"
            @keydown.enter.prevent="handleEnter"
            contenteditable="true"
          >
            {{ primaryCta }}
          </span>
        </button>
        <button class="btn ghost">
          <span
            class="editable"
            :class="{ 'has-local-value': isLocalValue('secondaryCta') }"
            @blur="updateSecondaryCta"
            @keydown.enter.prevent="handleEnter"
            contenteditable="true"
          >
            {{ secondaryCta }}
          </span>
        </button>
      </div>
    </div>
    <div class="hero-visual"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

const props = defineProps({
  blockId: {
    type: String,
    required: true
  },
  screenType: {
    type: String,
    default: 'desktop'
  }
});

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const eyebrow = computed(() => getField('eyebrow') ?? 'FEATURED');
const headline = computed(() => getField('headline') ?? 'Bold, clear value prop');
const subhead = computed(() => getField('subhead') ?? 'Short supporting copy that explains what you do.');
const primaryCta = computed(() => getField('primaryCta') ?? 'Get Started');
const secondaryCta = computed(() => getField('secondaryCta') ?? 'Learn More');

const handleEnter = blurOnEnter;

const updateField = (field: string, e: FocusEvent) => {
  const newValue = extractContentEditableText(e);
  setField(field, newValue);
};

const updateEyebrow = (e: FocusEvent) => updateField('eyebrow', e);
const updateHeadline = (e: FocusEvent) => updateField('headline', e);
const updateSubhead = (e: FocusEvent) => updateField('subhead', e);
const updatePrimaryCta = (e: FocusEvent) => updateField('primaryCta', e);
const updateSecondaryCta = (e: FocusEvent) => updateField('secondaryCta', e);
</script>

<style scoped>
.hero-block {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
}

.hero-text .eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #64748b;
  font-weight: 700;
}

.hero-text .headline {
  font-size: 18px;
  font-weight: 700;
  color: #334155;
  margin: 6px 0;
  border-bottom: 2px solid #e2e8f0;
}

.hero-text .subhead {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 10px;
  border-bottom: 1px dashed #e2e8f0;
}

.cta-row {
  display: flex;
  gap: 8px;
}

.hero-visual {
  min-height: 120px;
  border: 1px dashed #cbd5e1;
  background-image: repeating-linear-gradient(45deg, #e2e8f0 0px, #e2e8f0 6px, transparent 6px, transparent 12px);
}

.btn {
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  padding: 6px 10px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  color: #334155;
  background: #f8fafc;
}

.btn.primary {
  background: #f8fafc;
  color: #334155;
}

.btn.ghost {
  background: #f8fafc;
  color: #64748b;
}

.hero-block.mobile-layout {
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 10px;
}

.hero-block.mobile-layout .hero-text .headline {
  font-size: 14px;
}

.hero-block.mobile-layout .hero-text .subhead {
  font-size: 11px;
}

.hero-block.mobile-layout .hero-visual {
  min-height: 80px;
}
</style>
