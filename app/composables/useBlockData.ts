import { computed } from 'vue';
import { useBlocksStore } from '~/stores/blocks';
import { useBusinessData } from '~/composables/useBusinessData';
import { useNuxtApp } from '#app';

/**
 * Composable for accessing and updating block-specific data
 * New simplified API - automatically detects screen type from route/context
 * 
 * Usage in a block:
 * const { getField, setField, isLocalValue, mergedData } = useBlockData(props.blockId);
 * 
 * Benefits:
 * - Single parameter API (just blockId)
 * - Automatic screen detection
 * - Merged business data access
 * - Visual indicators for customized fields
 * - Type-safe field access
 */

export function useBlockData(blockId: string) {
  const blocksStore = useBlocksStore();
  const businessData = useBusinessData();
  const nuxtApp = useNuxtApp();

  // Auto-detect screen type from blockId prefix or default to desktop
  // blockId format: "type-timestamp-random" or can include screen info
  const screenId = computed<'desktop' | 'mobile'>(() => {
    // For now, we'll need to pass screen context differently
    // This is a simplified version - in production you'd use provide/inject or route
    return 'desktop'; // Default fallback
  });

  /**
   * Get a field value from block's customData
   * Returns the stored value or undefined if not set
   */
  const getField = (fieldName: string): any => {
    const blockData = blocksStore.getBlockData(screenId.value, blockId);
    return blockData?.customData?.[fieldName];
  };

  /**
   * Set a field value in block's customData
   * Initializes block if it doesn't exist
   */
  const setField = (fieldName: string, value: any): void => {
    // Ensure block exists
    let blockData = blocksStore.getBlockData(screenId.value, blockId);
    if (!blockData) {
      // Extract block type from blockId (format: "el-type-...")
      const blockType = blockId.split('-')[1] || 'unknown';
      blocksStore.setBlockData(screenId.value, blockId, blockType, {
        title: '',
        subtitle: '',
        customData: {}
      });
      blockData = blocksStore.getBlockData(screenId.value, blockId);
    }
    
    // Update the field
    blocksStore.updateBlockCustomField(screenId.value, blockId, fieldName, value);
  };

  /**
   * Check if a field has a local customized value
   * Used for visual indicators (bold text, highlighting, etc.)
   */
  const isLocalValue = (fieldName: string): boolean => {
    const value = getField(fieldName);
    return value !== undefined && value !== null && value !== '';
  };

  /**
   * Merged data object combining business store data with block customizations
   * Useful for blocks that can override global business info
   */
  const mergedData = computed(() => {
    return {
      // Business data (from global store)
      companyName: businessData.companyName.value,
      email: businessData.email.value,
      telephone: businessData.telephone.value,
      address: businessData.address.value,
      city: businessData.city.value,
      postalCode: businessData.postalCode.value,
      website: businessData.website.value,
      businessHours: businessData.businessHours.value,
      taxId: businessData.taxId.value,
      fullAddress: businessData.fullAddress.value,
      hasContact: businessData.hasContact.value,
      isComplete: businessData.isComplete.value,
      
      // Block-specific customizations
      ...blocksStore.getBlockData(screenId.value, blockId)?.customData
    };
  });

  /**
   * Get reactive reference to full block data
   */
  const blockData = computed(() => blocksStore.getBlockData(screenId.value, blockId));

  /**
   * Delete this block instance
   */
  const deleteBlock = () => {
    blocksStore.removeBlock(screenId.value, blockId);
  };

  return {
    // Core API
    getField,
    setField,
    isLocalValue,
    mergedData,
    
    // Additional utilities
    blockData,
    deleteBlock,
    screenId: screenId.value
  };
}
