<template>
  <div class="services-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="services-header">
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

    <div class="services-grid">
      <div class="service-item" v-for="(service, index) in services" :key="index">
        <div class="service-controls">
          <button 
            class="delete-btn"
            @click="removeService(index)"
            title="Remove this service"
          >
            ×
          </button>
        </div>
        
        <div class="service-icon">●</div>
        
        <div 
          class="service-name editable"
          :class="{ 'has-local-value': service.name !== DEFAULT_NAME }"
          @blur="updateService(index, 'name', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ service.name }}
        </div>
        
        <div 
          class="service-description editable"
          :class="{ 'has-local-value': service.description !== DEFAULT_DESC }"
          @blur="updateService(index, 'description', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ service.description }}
        </div>

        <div 
          class="service-price editable"
          :class="{ 'has-local-value': service.price !== DEFAULT_PRICE }"
          @blur="updateService(index, 'price', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ service.price }}
        </div>
      </div>
    </div>

    <button class="add-btn" @click="addService" title="Add new service">
      + Add Service
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface Service {
  name: string;
  description: string;
  price: string;
}

const DEFAULT_NAME = 'Service Name';
const DEFAULT_DESC = 'Brief description of what this service includes.';
const DEFAULT_PRICE = 'Contact for pricing';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const title = computed(() => getField('title') ?? 'Our Services');
const subtitle = computed(() => getField('subtitle') ?? 'Professional solutions tailored to your needs.');

const services = computed<Service[]>(() => {
  const stored = getField('services');
  if (Array.isArray(stored) && stored.length > 0) return stored;
  
  return [
    { name: DEFAULT_NAME, description: DEFAULT_DESC, price: DEFAULT_PRICE },
    { name: DEFAULT_NAME, description: DEFAULT_DESC, price: DEFAULT_PRICE },
    { name: DEFAULT_NAME, description: DEFAULT_DESC, price: DEFAULT_PRICE }
  ];
});

const addService = () => {
  setField('services', [...services.value, { name: DEFAULT_NAME, description: DEFAULT_DESC, price: DEFAULT_PRICE }]);
};

const removeService = (index: number) => {
  if (index < 0 || index >= services.value.length || services.value.length <= 1) return;
  setField('services', services.value.filter((_, i) => i !== index));
};

const updateService = (index: number, field: keyof Service, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = services.value.map((item, i) =>
    i === index ? { ...item, [field]: newValue } : item
  );
  setField('services', updated);
};

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>

<style scoped>
.services-block {
  padding: 14px;
  background: #f8fafc;
}

.services-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
}

.services-header .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.service-item {
  padding: 12px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.service-controls {
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

.service-icon {
  font-size: 20px;
  color: #1e3a8a;
  margin-bottom: 4px;
  line-height: 1;
}

.service-name {
  font-weight: 700;
  font-size: 13px;
  color: #334155;
  margin-bottom: 2px;
}

.service-description {
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
  flex: 1;
}

.service-price {
  font-size: 12px;
  color: #1e3a8a;
  font-weight: 600;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
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

.services-block.mobile-layout {
  padding: 10px;
}

.services-block.mobile-layout .services-header .title {
  font-size: 14px;
}

.services-block.mobile-layout .services-header .subtitle {
  font-size: 11px;
}

.services-block.mobile-layout .services-grid {
  grid-template-columns: 1fr;
  gap: 8px;
}
</style>
