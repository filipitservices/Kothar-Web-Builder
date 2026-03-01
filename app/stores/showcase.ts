import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Showcase Templates Store
 * 
 * IMPORTANT: This store is COMPLETELY SEPARATE from the builder templates.
 * 
 * These are full, professional website showcases meant to demonstrate
 * finished designs for SMBs. They are NOT block compositions from the builder.
 * Each showcase template represents a complete visual website design that
 * users can request to have built for their business.
 * 
 * Industry Categories:
 * - Local Services: Plumbers, electricians, HVAC, contractors
 * - Professional: Lawyers, accountants, consultants
 * - Creative: Photographers, designers, agencies
 * - Healthcare: Dentists, clinics, therapists
 * - Hospitality: Restaurants, cafes, hotels
 * - Retail: Local shops, boutiques
 */

export type ShowcaseCategory = 
  | 'local-services'
  | 'professional'
  | 'creative'
  | 'healthcare'
  | 'hospitality'
  | 'retail';

export interface ShowcaseSection {
  type: 'hero' | 'services' | 'about' | 'features' | 'testimonials' | 'team' | 'pricing' | 'gallery' | 'contact' | 'cta' | 'faq' | 'stats' | 'process' | 'trust' | 'location';
  data: Record<string, unknown>;
}

export interface ShowcaseTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  category: ShowcaseCategory;
  thumbnail?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  sections: ShowcaseSection[];
}

