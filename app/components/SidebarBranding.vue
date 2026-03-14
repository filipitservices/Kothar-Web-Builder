<template>
  <div class="sidebar-branding">
    <div class="branding-content">
      <!-- App Icon -->
      <div class="branding-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>

      <!-- Branding Text -->
      <div class="branding-text">
        <h4 class="app-name">Site Builder</h4>
        <p class="workspace-indicator" :title="workspaceTitle">
          {{ workspaceDisplay }}
        </p>
      </div>
    </div>

    <!-- Account Actions -->
    <div class="branding-actions">
      <button
        class="action-button"
        title="Account Settings"
        aria-label="Account Settings"
        @click="handleAccountClick"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      <button
        class="action-button"
        title="Help & Support"
        aria-label="Help & Support"
        @click="handleHelpClick"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBusinessData } from '~/composables/useBusinessData';
import { logger } from '~/utils/logger';

// Get business data via composable (abstraction layer)
const { companyName } = useBusinessData();

// Computed properties for workspace display
const workspaceDisplay = computed(() => {
  const name = companyName.value?.trim();
  // Truncate to 18 chars with ellipsis for very long company names
  if (name && name.length > 18) {
    return name.substring(0, 15) + '...';
  }
  return name || 'No workspace';
});

const workspaceTitle = computed(() => {
  return companyName.value || 'No workspace configured';
});

// Event handlers
const handleAccountClick = () => {
  // In future: open account settings modal or navigate to profile
  logger.log('Account settings clicked');
  // Emit event if parent component needs to handle this
  emit('account-click');
};

const handleHelpClick = () => {
  // In future: open help documentation or support panel
  logger.log('Help clicked');
  emit('help-click');
};

// Define emits for extensibility
const emit = defineEmits<{
  'account-click': [];
  'help-click': [];
}>();
</script>

<style scoped>
.sidebar-branding {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
}

.branding-content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.branding-icon {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

.branding-icon svg {
  width: 20px;
  height: 20px;
}

.branding-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-name {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.3px;
}

.workspace-indicator {
  margin: 0;
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.branding-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-button {
  flex: 1;
  height: 32px;
  padding: 0;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0;
}

.action-button svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.action-button:hover {
  border-color: #1e3a8a;
  color: #1e3a8a;
  background: rgba(30, 58, 138, 0.05);
  box-shadow: 0 2px 6px rgba(30, 58, 138, 0.1);
}

.action-button:active {
  transform: scale(0.98);
}
</style>
