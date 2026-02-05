<template>
  <div class="form-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="form-header">
      <div 
        class="form-title editable"
        :class="{ 'has-local-value': isLocalValue('title') }"
        @blur="updateField('title', $event)"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ getValue('title') }}
      </div>
      <div 
        class="form-subtitle editable"
        :class="{ 'has-local-value': isLocalValue('subtitle') }"
        @blur="updateField('subtitle', $event)"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ getValue('subtitle') }}
      </div>
    </div>
    
    <div class="form-fields">
      <div class="form-row">
        <div class="form-field">
          <div 
            class="field-label editable"
            :class="{ 'has-local-value': isLocalValue('nameLabel') }"
            @blur="updateField('nameLabel', $event)"
            @keydown.enter.prevent="blurOnEnter"
            contenteditable="true"
          >
            {{ getValue('nameLabel') }}
          </div>
          <div class="field-input">Your name</div>
        </div>
        <div class="form-field">
          <div 
            class="field-label editable"
            :class="{ 'has-local-value': isLocalValue('emailLabel') }"
            @blur="updateField('emailLabel', $event)"
            @keydown.enter.prevent="blurOnEnter"
            contenteditable="true"
          >
            {{ getValue('emailLabel') }}
          </div>
          <div class="field-input">your@email.com</div>
        </div>
      </div>
      
      <div class="form-field">
        <div 
          class="field-label editable"
          :class="{ 'has-local-value': isLocalValue('messageLabel') }"
          @blur="updateField('messageLabel', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ getValue('messageLabel') }}
        </div>
        <div class="field-textarea">Your message here...</div>
      </div>
      
      <button 
        class="form-submit editable"
        :class="{ 'has-local-value': isLocalValue('buttonText') }"
        @blur="updateField('buttonText', $event)"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ getValue('buttonText') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const defaults: Record<string, string> = {
  title: 'Get in touch',
  subtitle: 'We\'ll respond as soon as possible.',
  nameLabel: 'NAME',
  emailLabel: 'EMAIL',
  messageLabel: 'MESSAGE',
  buttonText: 'Send Message'
};

const getValue = (key: string) => getField(key) || defaults[key];

const updateField = (fieldKey: string, event: FocusEvent) => {
  setField(fieldKey, extractContentEditableText(event));
};
</script>

<style scoped>
.form-block {
  padding: 14px;
  background: #f8fafc;
}

.form-header {
  margin-bottom: 12px;
}

.form-title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
}

.form-subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.field-input,
.field-textarea {
  padding: 8px;
  font-size: 11px;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  background: #ffffff;
  color: #64748b;
}

.field-textarea {
  min-height: 60px;
}

.form-submit {
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  color: #ffffff;
  background: #1e3a8a;
  transition: all 0.15s ease;
}

.form-submit:hover {
  background: #1e40af;
}

.form-block.mobile-layout {
  padding: 10px;
}

.form-block.mobile-layout .form-title {
  font-size: 14px;
}

.form-block.mobile-layout .form-subtitle {
  font-size: 11px;
}

.form-block.mobile-layout .form-row {
  grid-template-columns: 1fr;
}

.form-block.mobile-layout .field-label {
  font-size: 10px;
}

.form-block.mobile-layout .field-input,
.form-block.mobile-layout .field-textarea {
  font-size: 10px;
}

.form-block.mobile-layout .form-submit {
  font-size: 11px;
}
</style>