export const useShowcaseStore = defineStore('showcase', () => {
  /**
   * Full-fledged showcase templates
   * Each template represents a complete, professional website design
   */
  const templates = ref<ShowcaseTemplate[]>([
    // LOCAL SERVICES
    {
      id: 'elite-plumbing',
      name: 'Elite Plumbing & Heating',
      industry: 'Plumbing Services',
      description: 'Professional plumbing business template with emergency services focus, trust badges, and easy contact.',
      category: 'local-services',
      colorScheme: {
        primary: '#1e40af',
        secondary: '#0d9488',
        accent: '#f59e0b',
        background: '#f8fafc',
        text: '#1e293b'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Reliable Plumbing Solutions You Can Trust',
            subheadline: '24/7 Emergency Service • Licensed & Insured • Satisfaction Guaranteed',
            primaryCta: 'Get Free Estimate',
            secondaryCta: 'Call Now',
            phone: '(555) 123-4567',
            backgroundStyle: 'gradient'
          }
        },
        {
          type: 'trust',
          data: {
            badges: ['Licensed & Insured', '25+ Years Experience', '5-Star Rated', 'Same-Day Service'],
            certifications: ['Master Plumber Certified', 'BBB A+ Rating', 'EPA Lead-Safe Certified']
          }
        },
        {
          type: 'services',
          data: {
            title: 'Our Services',
            subtitle: 'Complete plumbing solutions for your home and business',
            items: [
              { name: 'Emergency Repairs', description: 'Fast response when you need it most. Available 24/7.', icon: 'emergency' },
              { name: 'Drain Cleaning', description: 'Professional cleaning for clogged drains and sewer lines.', icon: 'drain' },
              { name: 'Water Heater Service', description: 'Installation, repair, and maintenance for all brands.', icon: 'heater' },
              { name: 'Pipe Repair & Replacement', description: 'Fix leaks and update aging pipes with modern materials.', icon: 'pipe' },
              { name: 'Bathroom Remodeling', description: 'Complete bathroom plumbing for renovations.', icon: 'bathroom' },
              { name: 'Commercial Plumbing', description: 'Reliable service for businesses and properties.', icon: 'commercial' }
            ]
          }
        },
        {
          type: 'process',
          data: {
            title: 'How It Works',
            steps: [
              { number: '1', title: 'Call or Request Online', description: 'Reach out anytime. We respond within minutes.' },
              { number: '2', title: 'Get Free Estimate', description: 'Upfront pricing with no hidden fees.' },
              { number: '3', title: 'Expert Service', description: 'Our certified plumbers complete the job right.' },
              { number: '4', title: 'Satisfaction Guaranteed', description: 'We stand behind every job with our warranty.' }
            ]
          }
        },
        {
          type: 'testimonials',
          data: {
            title: 'What Our Customers Say',
            items: [
              { quote: 'They arrived within an hour of my call and fixed the leak perfectly. Highly recommend!', author: 'Sarah M.', location: 'Downtown', rating: 5 },
              { quote: 'Professional, honest, and affordable. They\'ve been our go-to plumber for 10 years.', author: 'Robert K.', location: 'Westside', rating: 5 },
              { quote: 'Fantastic emergency service. Saved us from a major water damage disaster.', author: 'Jennifer L.', location: 'Northpoint', rating: 5 }
            ]
          }
        },
        {
          type: 'cta',
          data: {
            headline: 'Plumbing Problems? We\'re Here to Help.',
            subheadline: 'Get a free estimate today. No obligation, no pressure.',
            primaryCta: 'Schedule Service',
            phone: '(555) 123-4567'
          }
        },
        {
          type: 'contact',
          data: {
            title: 'Contact Us',
            address: '1234 Service Drive, Your City, ST 12345',
            phone: '(555) 123-4567',
            email: 'info@eliteplumbing.com',
            hours: 'Mon-Fri: 7AM-7PM | Sat: 8AM-4PM | Emergency: 24/7'
          }
        }
      ]
    },
    {
      id: 'premier-electric',
      name: 'Premier Electrical Services',
      industry: 'Electrical Contractor',
      description: 'Modern electrical contractor template emphasizing safety, expertise, and residential/commercial services.',
      category: 'local-services',
      colorScheme: {
        primary: '#0f766e',
        secondary: '#1e40af',
        accent: '#eab308',
        background: '#ffffff',
        text: '#1e293b'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Expert Electrical Services for Every Need',
            subheadline: 'Residential & Commercial • Licensed Electricians • Free Estimates',
            primaryCta: 'Request Quote',
            secondaryCta: 'Our Services',
            backgroundStyle: 'image'
          }
        },
        {
          type: 'services',
          data: {
            title: 'Electrical Solutions',
            items: [
              { name: 'Electrical Panel Upgrades', description: 'Modernize your electrical system for safety and capacity.' },
              { name: 'Wiring & Rewiring', description: 'New construction and renovation electrical work.' },
              { name: 'Lighting Installation', description: 'Indoor, outdoor, and landscape lighting solutions.' },
              { name: 'Generator Installation', description: 'Backup power systems for home and business.' },
              { name: 'EV Charger Installation', description: 'Electric vehicle charging stations installed at your home.' },
              { name: 'Safety Inspections', description: 'Comprehensive electrical safety evaluations.' }
            ]
          }
        },
        {
          type: 'stats',
          data: {
            items: [
              { value: '2,500+', label: 'Projects Completed' },
              { value: '15+', label: 'Years Experience' },
              { value: '100%', label: 'Licensed & Insured' },
              { value: '4.9', label: 'Average Rating' }
            ]
          }
        },
        {
          type: 'testimonials',
          data: {
            title: 'Trusted by Homeowners',
            items: [
              { quote: 'They upgraded our entire panel and the work was impeccable. Very professional team.', author: 'Michael T.', rating: 5 },
              { quote: 'Installed our EV charger quickly and explained everything clearly. Great service!', author: 'Amanda R.', rating: 5 }
            ]
          }
        },
        {
          type: 'cta',
          data: {
            headline: 'Need an Electrician?',
            subheadline: 'Schedule your free consultation today.',
            primaryCta: 'Get Free Quote'
          }
        },
        {
          type: 'contact',
          data: {
            title: 'Get In Touch',
            phone: '(555) 234-5678',
            email: 'service@premierelectric.com',
            hours: 'Mon-Fri: 7AM-6PM | Sat: 8AM-2PM'
          }
        }
      ]
    },

    // PROFESSIONAL SERVICES
    {
      id: 'smith-law',
      name: 'Smith & Associates Law Firm',
      industry: 'Legal Services',
      description: 'Prestigious law firm template with professional imagery, practice areas, and attorney profiles.',
      category: 'professional',
      colorScheme: {
        primary: '#1e3a5f',
        secondary: '#b8860b',
        accent: '#1e3a5f',
        background: '#fafafa',
        text: '#1f2937'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Dedicated Legal Advocacy for You',
            subheadline: 'Over 30 years of experience fighting for our clients\' rights.',
            primaryCta: 'Free Consultation',
            secondaryCta: 'Our Practice Areas',
            backgroundStyle: 'professional'
          }
        },
        {
          type: 'services',
          data: {
            title: 'Practice Areas',
            items: [
              { name: 'Personal Injury', description: 'Aggressive representation for accident victims.' },
              { name: 'Family Law', description: 'Divorce, custody, and family matters handled with care.' },
              { name: 'Criminal Defense', description: 'Protecting your rights when it matters most.' },
              { name: 'Estate Planning', description: 'Wills, trusts, and comprehensive estate plans.' },
              { name: 'Business Law', description: 'Formation, contracts, and litigation support.' },
              { name: 'Real Estate', description: 'Residential and commercial transactions.' }
            ]
          }
        },
        {
          type: 'team',
          data: {
            title: 'Our Attorneys',
            members: [
              { name: 'John Smith, Esq.', title: 'Founding Partner', bio: 'Over 30 years of trial experience.' },
              { name: 'Sarah Johnson, Esq.', title: 'Partner', bio: 'Specializing in family law and mediation.' },
              { name: 'Michael Chen, Esq.', title: 'Associate', bio: 'Criminal defense and civil litigation.' }
            ]
          }
        },
        {
          type: 'testimonials',
          data: {
            title: 'Client Testimonials',
            items: [
              { quote: 'They fought for me when no one else would. I received a settlement that changed my life.', author: 'David M.', rating: 5 },
              { quote: 'Professional, compassionate, and incredibly skilled. Highly recommend for family matters.', author: 'Lisa K.', rating: 5 }
            ]
          }
        },
        {
          type: 'cta',
          data: {
            headline: 'Ready to Discuss Your Case?',
            subheadline: 'Schedule a free, confidential consultation with our team.',
            primaryCta: 'Contact Us Today'
          }
        },
        {
          type: 'contact',
          data: {
            title: 'Contact Our Office',
            address: '500 Main Street, Suite 200, Your City, ST 12345',
            phone: '(555) 345-6789',
            email: 'info@smithlawfirm.com',
            hours: 'Mon-Fri: 8:30AM-5:30PM | Evenings by Appointment'
          }
        }
      ]
    },
    {
      id: 'clear-accounting',
      name: 'ClearPath Accounting',
      industry: 'Accounting & Tax Services',
      description: 'Clean, trustworthy accounting firm template with service breakdowns and credentials.',
      category: 'professional',
      colorScheme: {
        primary: '#166534',
        secondary: '#1e40af',
        accent: '#059669',
        background: '#ffffff',
        text: '#1e293b'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Clear Financial Guidance for Your Business',
            subheadline: 'Certified Public Accountants • Tax Planning • Business Advisory',
            primaryCta: 'Schedule Consultation',
            secondaryCta: 'Our Services'
          }
        },
        {
          type: 'services',
          data: {
            title: 'Our Services',
            items: [
              { name: 'Tax Preparation', description: 'Individual and business tax returns prepared with precision.' },
              { name: 'Bookkeeping', description: 'Monthly financial management and reporting.' },
              { name: 'Business Advisory', description: 'Strategic guidance to grow your business.' },
              { name: 'Payroll Services', description: 'Complete payroll processing and tax compliance.' },
              { name: 'Audit & Assurance', description: 'Independent audits and financial reviews.' },
              { name: 'Estate Planning', description: 'Tax-efficient wealth transfer strategies.' }
            ]
          }
        },
        {
          type: 'trust',
          data: {
            badges: ['CPA Certified', 'QuickBooks ProAdvisor', '20+ Years Experience'],
            certifications: ['AICPA Member', 'State CPA Board Licensed']
          }
        },
        {
          type: 'stats',
          data: {
            items: [
              { value: '500+', label: 'Clients Served' },
              { value: '$10M+', label: 'Taxes Saved' },
              { value: '20+', label: 'Years Experience' },
              { value: '99%', label: 'Client Retention' }
            ]
          }
        },
        {
          type: 'testimonials',
          data: {
            title: 'What Clients Say',
            items: [
              { quote: 'ClearPath saved us thousands in taxes and helped us plan for the future.', author: 'Tech Startup CEO', rating: 5 },
              { quote: 'Professional, responsive, and truly understands small business needs.', author: 'Restaurant Owner', rating: 5 }
            ]
          }
        },
        {
          type: 'contact',
          data: {
            title: 'Get In Touch',
            address: '250 Financial Center, Suite 400',
            phone: '(555) 456-7890',
            email: 'hello@clearpathcpa.com'
          }
        }
      ]
    },
    {
      id: 'apex-consulting',
      name: 'Apex Business Consulting',
      industry: 'Business Consulting',
      description: 'Strategic consulting firm template with case studies, methodology, and expertise areas.',
      category: 'professional',
      colorScheme: {
        primary: '#1e3a8a',
        secondary: '#6366f1',
        accent: '#f59e0b',
        background: '#f8fafc',
        text: '#1e293b'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Transform Your Business. Accelerate Growth.',
            subheadline: 'Strategic consulting for mid-market companies ready to scale.',
            primaryCta: 'Start Your Transformation',
            secondaryCta: 'View Case Studies'
          }
        },
        {
          type: 'services',
          data: {
            title: 'Our Expertise',
            items: [
              { name: 'Strategy Development', description: 'Define your competitive advantage and roadmap.' },
              { name: 'Operations Excellence', description: 'Streamline processes for efficiency and scale.' },
              { name: 'Digital Transformation', description: 'Leverage technology to drive innovation.' },
              { name: 'Change Management', description: 'Navigate organizational transitions successfully.' }
            ]
          }
        },
        {
          type: 'process',
          data: {
            title: 'Our Approach',
            steps: [
              { number: '1', title: 'Discovery', description: 'Deep dive into your business challenges and opportunities.' },
              { number: '2', title: 'Strategy', description: 'Develop actionable plans tailored to your goals.' },
              { number: '3', title: 'Execution', description: 'Implement solutions with hands-on support.' },
              { number: '4', title: 'Optimization', description: 'Measure results and refine for continuous improvement.' }
            ]
          }
        },
        {
          type: 'stats',
          data: {
            items: [
              { value: '150+', label: 'Clients Served' },
              { value: '40%', label: 'Avg. Revenue Growth' },
              { value: '95%', label: 'Client Satisfaction' }
            ]
          }
        },
        {
          type: 'cta',
          data: {
            headline: 'Ready to Grow?',
            subheadline: 'Let\'s discuss how we can help your business thrive.',
            primaryCta: 'Book a Call'
          }
        }
      ]
    },

    // CREATIVE & AGENCIES
    {
      id: 'lens-photography',
      name: 'Lens & Light Photography',
      industry: 'Photography Studio',
      description: 'Elegant photography portfolio template with galleries, packages, and booking.',
      category: 'creative',
      colorScheme: {
        primary: '#171717',
        secondary: '#a3a3a3',
        accent: '#d4a574',
        background: '#ffffff',
        text: '#262626'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Capturing Moments That Last Forever',
            subheadline: 'Wedding • Portrait • Commercial Photography',
            primaryCta: 'View Portfolio',
            secondaryCta: 'Book a Session'
          }
        },
        {
          type: 'gallery',
          data: {
            title: 'Featured Work',
            categories: ['Weddings', 'Portraits', 'Events', 'Commercial'],
            images: [
              { category: 'Weddings', caption: 'Elegant garden ceremony' },
              { category: 'Portraits', caption: 'Professional headshots' },
              { category: 'Events', caption: 'Corporate gala' },
              { category: 'Commercial', caption: 'Product photography' }
            ]
          }
        },
        {
          type: 'services',
          data: {
            title: 'Photography Services',
            items: [
              { name: 'Wedding Photography', description: 'Full-day coverage, engagement sessions, and albums.' },
              { name: 'Portrait Sessions', description: 'Family, individual, and professional headshots.' },
              { name: 'Event Coverage', description: 'Corporate events, parties, and celebrations.' },
              { name: 'Commercial Photography', description: 'Product, architectural, and brand imagery.' }
            ]
          }
        },
        {
          type: 'pricing',
          data: {
            title: 'Packages',
            items: [
              { name: 'Essential', price: '$500', description: '2-hour session, 25 edited photos, online gallery' },
              { name: 'Premium', price: '$1,200', description: '4-hour session, 75 edited photos, prints included' },
              { name: 'Signature', price: '$2,500', description: 'Full-day coverage, 200+ photos, album & prints' }
            ]
          }
        },
        {
          type: 'testimonials',
          data: {
            title: 'Happy Clients',
            items: [
              { quote: 'Our wedding photos are absolutely stunning. She captured every special moment perfectly.', author: 'Emily & James', rating: 5 }
            ]
          }
        },
        {
          type: 'contact',
          data: {
            title: 'Book Your Session',
            email: 'hello@lensandlight.com',
            phone: '(555) 567-8901'
          }
        }
      ]
    },
    {
      id: 'pixel-agency',
      name: 'Pixel Perfect Agency',
      industry: 'Design & Marketing Agency',
      description: 'Bold creative agency template with portfolio, services, and team showcase.',
      category: 'creative',
      colorScheme: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#06b6d4',
        background: '#0f0f0f',
        text: '#f5f5f5'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'We Create Brands That Stand Out',
            subheadline: 'Design • Development • Digital Marketing',
            primaryCta: 'Start a Project',
            secondaryCta: 'Our Work'
          }
        },
        {
          type: 'services',
          data: {
            title: 'What We Do',
            items: [
              { name: 'Brand Identity', description: 'Logos, visual systems, and brand guidelines.' },
              { name: 'Web Design', description: 'Custom websites that convert visitors to customers.' },
              { name: 'Digital Marketing', description: 'SEO, paid ads, and social media strategy.' },
              { name: 'Content Creation', description: 'Photography, video, and copywriting.' }
            ]
          }
        },
        {
          type: 'gallery',
          data: {
            title: 'Selected Work',
            projects: [
              { name: 'TechFlow Rebrand', category: 'Branding' },
              { name: 'Coastal Resort Website', category: 'Web Design' },
              { name: 'GreenLife Campaign', category: 'Marketing' }
            ]
          }
        },
        {
          type: 'process',
          data: {
            title: 'Our Process',
            steps: [
              { number: '01', title: 'Discover', description: 'Understand your brand and goals.' },
              { number: '02', title: 'Design', description: 'Create concepts that resonate.' },
              { number: '03', title: 'Develop', description: 'Build with precision and care.' },
              { number: '04', title: 'Launch', description: 'Deploy and measure success.' }
            ]
          }
        },
        {
          type: 'cta',
          data: {
            headline: 'Have a Project in Mind?',
            subheadline: 'Let\'s create something amazing together.',
            primaryCta: 'Get in Touch'
          }
        }
      ]
    },

    // HEALTHCARE
    {
      id: 'bright-dental',
      name: 'Bright Smile Dental',
      industry: 'Dental Practice',
      description: 'Warm, welcoming dental practice template with services, team, and patient forms.',
      category: 'healthcare',
      colorScheme: {
        primary: '#0891b2',
        secondary: '#0d9488',
        accent: '#fbbf24',
        background: '#ffffff',
        text: '#1e293b'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Healthy Smiles for the Whole Family',
            subheadline: 'Gentle, comprehensive dental care in a comfortable environment.',
            primaryCta: 'Book Appointment',
            secondaryCta: 'Our Services',
            phone: '(555) 678-9012'
          }
        },
        {
          type: 'services',
          data: {
            title: 'Dental Services',
            items: [
              { name: 'General Dentistry', description: 'Cleanings, exams, and preventive care.' },
              { name: 'Cosmetic Dentistry', description: 'Whitening, veneers, and smile makeovers.' },
              { name: 'Restorative Care', description: 'Fillings, crowns, and implants.' },
              { name: 'Pediatric Dentistry', description: 'Kid-friendly care for young patients.' },
              { name: 'Orthodontics', description: 'Invisalign and traditional braces.' },
              { name: 'Emergency Care', description: 'Same-day appointments for urgent needs.' }
            ]
          }
        },
        {
          type: 'team',
          data: {
            title: 'Meet Our Team',
            members: [
              { name: 'Dr. Emily Chen, DDS', title: 'Lead Dentist', bio: '15 years of experience in family dentistry.' },
              { name: 'Dr. Marcus Johnson, DDS', title: 'Cosmetic Specialist', bio: 'Expert in smile transformations.' }
            ]
          }
        },
        {
          type: 'trust',
          data: {
            badges: ['ADA Member', 'Same-Day Appointments', 'Insurance Accepted', 'Financing Available']
          }
        },
        {
          type: 'testimonials',
          data: {
            title: 'Patient Reviews',
            items: [
              { quote: 'The entire staff is wonderful. My kids actually look forward to their dental visits!', author: 'Patricia M.', rating: 5 },
              { quote: 'Best dental experience I\'ve ever had. Gentle, professional, and truly caring.', author: 'Thomas R.', rating: 5 }
            ]
          }
        },
        {
          type: 'location',
          data: {
            title: 'Visit Our Office',
            address: '123 Wellness Way, Suite 100',
            phone: '(555) 678-9012',
            hours: 'Mon-Thu: 8AM-6PM | Fri: 8AM-3PM | Sat: By Appointment'
          }
        }
      ]
    },

    // HOSPITALITY
    {
      id: 'harvest-bistro',
      name: 'Harvest Table Bistro',
      industry: 'Restaurant',
      description: 'Appetizing restaurant template with menu, reservations, and ambiance showcase.',
      category: 'hospitality',
      colorScheme: {
        primary: '#92400e',
        secondary: '#166534',
        accent: '#dc2626',
        background: '#fffbeb',
        text: '#1c1917'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Farm Fresh. Locally Sourced. Deliciously Crafted.',
            subheadline: 'Experience seasonal cuisine made with ingredients from local farms.',
            primaryCta: 'Reserve a Table',
            secondaryCta: 'View Menu'
          }
        },
        {
          type: 'about',
          data: {
            title: 'Our Story',
            content: 'Harvest Table Bistro was born from a passion for simple, honest food. We partner with local farmers to bring the freshest seasonal ingredients to your plate, crafted with care by our talented culinary team.'
          }
        },
        {
          type: 'gallery',
          data: {
            title: 'Our Menu Highlights',
            images: [
              { caption: 'Seasonal Salad' },
              { caption: 'Grass-Fed Steak' },
              { caption: 'Fresh Pasta' },
              { caption: 'Farm Vegetable Plate' }
            ]
          }
        },
        {
          type: 'features',
          data: {
            title: 'Why Dine With Us',
            items: [
              { title: 'Farm to Table', description: 'Ingredients sourced from local farms within 50 miles.' },
              { title: 'Seasonal Menu', description: 'Our menu changes with the seasons for peak freshness.' },
              { title: 'Craft Cocktails', description: 'House-made syrups and locally distilled spirits.' }
            ]
          }
        },
        {
          type: 'testimonials',
          data: {
            items: [
              { quote: 'The best meal I\'ve had in years. Every dish was a work of art.', author: 'Food Critic', rating: 5 }
            ]
          }
        },
        {
          type: 'location',
          data: {
            title: 'Visit Us',
            address: '456 Main Street, Downtown',
            phone: '(555) 789-0123',
            hours: 'Tue-Thu: 5PM-10PM | Fri-Sat: 5PM-11PM | Sun: 10AM-3PM (Brunch)'
          }
        }
      ]
    },

    // RETAIL
    {
      id: 'artisan-boutique',
      name: 'Artisan Home Boutique',
      industry: 'Home Goods Retail',
      description: 'Charming boutique template showcasing curated products and store experience.',
      category: 'retail',
      colorScheme: {
        primary: '#78716c',
        secondary: '#a8a29e',
        accent: '#b45309',
        background: '#fafaf9',
        text: '#1c1917'
      },
      sections: [
        {
          type: 'hero',
          data: {
            headline: 'Curated Goods for Inspired Living',
            subheadline: 'Handcrafted home décor, artisan gifts, and timeless pieces.',
            primaryCta: 'Shop Now',
            secondaryCta: 'Visit Store'
          }
        },
        {
          type: 'gallery',
          data: {
            title: 'Featured Collections',
            categories: ['Living Room', 'Kitchen & Dining', 'Bedroom', 'Gifts']
          }
        },
        {
          type: 'features',
          data: {
            title: 'The Artisan Difference',
            items: [
              { title: 'Handpicked Selection', description: 'Every item curated for quality and design.' },
              { title: 'Local Artisans', description: 'Supporting makers from our community.' },
              { title: 'Gift Wrapping', description: 'Complimentary wrapping on all purchases.' }
            ]
          }
        },
        {
          type: 'testimonials',
          data: {
            items: [
              { quote: 'My favorite shop! Always find something unique and beautiful.', author: 'Customer', rating: 5 }
            ]
          }
        },
        {
          type: 'location',
          data: {
            title: 'Visit Our Store',
            address: '789 Oak Street, Historic District',
            phone: '(555) 890-1234',
            hours: 'Mon-Sat: 10AM-6PM | Sun: 12PM-5PM'
          }
        }
      ]
    }
  ]);

  // Computed getters
  const getAllTemplates = computed(() => templates.value);

  const categories = computed<ShowcaseCategory[]>(() => [
    'local-services',
    'professional', 
    'creative',
    'healthcare',
    'hospitality',
    'retail'
  ]);

  const getTemplateById = (id: string): ShowcaseTemplate | undefined => {
    return templates.value.find(t => t.id === id);
  };

  const getTemplatesByCategory = (category: ShowcaseCategory): ShowcaseTemplate[] => {
    return templates.value.filter(t => t.category === category);
  };

  const getCategoryLabel = (category: ShowcaseCategory): string => {
    const labels: Record<ShowcaseCategory, string> = {
      'local-services': 'Local Services',
      'professional': 'Professional',
      'creative': 'Creative & Agencies',
      'healthcare': 'Healthcare',
      'hospitality': 'Hospitality',
      'retail': 'Retail'
    };
    return labels[category];
  };

  return {
    templates,
    getAllTemplates,
    categories,
    getTemplateById,
    getTemplatesByCategory,
    getCategoryLabel
  };
});
