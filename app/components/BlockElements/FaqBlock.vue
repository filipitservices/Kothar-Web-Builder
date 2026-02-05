<template>
  <div class="faq-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="faq-header">
      <div 
        class="title editable"
        :class="{ 'has-local-value': isLocalValue('title') }"
        @blur="updateTitle"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ title }}
      </div>
    </div>

    <div class="faq-items">
      <div class="faq-item" v-for="(item, index) in faqList" :key="index">
        <div class="faq-controls">
          <button 
            class="delete-btn"
            @click="removeFaq(index)"
            title="Remove this FAQ item"
          >
            ×
          </button>
        </div>
        
        <div 
          class="faq-q editable"
          :class="{ 'has-local-value': item.question !== DEFAULT_QUESTION }"
          @blur="updateQuestion(index, $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ item.question }}
        </div>
        
        <div 
          class="faq-a editable"
          :class="{ 'has-local-value': item.answer !== DEFAULT_ANSWER }"
          @blur="updateAnswer(index, $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ item.answer }}
        </div>
      </div>
    </div>

    <button class="add-btn" @click="addFaq" title="Add new FAQ item">
      + Add Question
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface FaqItem {
  question: string;
  answer: string;
}

const DEFAULT_TITLE = 'Frequently Asked Questions';
const DEFAULT_QUESTION = 'What is a common question?';
const DEFAULT_ANSWER = 'Provide a clear, helpful answer here.';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const title = computed(() => getField('title') ?? DEFAULT_TITLE);

/**
 * Get FAQ array from storage
 * Returns default pair on first load
 */
const faqList = computed<FaqItem[]>(() => {
  const stored = getField('faqs');
  
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  
  return [
    { question: DEFAULT_QUESTION, answer: DEFAULT_ANSWER },
    { question: DEFAULT_QUESTION, answer: DEFAULT_ANSWER }
  ];
});

/**
 * Add new FAQ item
 */
const addFaq = () => {
  const updated = [
    ...faqList.value,
    { question: DEFAULT_QUESTION, answer: DEFAULT_ANSWER }
  ];
  setField('faqs', updated);
};

/**
 * Remove FAQ item at index
 */
const removeFaq = (index: number) => {
  if (index < 0 || index >= faqList.value.length) return;
  const updated = faqList.value.filter((_, i) => i !== index);
  setField('faqs', updated);
};

/**
 * Update question at index
 */
const updateQuestion = (index: number, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = faqList.value.map((item, i) =>
    i === index ? { ...item, question: newValue } : item
  );
  setField('faqs', updated);
};

/**
 * Update answer at index
 */
const updateAnswer = (index: number, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = faqList.value.map((item, i) =>
    i === index ? { ...item, answer: newValue } : item
  );
  setField('faqs', updated);
};

/**
 * Update title
 */
const updateTitle = (event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  setField('title', newValue);
};
</script>

<style scoped>
.faq-block {
  padding: 14px;
  background: #f8fafc;
}

.faq-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
}

.faq-items {
  margin-bottom: 12px;
}

.faq-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  position: relative;
}

.faq-controls {
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

.faq-q {
  font-weight: 700;
  font-size: 12px;
  color: #334155;
  margin-bottom: 6px;
  padding-right: 10px;
}

.faq-a {
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

.faq-block.mobile-layout {
  padding: 10px;
}

.faq-block.mobile-layout .faq-header .title {
  font-size: 14px;
}

.faq-block.mobile-layout .faq-item {
  padding: 8px;
  margin-bottom: 8px;
}

.faq-block.mobile-layout .faq-q {
  font-size: 11px;
}

.faq-block.mobile-layout .faq-a {
  font-size: 10px;
}
</style>
