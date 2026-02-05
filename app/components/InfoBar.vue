<template>
  <div class="info-bar-wrapper" ref="infoBarWrapperRef">
    <div class="info-bar">
      <div v-for="field in fields" :key="field.name" class="info-block">
        <label>{{ field.label }}</label>
        
        <!-- Select element -->
        <select
          v-if="field.type === 'select'"
          :value="getFieldValue(field.name)"
          @input="handleInput(field.name, $event)"
          @blur="handleBlur(field.name)"
          :class="{ 'input-error': errors[field.name] }"
        >
          <option value="">{{ field.placeholder }}</option>
          <option v-for="option in options[field.name]" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        
        <!-- Input element -->
        <input
          v-else
          :type="field.type"
          :value="getFieldValue(field.name)"
          :placeholder="field.placeholder"
          @input="handleInput(field.name, $event)"
          @blur="handleBlur(field.name)"
          :class="{ 'input-error': errors[field.name] }"
        />
        
        <span v-if="errors[field.name]" class="error-text">{{ errors[field.name] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useBusinessStore, type BusinessFieldKey } from '~/stores/business';

interface Field {
  name: BusinessFieldKey;
  label: string;
  type: string;
  placeholder: string;
}

interface Props {
  errors: Record<string, string | null>;
  options?: Record<string, string[]>;
  fields: Field[];
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({})
});

const emit = defineEmits<{
  validate: [fieldName: BusinessFieldKey];
}>();

// Access store directly with type safety
const businessStore = useBusinessStore();

// Template ref for the wrapper element
const infoBarWrapperRef = ref<HTMLDivElement | null>(null);

// Create a computed for each field value
const getFieldValue = (fieldName: BusinessFieldKey): string => {
  return businessStore.getField(fieldName);
};

const handleInput = (fieldName: BusinessFieldKey, event: Event) => {
  const target = event.target;
  if (!target) return;
  
  const newValue = target instanceof HTMLInputElement || target instanceof HTMLSelectElement 
    ? target.value 
    : '';
  
  // Update store directly using store's method
  businessStore.updateBusinessInfo({
    [fieldName]: newValue
  });
};

const handleBlur = (fieldName: BusinessFieldKey) => {
  emit('validate', fieldName);
};

// Horizontal scroll via mouse wheel
const handleWheelScroll = (event: WheelEvent) => {
  const wrapper = infoBarWrapperRef.value;
  if (!wrapper) return;
  
  // Check if there's actually horizontal scrollable content
  if (wrapper.scrollWidth > wrapper.clientWidth) {
    event.preventDefault();
    
    // Convert vertical wheel delta to horizontal scroll
    // deltaY is the primary scroll axis on most mice
    const scrollAmount = event.deltaY || event.deltaX;
    wrapper.scrollLeft += scrollAmount;
  }
};

// Lifecycle hooks for wheel event
onMounted(() => {
  if (infoBarWrapperRef.value) {
    infoBarWrapperRef.value.addEventListener('wheel', handleWheelScroll, { passive: false });
  }
});

onUnmounted(() => {
  if (infoBarWrapperRef.value) {
    infoBarWrapperRef.value.removeEventListener('wheel', handleWheelScroll);
  }
});
</script>

<style scoped>
.info-bar-wrapper {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 0 0 auto;
  display: flex;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.info-bar-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.info-bar {
  display: flex;
  gap: 14px;
  width: 100%;
  padding-right: 10px;
}

.info-block {
  flex: 0 0 auto;
  width: 165px;
  background: #22af88;
  border-radius: 10px;
  padding: 11px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.info-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.info-block label {
  display: block;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.info-block input,
.info-block select {
  width: 100%;
  padding: 7px 9px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  font-weight: 500;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.info-block input::placeholder {
  color: #a0a0a0;
  font-size: 11px;
}

.info-block input:focus,
.info-block select:focus {
  outline: none;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.info-block input.input-error,
.info-block select.input-error {
  border: 2px solid #d32f2f;
  background: #ffebee;
}

.error-text {
  font-size: 10px;
  color: #fff;
  font-weight: 600;
  margin-top: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
