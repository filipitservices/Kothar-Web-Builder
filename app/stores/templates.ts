import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Template Store
 * Manages pre-built website templates with block sequences
 *
 * Templates are categorized by design intent and structural pattern
 * rather than specific industries, making them flexible and scalable.
 *
 * When applied, templates create block instances with unique IDs
 * and add them to the target screen (desktop or mobile).
 */

export type TemplateCategory =
  | 'service-showcase'
  | 'professional'
  | 'creative'
  | 'product-focused'
  | 'appointment-based'
  | 'experience';

export interface TemplateBlock {
  type: string;
  label: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  blocks: TemplateBlock[];
}

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref<Template[]>([
    // SERVICE SHOWCASE — Perfect for showcasing services
    {
      id: 'service-authority',
      name: 'Service Authority',
      description: 'Perfect for showcasing services with credentials, reviews, and a strong call to action',
      category: 'service-showcase',
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
      id: 'service-pricing',
      name: 'Service & Pricing',
      description: 'Ideal for service businesses with clear pricing, process steps, and quote requests',
      category: 'service-showcase',
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

    // PROFESSIONAL — Designed for professional portfolios & expert authority
    {
      id: 'expert-authority',
      name: 'Expert Authority',
      description: 'Designed for professionals who need to showcase expertise, credentials, and build trust',
      category: 'professional',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Practice Areas' },
        { type: 'team', label: 'Our Experts' },
        { type: 'credentials', label: 'Credentials & Awards' },
        { type: 'testimonial', label: 'Client Testimonials' },
        { type: 'faq', label: 'Common Questions' },
        { type: 'form', label: 'Free Consultation' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'strategic-consultancy',
      name: 'Strategic Consultancy',
      description: 'Great for consultants and advisors showcasing approach, results, and social proof',
      category: 'professional',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Our Expertise' },
        { type: 'process', label: 'Our Approach' },
        { type: 'logos', label: 'Trusted By' },
        { type: 'team', label: 'Meet The Team' },
        { type: 'stats', label: 'Results & Impact' },
        { type: 'cta', label: 'Schedule Consultation' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'trusted-professional',
      name: 'Trusted Professional',
      description: 'Perfect for credentialed professionals building client trust with team and reviews',
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

    // CREATIVE — Great for visual portfolios & creative work
    {
      id: 'visual-portfolio',
      name: 'Visual Portfolio',
      description: 'Showcase your work with galleries, testimonials, and booking capabilities',
      category: 'creative',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Portfolio' },
        { type: 'services', label: 'Services Offered' },
        { type: 'text', label: 'About Me' },
        { type: 'testimonial', label: 'Client Reviews' },
        { type: 'form', label: 'Book Session' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'creative-showcase',
      name: 'Creative Showcase',
      description: 'Best for creative teams showcasing process, portfolio, and client roster',
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

    // PRODUCT FOCUSED — Best for product-focused businesses
    {
      id: 'product-spotlight',
      name: 'Product Spotlight',
      description: 'Great for highlighting products with location details, reviews, and promotions',
      category: 'product-focused',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'features', label: 'Why Choose Us' },
        { type: 'gallery', label: 'Products' },
        { type: 'location', label: 'Visit Our Store' },
        { type: 'testimonial', label: 'Customer Reviews' },
        { type: 'cta', label: 'Special Offers' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'product-catalog',
      name: 'Product Catalog',
      description: 'Optimized for product showcase with pricing, reviews, and detailed FAQ',
      category: 'product-focused',
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

    // APPOINTMENT BASED — Great for appointment-based businesses
    {
      id: 'practice-booking',
      name: 'Practice & Booking',
      description: 'Great for appointment-based businesses with team, credentials, and scheduling',
      category: 'appointment-based',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Services & Treatments' },
        { type: 'team', label: 'Our Providers' },
        { type: 'credentials', label: 'Credentials' },
        { type: 'location', label: 'Location & Hours' },
        { type: 'faq', label: 'FAQ' },
        { type: 'form', label: 'Schedule Appointment' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'wellness-booking',
      name: 'Wellness & Booking',
      description: 'Designed for wellness and care professionals with consultations and team display',
      category: 'appointment-based',
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

    // EXPERIENCE — Optimized for showcasing experiences & venues
    {
      id: 'venue-experience',
      name: 'Venue & Experience',
      description: 'Perfect for venue-based businesses showcasing atmosphere, menu, and reservations',
      category: 'experience',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'gallery', label: 'Gallery' },
        { type: 'text', label: 'About Us' },
        { type: 'location', label: 'Visit Us' },
        { type: 'testimonial', label: 'Customer Reviews' },
        { type: 'cta', label: 'Make Reservation' },
        { type: 'footer', label: 'Footer' }
      ]
    },
    {
      id: 'event-services',
      name: 'Event Services',
      description: 'Ideal for event-focused businesses with packages, process steps, and quotes',
      category: 'experience',
      blocks: [
        { type: 'navbar', label: 'Navigation' },
        { type: 'hero', label: 'Hero Section' },
        { type: 'services', label: 'Packages' },
        { type: 'gallery', label: 'Our Work' },
        { type: 'process', label: 'How It Works' },
        { type: 'testimonial', label: 'Client Reviews' },
        { type: 'form', label: 'Request Quote' },
        { type: 'footer', label: 'Footer' }
      ]
    }
  ]);

  const getAllTemplates = computed(() => templates.value);

  const getTemplatesByCategory = (category: TemplateCategory) => {
    return templates.value.filter(t => t.category === category);
  };

  const getTemplateById = (id: string) => {
    return templates.value.find(t => t.id === id);
  };

  const categories = computed(() => {
    const cats = new Set(templates.value.map(t => t.category));
    return Array.from(cats);
  });

  const getCategoryLabel = (category: TemplateCategory): string => {
    const labels: Record<TemplateCategory, string> = {
      'service-showcase': 'Service Showcase',
      'professional': 'Professional & Expert',
      'creative': 'Portfolio & Creative',
      'product-focused': 'Product Focused',
      'appointment-based': 'Appointment Based',
      'experience': 'Experience & Venue',
    };
    return labels[category];
  };

  return {
    templates,
    getAllTemplates,
    categories,
    getTemplatesByCategory,
    getTemplateById,
    getCategoryLabel
  };
});
