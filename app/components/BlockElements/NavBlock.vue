<template>
  <div class="nav-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="nav-logo">
      <span class="editable">
        {{ brandText }}
      </span>
    </div>
    <div class="nav-menu">
      <span class="nav-item">Home</span>
      <span class="nav-item">About</span>
      <span class="nav-item">Services</span>
      <span class="nav-item">Contact</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { blurOnEnter } from '~/utils/contentEditableHelpers';

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

const { getField, setField, isLocalValue, mergedData } = useBlockData(props.blockId);

const brandText = computed(() => mergedData.value.companyName || 'Your Brand');

const handleEnter = blurOnEnter;
</script>

<style scoped>
.nav-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: #f8fafc;
}

.nav-logo {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
}

.nav-menu {
  display: flex;
  gap: 14px;
}

.nav-item {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.nav-block.mobile-layout {
  padding: 10px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.nav-block.mobile-layout .nav-logo {
  font-size: 14px;
}

.nav-block.mobile-layout .nav-menu {
  gap: 10px;
}

.nav-block.mobile-layout .nav-item {
  font-size: 11px;
}
</style>
