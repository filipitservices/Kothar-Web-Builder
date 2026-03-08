import { useTemplatesStore } from '~/stores/templates';
import type { Ref } from 'vue';
import type { BlockItem, TemplateBlock } from '~/types/builder';

/**
 * Template Application Composable
 *
 * Handles applying templates to desktop/mobile screens.
 * Pure state transformation: replaces list refs; no direct DOM manipulation.
 *
 * Two entry points:
 *   - applyTemplate(templateId, screen) — looks up a builder template by id.
 *   - applyBlocks(blocks, screen) — accepts a TemplateBlock[] directly,
 *     allowing any source (builder templates, showcase templates, etc.)
 *     to initialize the builder through the same code path.
 */

interface UseTemplateApplicationParams {
  desktopList: Ref<BlockItem[]>;
  mobileList: Ref<BlockItem[]>;
}

export function useTemplateApplication(params: UseTemplateApplicationParams) {
  const { desktopList, mobileList } = params;
  const templatesStore = useTemplatesStore();

  const generateBlockId = (blockType: string): string => {
    return `${blockType}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  };

  const createBlockItem = (templateBlock: TemplateBlock): BlockItem => {
    return {
      id: generateBlockId(templateBlock.type),
      type: templateBlock.type,
      label: templateBlock.label
    };
  };

  /**
   * Apply a raw block array to the target screen(s).
   * This is the core state transformation — every other method delegates here.
   */
  const applyBlocks = (
    blocks: TemplateBlock[],
    screen: 'desktop' | 'mobile' | 'both'
  ): void => {
    if (screen === 'both') {
      desktopList.value = blocks.map(createBlockItem);
      mobileList.value = blocks.map(createBlockItem);
    } else if (screen === 'desktop') {
      desktopList.value = blocks.map(createBlockItem);
    } else {
      mobileList.value = blocks.map(createBlockItem);
    }
  };

  /**
   * Look up a builder template by id and apply it.
   * Returns false if the template is not found.
   */
  const applyTemplate = (
    templateId: string,
    screen: 'desktop' | 'mobile' | 'both'
  ): boolean => {
    const template = templatesStore.getTemplateById(templateId);

    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return false;
    }

    applyBlocks(template.blocks, screen);
    return true;
  };

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
    applyBlocks,
    getTemplatePreview
  };
}
