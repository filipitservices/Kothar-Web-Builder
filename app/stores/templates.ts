import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { BlockType } from '~/types/builder';

/**
 * Template Store
 * Manages pre-built website templates with block sequences
 * 
 * Templates are designed for small and mid-size business use cases
 * organized by industry and business type.
 * 
 * When applied, templates create block instances with unique IDs
 * and add them to the target screen (desktop or mobile).
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
  category: 'local-services' | 'professional' | 'creative' | 'retail' | 'healthcare' | 'hospitality';
  thumbnail?: string;
  blocks: TemplateBlock[];
}

export const useTemplatesStore = defineStore('templates', () => {
  // Industry-specific templates for SMB
  const templates = ref<Template[]>([
    // LOCAL SERVICES (plumbers, electricians, contractors, handymen)
    {
      id: 'local-contractor',
      name: 'Local Contractor',
      description: 'Perfect for plumbers, electricians, HVAC, and home service businesses',
      category: 'local-services',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Our Services' },
        { type: 'credentials', label: 'Licenses & Certifications' },
        { type: 'location', label: 'Service Area & Hours' },
        { type: 'testimonial', label: 'Customer Reviews' },
        { type: 'cta', label: 'Call To Action' },
        { type: 'form', label: 'Contact Form' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'home-services',
      name: 'Home Services',
      description: 'Ideal for cleaning, landscaping, and maintenance services',
      category: 'local-services',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services Offered' },
        { type: 'process', label: 'How It Works' },
        { type: 'pricing', label: 'Pricing Options' },
        { type: 'testimonial', label: 'Customer Testimonials' },
        { type: 'form', label: 'Request Quote' },
        { type: 'footer', label: 'Footer' }
      ]
    },

    // PROFESSIONAL SERVICES (lawyers, accountants, consultants)
    {
      id: 'law-firm',
      name: 'Law Firm',
      description: 'Professional template for attorneys and legal practices',
      category: 'professional',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Practice Areas' },
        { type: 'team', label: 'Our Attorneys' },
        { type: 'credentials', label: 'Bar Admissions & Awards' },
        { type: 'testimonial', label: 'Client Testimonials' },
        { type: 'faq', label: 'Common Legal Questions' },
        { type: 'form', label: 'Free Consultation' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'consulting-firm',
      name: 'Consulting Firm',
      description: 'For business consultants, advisors, and professional services',
      category: 'professional',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Our Expertise' },
        { type: 'process', label: 'Our Approach' },
        { type: 'logos', label: 'Clients We\'ve Served' },
        { type: 'team', label: 'Meet The Team' },
        { type: 'stats', label: 'Results & Impact' },
        { type: 'cta', label: 'Schedule Consultation' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'accounting-firm',
      name: 'Accounting Firm',
      description: 'For CPAs, bookkeepers, and accounting professionals',
      category: 'professional',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services' },
        { type: 'credentials', label: 'Certifications' },
        { type: 'team', label: 'Our Team' },
        { type: 'testimonial', label: 'Client Reviews' },
        { type: 'form', label: 'Contact Us' },
        { type: 'footer', label: 'Footer' }
      ]
    },

    // CREATIVE & AGENCY (designers, photographers, marketing agencies)
    {
      id: 'photography-portfolio',
      name: 'Photography Portfolio',
      description: 'Showcase your work with galleries and testimonials',
      category: 'creative',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Portfolio' },
        { type: 'services', label: 'Photography Services' },
        { type: 'text', label: 'About Me' },
        { type: 'testimonial', label: 'Client Reviews' },
        { type: 'form', label: 'Book Session' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'design-agency',
      name: 'Design Agency',
      description: 'For creative agencies, design studios, and marketing firms',
      category: 'creative',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'What We Do' },
        { type: 'gallery', label: 'Our Work' },
        { type: 'process', label: 'Our Process' },
        { type: 'team', label: 'The Team' },
        { type: 'logos', label: 'Clients' },
        { type: 'cta', label: 'Start A Project' },
        { type: 'footer', label: 'Footer' }
      ]
    },

    // RETAIL & E-COMMERCE (local shops, online stores)
    {
      id: 'retail-store',
      name: 'Retail Store',
      description: 'For local shops, boutiques, and specialty stores',
      category: 'retail',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'features', label: 'Why Shop With Us' },
        { type: 'gallery', label: 'Products' },
        { type: 'location', label: 'Visit Our Store' },
        { type: 'testimonial', label: 'Customer Reviews' },
        { type: 'cta', label: 'Special Offers' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'online-shop',
      name: 'Online Shop',
      description: 'E-commerce focused template with pricing and features',
      category: 'retail',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Products' },
        { type: 'features', label: 'Why Buy From Us' },
        { type: 'pricing', label: 'Pricing' },
        { type: 'testimonial', label: 'Reviews' },
        { type: 'faq', label: 'Shipping & Returns' },
        { type: 'footer', label: 'Footer' }
      ]
    },

    // HEALTHCARE (dentists, therapists, clinics, medical practices)
    {
      id: 'medical-practice',
      name: 'Medical Practice',
      description: 'For dentists, doctors, and healthcare providers',
      category: 'healthcare',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services & Treatments' },
        { type: 'team', label: 'Our Providers' },
        { type: 'credentials', label: 'Credentials' },
        { type: 'location', label: 'Location & Hours' },
        { type: 'faq', label: 'Patient FAQ' },
        { type: 'form', label: 'Schedule Appointment' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'wellness-center',
      name: 'Wellness Center',
      description: 'For therapists, counselors, and wellness professionals',
      category: 'healthcare',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'text', label: 'About Our Practice' },
        { type: 'services', label: 'Services Offered' },
        { type: 'team', label: 'Meet The Team' },
        { type: 'testimonial', label: 'Client Testimonials' },
        { type: 'location', label: 'Location & Contact' },
        { type: 'form', label: 'Book Consultation' },
        { type: 'footer', label: 'Footer' }
      ]
    },

    // HOSPITALITY (restaurants, cafes, hotels, catering)
    {
      id: 'restaurant',
      name: 'Restaurant',
      description: 'Perfect for restaurants, cafes, and food businesses',
      category: 'hospitality',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Our Menu' },
        { type: 'text', label: 'About Us' },
        { type: 'location', label: 'Visit Us' },
        { type: 'testimonial', label: 'Customer Reviews' },
        { type: 'cta', label: 'Make Reservation' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'catering-service',
      name: 'Catering Service',
      description: 'For catering companies and event food services',
      category: 'hospitality',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Catering Packages' },
        { type: 'gallery', label: 'Our Dishes' },
        { type: 'process', label: 'How It Works' },
        { type: 'testimonial', label: 'Client Reviews' },
        { type: 'form', label: 'Request Quote' },
        { type: 'footer', label: 'Footer' }
      ]
    }
  ]);

  /**
   * Get all templates
   */
  const getAllTemplates = computed(() => templates.value);

  /**
   * Get templates by category
   */
  const getTemplatesByCategory = (category: Template['category']) => {
    return templates.value.filter(t => t.category === category);
  };

  /**
   * Get a specific template by ID
   */
  const getTemplateById = (id: string) => {
    return templates.value.find(t => t.id === id);
  };

  /**
   * Get all unique categories
   */
  const categories = computed(() => {
    const cats = new Set(templates.value.map(t => t.category));
    return Array.from(cats);
  });

  /**
   * Get category display names
   */
  const getCategoryLabel = (category: Template['category']): string => {
    const labels: Record<Template['category'], string> = {
      'local-services': 'Local Services',
      'professional': 'Professional Services',
      'creative': 'Creative & Agency',
      'retail': 'Retail & E-commerce',
      'healthcare': 'Healthcare',
      'hospitality': 'Hospitality'
    };
    return labels[category];
  };

  return {
    // State
    templates,
    
    // Getters
    getAllTemplates,
    categories,
    
    // Methods
    getTemplatesByCategory,
    getTemplateById,
    getCategoryLabel
  };
});
