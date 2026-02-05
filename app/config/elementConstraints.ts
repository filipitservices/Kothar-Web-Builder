/**
 * Element Constraints Configuration
 * 
 * Defines metadata for each element type, including:
 * - Whether it should appear only once per screen
 * - Maximum number of instances allowed
 * - Positioning requirements (top/middle/bottom)
 * 
 * This is the single source of truth for element behavior.
 * More scalable and maintainable than hardcoding lists.
 */

export interface ElementConstraintConfig {
  type: string;
  label: string;
  unique?: boolean;           // Only one instance per screen
  maxInstances?: number;      // Maximum allowed instances (overrides unique if specified)
  position?: 'top' | 'bottom'; // Fixed positioning requirement
}

export const ELEMENT_CONSTRAINTS: ElementConstraintConfig[] = [
  // Structural elements - always unique with fixed positioning
  {
    type: 'navbar',
    label: 'Navigation',
    unique: true,
    position: 'top'
  },
  {
    type: 'footer',
    label: 'Footer',
    unique: true,
    position: 'bottom'
  },

  // Header/Hero - should appear once
  {
    type: 'header',
    label: 'Section Header',
    maxInstances: 6
  },
  {
    type: 'hero',
    label: 'Hero Section',
    unique: true
  },

  // Core content - typically one per screen
  {
    type: 'cta',
    label: 'Call to Action',
    unique: true
  },
  {
    type: 'process',
    label: 'Process / Steps',
    unique: true
  },
  {
    type: 'team',
    label: 'Team',
    unique: true
  },
  {
    type: 'contact',
    label: 'Contact Info',
    unique: true
  },
  {
    type: 'form',
    label: 'Contact Form',
    unique: true
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    unique: true
  },
  {
    type: 'stats',
    label: 'Statistics',
    unique: true
  },
  {
    type: 'gallery',
    label: 'Gallery',
    unique: true
  },
  {
    type: 'faq',
    label: 'FAQ',
    unique: true
  },
  {
    type: 'pricing',
    label: 'Pricing',
    unique: true
  },

  // Content that can appear multiple times
  {
    type: 'features',
    label: 'Features',
    maxInstances: 2  // Allow up to 2 features sections for variety
  },
  {
    type: 'text',
    label: 'Text Block',
    maxInstances: 999  // Practically unlimited for flexible content
  }
];

/**
 * Get constraint config for an element type
 */
export function getElementConstraint(type: string): ElementConstraintConfig | undefined {
  return ELEMENT_CONSTRAINTS.find(c => c.type === type);
}

/**
 * Check if an element type should be unique
 */
export function isElementUnique(type: string): boolean {
  const config = getElementConstraint(type);
  return config?.unique ?? false;
}

/**
 * Get max instances allowed for an element type
 * Returns 1 if unique, maxInstances if defined, or Infinity otherwise
 */
export function getMaxInstances(type: string): number {
  const config = getElementConstraint(type);
  if (config?.maxInstances !== undefined) {
    return config.maxInstances;
  }
  if (config?.unique) {
    return 1;
  }
  return Infinity;
}

/**
 * Get positioning constraint for an element type
 */
export function getElementPosition(type: string): 'top' | 'bottom' | undefined {
  const config = getElementConstraint(type);
  return config?.position;
}
