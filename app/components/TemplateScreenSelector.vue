<template>
  <Teleport to="body">
    <div v-if="isOpen" class="screen-selector-modal" @click.self="$emit('close')">
      <div class="screen-selector-content">
        <h4>Apply {{ templateName }} to:</h4>
        <div class="screen-options">
          <button class="screen-option-btn" @click="$emit('select', 'desktop')">
            <span class="icon">🖥️</span>
            <span>Desktop</span>
          </button>
          <button class="screen-option-btn" @click="$emit('select', 'mobile')">
            <span class="icon">📱</span>
            <span>Mobile</span>
          </button>
          <button class="screen-option-btn" @click="$emit('select', 'both')">
            <span class="icon">💻📱</span>
            <span>Both</span>
          </button>
        </div>
        <button class="cancel-btn" @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface TemplateScreenSelectorProps {
  isOpen: boolean;
  templateName: string;
}

defineProps<TemplateScreenSelectorProps>();

defineEmits<{
  select: [screen: 'desktop' | 'mobile' | 'both'];
  close: [];
}>();
</script>

<style scoped>
.screen-selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.screen-selector-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.screen-selector-content h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
}

.screen-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.screen-option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.screen-option-btn:hover {
  background: #fff;
  border-color: #1e3a8a;
  transform: translateX(4px);
}

.screen-option-btn .icon {
  font-size: 24px;
}

.cancel-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f8fafc;
  color: #334155;
}
</style>
