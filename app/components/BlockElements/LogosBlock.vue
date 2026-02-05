<template>
  <div class="logos-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="logos-header">
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

    <div class="logos-grid">
      <div class="logo-item" v-for="(logo, index) in logos" :key="index">
        <div class="logo-controls">
          <button 
            class="delete-btn"
            @click="removeLogo(index)"
            title="Remove this logo"
          >
            ×
          </button>
        </div>
        
        <div class="logo-box"></div>
        
        <div 
          class="logo-name editable"
          :class="{ 'has-local-value': logo.name !== DEFAULT_NAME }"
          @blur="updateLogo(index, 'name', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ logo.name }}
        </div>
      </div>
    </div>

    <button class="add-btn" @click="addLogo" title="Add new logo">
      + Add Logo
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface Logo {
  name: string;
}

const DEFAULT_NAME = 'Client Name';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const title = computed(() => getField('title') ?? 'Trusted By');
const subtitle = computed(() => getField('subtitle') ?? 'Companies and clients we\'re proud to work with.');

const logos = computed<Logo[]>(() => {
  const stored = getField('logos');
  if (Array.isArray(stored) && stored.length > 0) return stored;
  
  return [
    { name: DEFAULT_NAME },
    { name: DEFAULT_NAME },
    { name: DEFAULT_NAME },
    { name: DEFAULT_NAME },
    { name: DEFAULT_NAME },
    { name: DEFAULT_NAME }
  ];
});

const addLogo = () => {
  setField('logos', [...logos.value, { name: DEFAULT_NAME }]);
};

const removeLogo = (index: number) => {
  if (index < 0 || index >= logos.value.length || logos.value.length <= 2) return;
  setField('logos', logos.value.filter((_, i) => i !== index));
};

const updateLogo = (index: number, field: keyof Logo, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = logos.value.map((item, i) =>
    i === index ? { ...item, [field]: newValue } : item
  );
  setField('logos', updated);
};

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>

<style scoped>
.logos-block {
  padding: 14px;
  background: #f8fafc;
}

.logos-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
  text-align: center;
}

.logos-header .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
  text-align: center;
}

.logos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.logo-item {
  padding: 10px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.logo-controls {
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

.logo-box {
  width: 60px;
  height: 40px;
  background: repeating-linear-gradient(45deg, #e2e8f0 0px, #e2e8f0 4px, transparent 4px, transparent 8px);
  border: 1px solid #cbd5e1;
  border-radius: 2px;
}

.logo-name {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
  text-align: center;
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

.logos-block.mobile-layout {
  padding: 10px;
}

.logos-block.mobile-layout .logos-header .title {
  font-size: 14px;
}

.logos-block.mobile-layout .logos-header .subtitle {
  font-size: 11px;
}

.logos-block.mobile-layout .logos-grid {
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
</style>
