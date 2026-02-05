import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Block instance data store
 * Manages local state for each block instance per screen
 * 
 * Architecture:
 * - Global (store-driven) data: Business info, sourced from business.ts
 * - Local (block-owned) data: Custom content, titles, values unique to each block
 * 
 * Structure: { screenId -> { blockId -> blockData } }
 * Allows desktop and mobile to have different customizations
 */

export interface BlockData {
  blockId: string;
  blockType: string;
  position?: number;
  // Common editable fields (all blocks can have these)
  title?: string;
  subtitle?: string;
  // Type-specific editable fields
  customData?: Record<string, any>;
}

export interface ScreenBlocks {
  [blockId: string]: BlockData;
}

export const useBlocksStore = defineStore('blocks', () => {
  // State: { screenId -> { blockId -> blockData } }
  const screens = ref<Record<string, ScreenBlocks>>({
    desktop: {},
    mobile: {}
  });

  /**
   * Get all blocks for a screen
   */
  const getScreenBlocks = (screenId: 'desktop' | 'mobile') => {
    return screens.value[screenId] || {};
  };

  /**
   * Get a specific block's data
   */
  const getBlockData = (screenId: 'desktop' | 'mobile', blockId: string) => {
    return screens.value[screenId]?.[blockId];
  };

  /**
   * Create or update a block's local data
   */
  const setBlockData = (
    screenId: 'desktop' | 'mobile',
    blockId: string,
    blockType: string,
    data: Partial<BlockData>
  ) => {
    if (!screens.value[screenId]) {
      screens.value[screenId] = {};
    }
    
    const existing = screens.value[screenId][blockId];
    screens.value[screenId][blockId] = {
      blockId,
      blockType,
      position: data.position ?? existing?.position,
      title: data.title ?? existing?.title,
      subtitle: data.subtitle ?? existing?.subtitle,
      customData: {
        ...existing?.customData,
        ...data.customData
      }
    };
  };

  /**
   * Update a specific field in a block's customData
   */
  const updateBlockCustomField = (
    screenId: 'desktop' | 'mobile',
    blockId: string,
    fieldName: string,
    value: any
  ) => {
    if (screens.value[screenId]?.[blockId]) {
      if (!screens.value[screenId][blockId].customData) {
        screens.value[screenId][blockId].customData = {};
      }
      screens.value[screenId][blockId].customData[fieldName] = value;
    }
  };

  /**
   * Remove a block instance
   */
  const removeBlock = (screenId: 'desktop' | 'mobile', blockId: string) => {
    if (screens.value[screenId]) {
      delete screens.value[screenId][blockId];
    }
  };

  /**
   * Clear all blocks for a screen
   */
  const clearScreen = (screenId: 'desktop' | 'mobile') => {
    screens.value[screenId] = {};
  };

  /**
   * Copy block customizations from one screen to another
   * Useful for sync functionality
   */
  const syncBlockToScreen = (sourceScreenId: 'desktop' | 'mobile', targetScreenId: 'desktop' | 'mobile', blockId: string) => {
    const sourceBlock = screens.value[sourceScreenId]?.[blockId];
    if (sourceBlock) {
      if (!screens.value[targetScreenId]) {
        screens.value[targetScreenId] = {};
      }
      const targetBlock = screens.value[targetScreenId][blockId];
      if (targetBlock) {
        // Copy customizations but keep block-type specific local overrides
        screens.value[targetScreenId][blockId] = {
          ...sourceBlock,
          customData: { ...sourceBlock.customData }
        };
      }
    }
  };

  /**
   * Export all block data (for persistence)
   */
  const exportData = () => {
    return JSON.parse(JSON.stringify(screens.value));
  };

  /**
   * Import block data (for restoration)
   */
  const importData = (data: Record<string, ScreenBlocks>) => {
    screens.value = data;
  };

  return {
    // State
    screens,
    // Actions
    getScreenBlocks,
    getBlockData,
    setBlockData,
    updateBlockCustomField,
    removeBlock,
    clearScreen,
    syncBlockToScreen,
    exportData,
    importData
  };
});
