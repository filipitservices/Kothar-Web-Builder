import { computed } from 'vue';
import { useBlocksStore } from '~/stores/blocks';
import { useBusinessData } from '~/composables/useBusinessData';

export type BlockDataScreenId = 'desktop' | 'mobile';

function toScreenId(v: unknown): BlockDataScreenId {
  return v === 'mobile' ? 'mobile' : 'desktop';
}

/**
 * Composable for accessing and updating block-specific data.
 * Block components must pass screenType from parent (ItemsList) so desktop and mobile data stay separate.
 *
 * @param blockId - Unique block instance id
 * @param screenIdOrRef - Optional screen context. Defaults to 'desktop'.
 */
export function useBlockData(
  blockId: string,
  screenIdOrRef?: BlockDataScreenId | string | { value: BlockDataScreenId | string }
) {
  const blocksStore = useBlocksStore();
  const businessData = useBusinessData();

  const screenId = computed<BlockDataScreenId>(() => {
    if (screenIdOrRef === undefined) return 'desktop';
    if (typeof screenIdOrRef === 'string') return toScreenId(screenIdOrRef);
    return toScreenId(screenIdOrRef.value);
  });

  /**
   * Get a field value from block's customData
   * Returns the stored value or undefined if not set
   */
  const getField = (fieldName: string): unknown => {
    const blockData = blocksStore.getBlockData(screenId.value, blockId);
    return blockData?.customData?.[fieldName];
  };

  /**
   * Set a field value in block's customData
   * Initializes block if it doesn't exist
   */
  const setField = (fieldName: string, value: unknown): void => {
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
    getField,
    setField,
    isLocalValue,
    mergedData,
    blockData,
    deleteBlock,
    screenId,
  };
}
