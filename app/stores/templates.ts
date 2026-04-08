import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { BlockType } from '~/types/builder';

/**
 * Template Store
 * Builder wireframe templates: block sequences grouped by **site intent** (what the
 * business needs the site to do), not by niche industry labels.
 */

export interface TemplateBlock {
  type: BlockType;
  label: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category:
    | 'services'
    | 'showcase'
    | 'information'
    | 'conversion'
    | 'trust'
    | 'minimal';
  thumbnail?: string;
  blocks: TemplateBlock[];
}

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref<Template[]>([
    {
      id: 'service-focused',
      name: 'Service & offerings',
      description:
        'Lead with what you do, how it works, proof, and a clear way to reach you—typical for consultants, trades, and local services.',
      category: 'services',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services' },
        { type: 'process', label: 'How it works' },
        { type: 'testimonial', label: 'Testimonials' },
        { type: 'location', label: 'Service area & hours' },
        { type: 'form', label: 'Contact' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'full-marketing',
      name: 'Full marketing site',
      description:
        'A complete single-site flow: offerings, social proof, gallery, pricing questions, and multiple conversion points.',
      category: 'services',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services' },
        { type: 'features', label: 'Highlights' },
        { type: 'gallery', label: 'Gallery' },
        { type: 'testimonial', label: 'Testimonials' },
        { type: 'pricing', label: 'Pricing' },
        { type: 'faq', label: 'FAQ' },
        { type: 'cta', label: 'Call to action' },
        { type: 'form', label: 'Contact' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'showcase-gallery',
      name: 'Showcase & gallery',
      description:
        'Image-forward layout for portfolios, makers, and anyone whose work should carry the first impression.',
      category: 'showcase',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Gallery' },
        { type: 'services', label: 'Offerings' },
        { type: 'text', label: 'About' },
        { type: 'testimonial', label: 'Testimonials' },
        { type: 'form', label: 'Inquire' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'information-first',
      name: 'Information & resources',
      description:
        'Explain, educate, and answer questions before asking for contact—policies, guides, and FAQs up front.',
      category: 'information',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'text', label: 'Overview' },
        { type: 'features', label: 'Key points' },
        { type: 'faq', label: 'FAQ' },
        { type: 'form', label: 'Contact' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'lead-generation',
      name: 'Lead generation',
      description:
        'Focused on conversion: benefits, proof in numbers, strong CTAs, and a short path to your form.',
      category: 'conversion',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'features', label: 'Benefits' },
        { type: 'stats', label: 'By the numbers' },
        { type: 'cta', label: 'Call to action' },
        { type: 'form', label: 'Get in touch' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'landing-one-page',
      name: 'Single-page landing',
      description:
        'One scrolling story: pitch, objection handling, and a single conversion goal—good for campaigns and focused offers.',
      category: 'conversion',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'features', label: 'Value proposition' },
        { type: 'testimonial', label: 'Social proof' },
        { type: 'faq', label: 'FAQ' },
        { type: 'cta', label: 'Primary CTA' },
        { type: 'form', label: 'Sign up / contact' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'trust-credibility',
      name: 'Trust & credibility',
      description:
        'Emphasize legitimacy: certifications, partners, team, and testimonials before the ask.',
      category: 'trust',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'credentials', label: 'Credentials' },
        { type: 'logos', label: 'Partners & clients' },
        { type: 'testimonial', label: 'Testimonials' },
        { type: 'team', label: 'Team' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'compact-presence',
      name: 'Simple presence',
      description:
        'Minimal pages: who you are, what you offer in one breath, and how to contact you.',
      category: 'minimal',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'text', label: 'About' },
        { type: 'form', label: 'Contact' },
        { type: 'footer', label: 'Footer' },
      ],
    },
  ]);

  const getAllTemplates = computed(() => templates.value);

  const getTemplatesByCategory = (category: Template['category']) => {
    return templates.value.filter((t) => t.category === category);
  };

  const getTemplateById = (id: string) => {
    return templates.value.find((t) => t.id === id);
  };

  const categories = computed(() => {
    const cats = new Set(templates.value.map((t) => t.category));
    return Array.from(cats);
  });

  const getCategoryLabel = (category: Template['category']): string => {
    const labels: Record<Template['category'], string> = {
      services: 'Service & offerings',
      showcase: 'Showcase & gallery',
      information: 'Information-first',
      conversion: 'Lead & conversion',
      trust: 'Trust & credibility',
      minimal: 'Simple & compact',
    };
    return labels[category];
  };

  return {
    templates,
    getAllTemplates,
    categories,
    getTemplatesByCategory,
    getTemplateById,
    getCategoryLabel,
  };
});
