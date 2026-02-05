<template>
  <div class="upload" role="group" aria-labelledby="upload-label">
    <div 
      class="dropzone"
      :class="{ dragging: isDragging, compact: hasFiles }"
      role="button"
      tabindex="0"
      :aria-describedby="hasFiles ? 'file-count' : undefined"
      @click="openFilePicker"
      @keydown.enter.prevent="openFilePicker"
      @keydown.space.prevent="openFilePicker"
      @dragenter.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <input
        ref="inputRef"
        type="file"
        class="sr-only"
        :multiple="multiple"
        :accept="accept"
        :aria-label="ariaLabel"
        @change="onFileSelect"
      />

      <div class="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m8 17 4-5 4 5" />
        </svg>
      </div>

      <div class="copy">
        <p id="upload-label" class="headline">Upload your brand files</p>
        <p class="desc">
          Logos, images, documents, references — anything you'd like us to use. 
          <span class="cta">Drop them here</span> and we'll sort it out.
        </p>
        <p class="formats">{{ formatsText }}</p>
      </div>
    </div>

    <ul v-if="hasFiles" class="files" aria-label="Uploaded files">
      <li v-for="(file, index) in files" :key="file.name + file.size + index" class="file">
        <div class="file-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <button 
          type="button" 
          class="file-remove"
          :aria-label="`Remove ${file.name}`"
          @click="onRemoveFile(index)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </li>
    </ul>

    <span v-if="hasFiles" id="file-count" class="sr-only">
      {{ files.length }} {{ files.length === 1 ? 'file' : 'files' }} selected
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFileUpload } from '~/composables/useFileUpload';

interface Props {
  accept?: string;
  multiple?: boolean;
  ariaLabel?: string;
  formatsText?: string;
  acceptedTypes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*,.pdf,.ai,.psd,.eps,.svg',
  multiple: true,
  ariaLabel: 'Choose files to upload',
  formatsText: 'PNG, JPG, PDF, SVG, AI, PSD, EPS',
  acceptedTypes: () => ['image/', 'application/pdf', '.ai', '.psd', '.eps', '.svg']
});

const emit = defineEmits<{
  (e: 'update:files', files: readonly File[]): void;
}>();

const {
  files, isDragging, addFiles, removeFile, formatFileSize,
  handleDragEnter, handleDragLeave, handleDrop
} = useFileUpload({ acceptedTypes: props.acceptedTypes });

const inputRef = ref<HTMLInputElement | null>(null);
const hasFiles = computed(() => files.value.length > 0);

function openFilePicker(): void {
  inputRef.value?.click();
}

function onFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    addFiles(Array.from(input.files));
    notifyParent();
  }
  input.value = '';
}

function onDragEnter(event: DragEvent): void {
  handleDragEnter(event);
}

function onDragLeave(): void {
  handleDragLeave();
}

function onDrop(event: DragEvent): void {
  handleDrop(event);
  notifyParent();
}

function onRemoveFile(index: number): void {
  removeFile(index);
  notifyParent();
}

function notifyParent(): void {
  emit('update:files', files.value);
}
</script>

<style scoped>
/* Visually hidden */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Dropzone */
.dropzone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, #f0f5ff, #faf5ff);
  border: 2px dashed #c7d2fe;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.dropzone:hover {
  background: linear-gradient(135deg, #e8efff, #f3ebff);
  border-color: #a5b4fc;
}

.dropzone:focus-visible {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.12);
}

.dropzone.dragging {
  background: linear-gradient(135deg, #dbeafe, #ede9fe);
  border: 2px solid #1e3a8a;
  transform: scale(1.01);
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1), 0 8px 24px -4px rgba(30, 58, 138, 0.15);
}

.dropzone.compact { padding: 1.25rem 1.5rem; }

/* Icon */
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px; height: 52px;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  border-radius: 14px;
  color: #1e3a8a;
  transition: transform 0.2s, box-shadow 0.2s;
}

.icon svg { width: 26px; height: 26px; }

.dropzone:hover .icon {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
}

.dropzone.dragging .icon {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 20px rgba(30, 58, 138, 0.2);
}

.dropzone.compact .icon { width: 40px; height: 40px; margin-bottom: 0.75rem; }
.dropzone.compact .icon svg { width: 20px; height: 20px; }

/* Copy */
.copy { display: flex; flex-direction: column; gap: 0.375rem; }

.headline {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.desc {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  max-width: 320px;
}

.cta { color: #1e3a8a; font-weight: 500; }

.formats {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
  letter-spacing: 0.01em;
}

.dropzone.compact .headline { font-size: 0.875rem; }
.dropzone.compact .desc { display: none; }
.dropzone.compact .formats { margin-top: 0; }

/* File list */
.files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.file:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #f0f5ff, #faf5ff);
  border-radius: 8px;
  flex-shrink: 0;
}

.file-icon svg { width: 16px; height: 16px; color: #6366f1; }

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size { font-size: 0.75rem; color: #94a3b8; }

.file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.file-remove svg { width: 16px; height: 16px; }

.file-remove:hover,
.file-remove:focus-visible {
  background: #fef2f2;
  color: #dc2626;
  outline: none;
}

.file-remove:focus-visible {
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

/* Responsive */
@media (max-width: 480px) {
  .dropzone { padding: 1.5rem 1rem; }
  .icon { width: 44px; height: 44px; border-radius: 12px; }
  .icon svg { width: 22px; height: 22px; }
  .headline { font-size: 0.9375rem; }
  .desc { font-size: 0.8125rem; }
  .file { padding: 0.625rem 0.875rem; }
  .file-icon { width: 28px; height: 28px; }
  .file-icon svg { width: 14px; height: 14px; }
}
</style>
