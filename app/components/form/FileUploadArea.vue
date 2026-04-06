<template>
  <div
    class="upload"
    :class="`upload--${tone}`"
    role="group"
    aria-labelledby="upload-label"
  >
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
        <p id="upload-label" class="headline">{{ title }}</p>
        <p class="desc">
          {{ description }}
          <span class="cta">{{ ctaText }}</span>.
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
  tone?: 'brand' | 'logo';
  title?: string;
  description?: string;
  ctaText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*,.pdf,.ai,.psd,.eps,.svg',
  multiple: true,
  ariaLabel: 'Choose files to upload',
  formatsText: 'PNG, JPG, PDF, SVG, AI, PSD, EPS',
  acceptedTypes: () => ['image/', 'application/pdf', '.ai', '.psd', '.eps', '.svg'],
  tone: 'brand',
  title: 'Upload your brand files',
  description: "Logos, images, documents, references — anything you'd like us to use.",
  ctaText: 'Drop them here'
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

.upload {
  --upload-bg: color-mix(in srgb, var(--color-bg-subtle) 60%, var(--color-bg));
  --upload-bg-hover: color-mix(in srgb, var(--color-bg-subtle) 78%, var(--color-bg));
  --upload-bg-dragging: color-mix(in srgb, var(--color-bg-subtle) 88%, var(--color-bg));
  --upload-border: var(--color-border);
  --upload-border-strong: var(--color-border-hover);
  --upload-icon-bg: color-mix(in srgb, var(--color-bg-subtle) 75%, var(--color-bg));
  --upload-icon-color: var(--color-text-muted-dark);
  --upload-cta-color: var(--color-text-muted-dark);
}

.upload--logo {
  --upload-bg: color-mix(in srgb, var(--color-primary-tint) 72%, var(--color-bg));
  --upload-bg-hover: color-mix(in srgb, var(--color-primary-tint) 84%, var(--color-bg));
  --upload-bg-dragging: color-mix(in srgb, var(--color-primary-tint) 95%, var(--color-bg));
  --upload-border: color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
  --upload-border-strong: color-mix(in srgb, var(--color-primary) 34%, var(--color-border-hover));
  --upload-icon-bg: color-mix(in srgb, var(--color-primary) 11%, var(--color-bg));
  --upload-icon-color: var(--color-primary);
  --upload-cta-color: var(--color-primary);
}

/* Dropzone */
.dropzone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xl) var(--space-lg);
  background: var(--upload-bg);
  border: 1px dashed var(--upload-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.dropzone:hover {
  background: var(--upload-bg-hover);
  border-color: var(--upload-border-strong);
}

.dropzone:focus-visible {
  outline: none;
  border-color: var(--upload-border-strong);
  box-shadow: var(--focus-ring-primary);
}

.dropzone.dragging {
  background: var(--upload-bg-dragging);
  border-style: solid;
  border-color: var(--upload-border-strong);
}

.dropzone.compact {
  padding: var(--space-lg);
}

/* Icon */
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: var(--space-md);
  background: var(--upload-icon-bg);
  border-radius: var(--radius-md);
  color: var(--upload-icon-color);
}

.icon svg {
  width: 1.375rem;
  height: 1.375rem;
}

.dropzone.compact .icon {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: var(--space-sm);
}

.dropzone.compact .icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* Copy */
.copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.headline {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

.desc {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  max-width: 22rem;
}

.cta {
  color: var(--upload-cta-color);
  font-weight: 600;
}

.formats {
  margin: var(--space-xs) 0 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  letter-spacing: 0.01em;
}

.dropzone.compact .headline {
  font-size: 0.875rem;
}

.dropzone.compact .desc {
  display: none;
}

.dropzone.compact .formats {
  margin-top: 0;
}

/* File list */
.files {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin: var(--space-md) 0 0;
  padding: 0;
  list-style: none;
}

.file {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: color-mix(in srgb, var(--upload-icon-color) 8%, var(--color-bg));
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.file-icon svg {
  width: 1rem;
  height: 1rem;
  color: var(--upload-icon-color);
}

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
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.file-remove svg {
  width: 1rem;
  height: 1rem;
}

.file-remove:hover,
.file-remove:focus-visible {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
  outline: none;
}

.file-remove:focus-visible {
  box-shadow: var(--focus-ring-primary);
}

/* Responsive */
@media (max-width: 480px) {
  .dropzone {
    padding: var(--space-lg) var(--space-md);
  }

  .icon {
    width: 2.75rem;
    height: 2.75rem;
  }

  .icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .headline { font-size: 0.9375rem; }
  .desc { font-size: 0.8125rem; }

  .file {
    padding: 0.625rem 0.875rem;
  }

  .file-icon {
    width: 1.75rem;
    height: 1.75rem;
  }

  .file-icon svg {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
