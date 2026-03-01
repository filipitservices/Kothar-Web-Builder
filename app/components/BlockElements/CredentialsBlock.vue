<template>
  <div class="credentials-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="credentials-header">
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

    <div class="credentials-grid">
      <div class="credential-item" v-for="(credential, index) in credentials" :key="index">
        <div class="credential-controls">
          <button 
            class="delete-btn"
            @click="removeCredential(index)"
            title="Remove this credential"
          >
            ×
          </button>
        </div>
        
        <div class="credential-badge">✓</div>
        
        <div 
          class="credential-name editable"
          :class="{ 'has-local-value': credential.name !== DEFAULT_NAME }"
          @blur="updateCredential(index, 'name', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ credential.name }}
        </div>
        
        <div 
          class="credential-issuer editable"
          :class="{ 'has-local-value': credential.issuer !== DEFAULT_ISSUER }"
          @blur="updateCredential(index, 'issuer', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ credential.issuer }}
        </div>
      </div>
    </div>

    <button class="add-btn" @click="addCredential" title="Add new credential">
      + Add Credential
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface Credential {
  name: string;
  issuer: string;
}

const DEFAULT_NAME = 'Certification Name';
const DEFAULT_ISSUER = 'Issuing Organization';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue } = useBlockData(props.blockId, props.screenType);

const title = computed(() => getField('title') ?? 'Credentials & Certifications');
const subtitle = computed(() => getField('subtitle') ?? 'Trusted expertise backed by industry recognition.');

const credentials = computed<Credential[]>(() => {
  const stored = getField('credentials');
  if (Array.isArray(stored) && stored.length > 0) return stored;
  
  return [
    { name: DEFAULT_NAME, issuer: DEFAULT_ISSUER },
    { name: DEFAULT_NAME, issuer: DEFAULT_ISSUER },
    { name: DEFAULT_NAME, issuer: DEFAULT_ISSUER }
  ];
});

const addCredential = () => {
  setField('credentials', [...credentials.value, { name: DEFAULT_NAME, issuer: DEFAULT_ISSUER }]);
};

const removeCredential = (index: number) => {
  if (index < 0 || index >= credentials.value.length || credentials.value.length <= 1) return;
  setField('credentials', credentials.value.filter((_, i) => i !== index));
};

const updateCredential = (index: number, field: keyof Credential, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = credentials.value.map((item, i) =>
    i === index ? { ...item, [field]: newValue } : item
  );
  setField('credentials', updated);
};

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>

<style scoped>
.credentials-block {
  padding: 14px;
  background: #f8fafc;
}

.credentials-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
}

.credentials-header .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
}

.credentials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.credential-item {
  padding: 10px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  position: relative;
  text-align: center;
}

.credential-controls {
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

.credential-badge {
  width: 36px;
  height: 36px;
  margin: 0 auto 8px;
  background: #1e3a8a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.credential-name {
  font-weight: 700;
  font-size: 11px;
  color: #334155;
  margin-bottom: 4px;
}

.credential-issuer {
  font-size: 10px;
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

.credentials-block.mobile-layout {
  padding: 10px;
}

.credentials-block.mobile-layout .credentials-header .title {
  font-size: 14px;
}

.credentials-block.mobile-layout .credentials-header .subtitle {
  font-size: 11px;
}

.credentials-block.mobile-layout .credentials-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
</style>
