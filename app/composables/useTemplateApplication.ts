import { useTemplatesStore } from '~/stores/templates';
import type { Ref } from 'vue';

/**
 * Template Application Composable
 * 
 * Handles applying templates to desktop/mobile screens.
 * Follows state transformation pattern - no direct DOM manipulation.
 * 
 * Flow:
 * 1. Get template definition from store
 * 2. Generate unique block IDs for each block in template
 * 3. Create list items with proper structure
 * 4. Update the target screen list (triggers vue-draggable reactivity)
 * 
 * This is a pure state transformation - ItemsList handles the rendering.
 */

interface BlockItem {
  id: string;
  type: string;
  label: string;
}

interface UseTemplateApplicationParams {
  desktopList: Ref<BlockItem[]>;
  mobileList: Ref<BlockItem[]>;
}

export function useTemplateApplication(params: UseTemplateApplicationParams) {
  const { desktopList, mobileList } = params;
  const templatesStore = useTemplatesStore();

  /**
   * Generate a unique block ID for a given block type
   * Format: {type}-{timestamp}-{uuid}
   * This ensures no ID collisions even when applying same template multiple times
   */
  const generateBlockId = (blockType: string): string => {
    return `${blockType}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  };

  /**
   * Create a block item from a template block definition
   */
  const createBlockItem = (templateBlock: { type: string; label: string }): BlockItem => {
    return {
      id: generateBlockId(templateBlock.type),
      type: templateBlock.type,
      label: templateBlock.label
    };
  };

  /**
   * Apply template to a specific screen
   * This is a pure state transformation - replaces the list array
   */
  const applyToScreen = (
    templateId: string,
    screenType: 'desktop' | 'mobile'
  ): boolean => {
    const template = templatesStore.getTemplateById(templateId);
    
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return false;
    }

    // Create new block items from template
    const newBlocks = template.blocks.map(createBlockItem);

    // State transformation: Replace the target list
    if (screenType === 'desktop') {
      desktopList.value = newBlocks;
    } else {
      mobileList.value = newBlocks;
    }

    return true;
  };

  /**
   * Apply template to both screens
   * Each screen gets its own set of block instances with unique IDs
   */
  const applyToBoth = (templateId: string): boolean => {
    const template = templatesStore.getTemplateById(templateId);
    
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return false;
    }

    // Create separate instances for each screen
    const desktopBlocks = template.blocks.map(createBlockItem);
    const mobileBlocks = template.blocks.map(createBlockItem);

    // State transformation: Replace both lists
    desktopList.value = desktopBlocks;
    mobileList.value = mobileBlocks;

    return true;
  };

  /**
   * Main entry point for template application
   * Handles all three cases: desktop, mobile, both
   */
  const applyTemplate = (
    templateId: string,
    screen: 'desktop' | 'mobile' | 'both'
  ): boolean => {
    if (screen === 'both') {
      return applyToBoth(templateId);
    } else {
      return applyToScreen(templateId, screen);
    }
  };

  /**
   * Get preview of what blocks will be added
   * Useful for confirmation dialogs
   */
  const getTemplatePreview = (templateId: string) => {
    const template = templatesStore.getTemplateById(templateId);
    
    if (!template) {
      return null;
    }

    return {
      name: template.name,
      description: template.description,
      blockCount: template.blocks.length,
      blocks: template.blocks.map(b => ({
        type: b.type,
        label: b.label
      }))
    };
  };

  return {
    applyTemplate,
    getTemplatePreview
  };
}
