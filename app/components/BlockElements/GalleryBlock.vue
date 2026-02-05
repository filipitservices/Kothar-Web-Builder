<template>
  <div class="gallery-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="gallery-header">
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
    <div class="gallery-grid">
      <div class="gallery-item" v-for="(item, index) in items" :key="index">
        <div class="item-controls">
          <button 
            class="delete-btn"
            @click="removeItem(index)"
            title="Remove this item"
          >
            ×
          </button>
        </div>
        <div class="gallery-image"></div>
        <div 
          class="gallery-caption editable"
          :class="{ 'has-local-value': item.caption !== DEFAULT_CAPTION }"
          @blur="updateItem(index, 'caption', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ item.caption }}
        </div>
      </div>
    </div>
    <button class="add-btn" @click="addItem" title="Add new gallery item">
      + Add Item
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface GalleryItem {
  caption: string;
}

const DEFAULT_CAPTION = 'Image caption';

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

const title = computed(() => getField('title') ?? 'Gallery');
const subtitle = computed(() => getField('subtitle') ?? 'View our recent work and projects.');

const items = computed<GalleryItem[]>(() => {
  const stored = getField('items');
  if (Array.isArray(stored) && stored.length > 0) return stored;
  
  return [
    { caption: DEFAULT_CAPTION },
    { caption: DEFAULT_CAPTION },
    { caption: DEFAULT_CAPTION },
    { caption: DEFAULT_CAPTION },
    { caption: DEFAULT_CAPTION },
    { caption: DEFAULT_CAPTION }
  ];
});

const addItem = () => {
  setField('items', [...items.value, { caption: DEFAULT_CAPTION }]);
};

const removeItem = (index: number) => {
  if (index < 0 || index >= items.value.length || items.value.length <= 2) return;
  setField('items', items.value.filter((_, i) => i !== index));
};

const updateItem = (index: number, field: keyof GalleryItem, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = items.value.map((item, i) =>
    i === index ? { ...item, [field]: newValue } : item
  );
  setField('items', updated);
};

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>


<style scoped>
.gallery-block {
  padding: 14px;
  background: #f8fafc;
}

.gallery-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
}

.gallery-header .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.gallery-item {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.item-controls {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}

.delete-btn {
  background: rgba(255, 255, 255, 0.9);
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.gallery-image {
  aspect-ratio: 4/3;
  background-image: repeating-linear-gradient(45deg, #e2e8f0 0px, #e2e8f0 6px, transparent 6px, transparent 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.gallery-caption {
  font-size: 10px;
  color: #64748b;
  padding: 6px 8px;
  text-align: center;
  background: #f8fafc;
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

.gallery-block.mobile-layout {
  padding: 10px;
}

.gallery-block.mobile-layout .gallery-header .title {
  font-size: 14px;
}

.gallery-block.mobile-layout .gallery-header .subtitle {
  font-size: 11px;
}

.gallery-block.mobile-layout .gallery-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
</style>

