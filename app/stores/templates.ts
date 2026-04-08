import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { BlockType } from '~/types/builder';

/**
 * Template Store
 * Manages pre-built website layouts (block sequences) for the builder sidebar.
 *
 * Categories describe layout intent for typical SMB sites—not narrow trade labels.
 */

export interface TemplateBlock {
  /** Builder block type; constrained to the canonical BlockType union. */
  type: BlockType;
  label: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category:
    | 'service-led'
    | 'gallery-forward'
    | 'information-first'
    | 'lead-capture'
    | 'portfolio-showcase'
    | 'brochure-story';
  thumbnail?: string;
  blocks: TemplateBlock[];
}

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref<Template[]>([
    {
      id: 'local-contractor',
      name: 'Services & credentials',
      description:
        'Service blocks up front, proof and service area, then reviews and a strong contact path—ideal when credibility and reach matter more than a niche label.',
      category: 'service-led',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Our Services' },
        { type: 'credentials', label: 'Licenses & Certifications' },
        { type: 'location', label: 'Service Area & Hours' },
        { type: 'testimonial', label: 'Customer Reviews' },
        { type: 'cta', label: 'Call To Action' },
        { type: 'form', label: 'Contact Form' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'home-services',
      name: 'Packages & quotes',
      description:
        'Process and pricing before social proof and a quote form—built for estimates, bookings, and clear next steps.',
      category: 'lead-capture',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services Offered' },
        { type: 'process', label: 'How It Works' },
        { type: 'pricing', label: 'Pricing Options' },
        { type: 'testimonial', label: 'Customer Testimonials' },
        { type: 'form', label: 'Request Quote' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'law-firm',
      name: 'Practice & answers',
      description:
        'Practice areas, people, credentials, and FAQ—an information-first flow for firms that sell expertise and reassurance.',
      category: 'information-first',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Practice Areas' },
        { type: 'team', label: 'Our Attorneys' },
        { type: 'credentials', label: 'Bar Admissions & Awards' },
        { type: 'testimonial', label: 'Client Testimonials' },
        { type: 'faq', label: 'Common Legal Questions' },
        { type: 'form', label: 'Free Consultation' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'consulting-firm',
      name: 'Expertise & proof',
      description:
        'Expertise, methodology, logos, team, and results—a brochure-style arc for advisory and professional firms.',
      category: 'brochure-story',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Our Expertise' },
        { type: 'process', label: 'Our Approach' },
        { type: 'logos', label: "Clients We've Served" },
        { type: 'team', label: 'Meet The Team' },
        { type: 'stats', label: 'Results & Impact' },
        { type: 'cta', label: 'Schedule Consultation' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'accounting-firm',
      name: 'Services & assurance',
      description:
        'Straightforward services, certifications, team, and reviews—balanced information layout for compliance-minded visitors.',
      category: 'information-first',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services' },
        { type: 'credentials', label: 'Certifications' },
        { type: 'team', label: 'Our Team' },
        { type: 'testimonial', label: 'Client Reviews' },
        { type: 'form', label: 'Contact Us' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'photography-portfolio',
      name: 'Gallery & booking',
      description:
        'Gallery-forward with services, story, and a form—great when visuals lead and you still need a clear inquiry path.',
      category: 'portfolio-showcase',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Portfolio' },
        { type: 'services', label: 'Photography Services' },
        { type: 'text', label: 'About Me' },
        { type: 'testimonial', label: 'Client Reviews' },
        { type: 'form', label: 'Book Session' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'design-agency',
      name: 'Work & team',
      description:
        'Services, work samples, process, team, and clients—a classic creative portfolio structure.',
      category: 'portfolio-showcase',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'What We Do' },
        { type: 'gallery', label: 'Our Work' },
        { type: 'process', label: 'Our Process' },
        { type: 'team', label: 'The Team' },
        { type: 'logos', label: 'Clients' },
        { type: 'cta', label: 'Start A Project' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'retail-store',
      name: 'Visit & shop',
      description:
        'Benefits, product gallery, store visit, and offers—retail flow without locking you to a single product type.',
      category: 'brochure-story',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'features', label: 'Why Shop With Us' },
        { type: 'gallery', label: 'Products' },
        { type: 'location', label: 'Visit Our Store' },
        { type: 'testimonial', label: 'Customer Reviews' },
        { type: 'cta', label: 'Special Offers' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'online-shop',
      name: 'Catalog & pricing',
      description:
        'Product gallery, value props, pricing, and FAQ—commerce-leaning without implying a specific cart integration.',
      category: 'lead-capture',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Products' },
        { type: 'features', label: 'Why Buy From Us' },
        { type: 'pricing', label: 'Pricing' },
        { type: 'testimonial', label: 'Reviews' },
        { type: 'faq', label: 'Shipping & Returns' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'medical-practice',
      name: 'Care & access',
      description:
        'Treatments, providers, credentials, hours, and patient FAQ—service-led with compliance-friendly structure.',
      category: 'service-led',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services & Treatments' },
        { type: 'team', label: 'Our Providers' },
        { type: 'credentials', label: 'Credentials' },
        { type: 'location', label: 'Location & Hours' },
        { type: 'faq', label: 'Patient FAQ' },
        { type: 'form', label: 'Schedule Appointment' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'wellness-center',
      name: 'Calm & services',
      description:
        'Story-first intro, services, team, and soft conversion—brochure pacing for consultative or care-oriented brands.',
      category: 'brochure-story',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'text', label: 'About Our Practice' },
        { type: 'services', label: 'Services Offered' },
        { type: 'team', label: 'Meet The Team' },
        { type: 'testimonial', label: 'Client Testimonials' },
        { type: 'location', label: 'Location & Contact' },
        { type: 'form', label: 'Book Consultation' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'restaurant',
      name: 'Menu & visit',
      description:
        'Visual menu gallery, story, location, and reservation CTA—image-heavy hospitality layout.',
      category: 'gallery-forward',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Our Menu' },
        { type: 'text', label: 'About Us' },
        { type: 'location', label: 'Visit Us' },
        { type: 'testimonial', label: 'Customer Reviews' },
        { type: 'cta', label: 'Make Reservation' },
        { type: 'footer', label: 'Footer' },
      ],
    },
    {
      id: 'catering-service',
      name: 'Events & catering',
      description:
        'Packages, food gallery, process, and quote form—lead-focused for events and catering inquiries.',
      category: 'lead-capture',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Catering Packages' },
        { type: 'gallery', label: 'Our Dishes' },
        { type: 'process', label: 'How It Works' },
        { type: 'testimonial', label: 'Client Reviews' },
        { type: 'form', label: 'Request Quote' },
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
      'service-led': 'Service & trust',
      'gallery-forward': 'Gallery & visuals',
      'information-first': 'Information & credibility',
      'lead-capture': 'Leads & conversion',
      'portfolio-showcase': 'Portfolio & work',
      'brochure-story': 'Brochure & story',
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
