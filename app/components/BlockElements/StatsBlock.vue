<template>
  <div class="stats-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="stat-item" v-for="(stat, index) in stats" :key="index">
      <div 
        class="stat-number editable"
        :class="{ 'has-local-value': isLocalValue(`stat${index + 1}Number`) }"
        @blur="updateStat(index, 'number', $event)"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ stat.number }}
      </div>
      <div 
        class="stat-label editable"
        :class="{ 'has-local-value': isLocalValue(`stat${index + 1}Label`) }"
        @blur="updateStat(index, 'label', $event)"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ stat.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface Stat {
  number: string;
  label: string;
}

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

const stats = computed<Stat[]>(() => [
  { number: getField('stat1Number') ?? '500+', label: getField('stat1Label') ?? 'Happy Customers' },
  { number: getField('stat2Number') ?? '10+', label: getField('stat2Label') ?? 'Years Experience' },
  { number: getField('stat3Number') ?? '99%', label: getField('stat3Label') ?? 'Satisfaction' }
]);

const handleEnter = blurOnEnter;

const updateField = (fieldKey: string, e: FocusEvent) => {
  const newValue = extractContentEditableText(e);
  setField(fieldKey, newValue);
};

const updateStat = (index: number, field: keyof Stat, e: FocusEvent) => {
  const fieldKey = `stat${index + 1}${field === 'number' ? 'Number' : 'Label'}`;
  updateField(fieldKey, e);
};
</script>

<style scoped>
.stats-block {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
}

.stat-number {
  font-weight: 700;
  font-size: 18px;
  color: #1e3a8a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.stats-block.mobile-layout {
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 10px;
}

.stats-block.mobile-layout .stat-number {
  font-size: 16px;
}

.stats-block.mobile-layout .stat-label {
  font-size: 10px;
}
</style>
