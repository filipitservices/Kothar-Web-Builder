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
  customData?: Record<string, unknown>;
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
   * Create or update a block's local data (immutable update).
   */
  const setBlockData = (
    screenId: 'desktop' | 'mobile',
    blockId: string,
    blockType: string,
    data: Partial<BlockData>
  ) => {
    const screenBlocks = screens.value[screenId] ?? {};
    const existing = screenBlocks[blockId];
    const nextBlock: BlockData = {
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
    screens.value = {
      ...screens.value,
      [screenId]: {
        ...screenBlocks,
        [blockId]: nextBlock
      }
    };
  };

  /**
   * Update a specific field in a block's customData (immutable update).
   */
  const updateBlockCustomField = (
    screenId: 'desktop' | 'mobile',
    blockId: string,
    fieldName: string,
    value: unknown
  ) => {
    const screenBlocks = screens.value[screenId];
    const existing = screenBlocks?.[blockId];
    if (!existing) return;

    const nextCustomData = {
      ...(existing.customData ?? {}),
      [fieldName]: value
    };
    const nextBlock: BlockData = {
      ...existing,
      customData: nextCustomData
    };
    screens.value = {
      ...screens.value,
      [screenId]: {
        ...screenBlocks,
        [blockId]: nextBlock
      }
    };
  };

  /**
   * Remove a block instance (immutable update).
   */
  const removeBlock = (screenId: 'desktop' | 'mobile', blockId: string) => {
    const screenBlocks = screens.value[screenId];
    if (!screenBlocks?.[blockId]) return;
    const { [blockId]: _, ...rest } = screenBlocks;
    screens.value = {
      ...screens.value,
      [screenId]: rest
    };
  };

  /**
   * Clear all blocks for a screen (immutable update).
   */
  const clearScreen = (screenId: 'desktop' | 'mobile') => {
    screens.value = {
      ...screens.value,
      [screenId]: {}
    };
  };

  /**
   * Copy block customizations from one screen to another (immutable update).
   */
  const syncBlockToScreen = (sourceScreenId: 'desktop' | 'mobile', targetScreenId: 'desktop' | 'mobile', blockId: string) => {
    const sourceBlock = screens.value[sourceScreenId]?.[blockId];
    const targetBlocks = screens.value[targetScreenId] ?? {};
    const targetBlock = targetBlocks[blockId];
    if (!sourceBlock || !targetBlock) return;

    const nextBlock: BlockData = {
      ...sourceBlock,
      customData: { ...(sourceBlock.customData ?? {}) }
    };
    screens.value = {
      ...screens.value,
      [targetScreenId]: {
        ...targetBlocks,
        [blockId]: nextBlock
      }
    };
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
