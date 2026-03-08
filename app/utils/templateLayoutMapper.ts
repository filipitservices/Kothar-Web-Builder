/**
 * Template Layout Mapper
 *
 * Derives a builder-compatible layout (BlockItem arrays) from a showcase template.
 * Showcase section types are mapped to the closest builder block types so the
 * builder can visualize and manipulate the template's section structure.
 */

import type { BlockItem, BlockType } from '~/types/builder';
import type { ShowcaseTemplate } from '~/stores/showcase';

const SECTION_TO_BLOCK_TYPE: Record<string, BlockType> = {
  hero: 'hero',
  trust: 'credentials',
  services: 'services',
  process: 'process',
  testimonials: 'testimonial',
  stats: 'stats',
  team: 'team',
  gallery: 'gallery',
  pricing: 'pricing',
  cta: 'cta',
  about: 'text',
  features: 'features',
  contact: 'location',
  location: 'location',
  faq: 'faq',
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  trust: 'Trust & Credentials',
  services: 'Services',
  process: 'How It Works',
  testimonials: 'Testimonials',
  stats: 'Stats',
  team: 'Our Team',
  gallery: 'Gallery',
  pricing: 'Pricing',
  cta: 'Call To Action',
  about: 'About Us',
  features: 'Features',
  contact: 'Contact',
  location: 'Location & Hours',
  faq: 'FAQ',
};

function generateBlockId(blockType: string): string {
  return `${blockType}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Create a full block list from a showcase template's section array.
 * Wraps sections with a navbar (top) and footer (bottom).
 */
function createBlocksFromTemplate(template: ShowcaseTemplate): BlockItem[] {
  const blocks: BlockItem[] = [
    { id: generateBlockId('navbar'), type: 'navbar', label: 'Navigation' },
  ];

  for (const section of template.sections) {
    const blockType = SECTION_TO_BLOCK_TYPE[section.type];
    if (blockType) {
      blocks.push({
        id: generateBlockId(blockType),
        type: blockType,
        label: SECTION_LABELS[section.type] ?? section.type,
      });
    }
  }

  blocks.push({ id: generateBlockId('footer'), type: 'footer', label: 'Footer' });

  return blocks;
}

/**
 * Derive desktop and mobile layouts from a showcase template.
 * Each screen gets its own set of block instances with unique IDs.
 */
export function deriveLayoutFromTemplate(template: ShowcaseTemplate): {
  desktop: BlockItem[];
  mobile: BlockItem[];
} {
  return {
    desktop: createBlocksFromTemplate(template),
    mobile: createBlocksFromTemplate(template),
  };
}
