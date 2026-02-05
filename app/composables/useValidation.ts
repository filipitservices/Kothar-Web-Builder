import { ref, computed } from 'vue';

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

const businessHoursOptions = [
  '9AM - 5PM',
  '9AM - 6PM',
  '10AM - 6PM',
  '24/7',
  'Custom'
];

export const useValidation = () => {
  const rules: ValidationRules = {
    companyName: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'Company name is required'
      },
      {
        validate: (value: string) => value.trim().length >= 2,
        message: 'Company name must be at least 2 characters'
      }
    ],
    email: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'Email is required'
      },
      {
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Email must be valid'
      }
    ],
    telephone: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'Telephone is required'
      },
      {
        validate: (value: string) => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 7,
        message: 'Telephone must be valid (at least 7 digits)'
      }
    ],
    address: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'Address is required'
      },
      {
        validate: (value: string) => value.trim().length >= 5,
        message: 'Address must be at least 5 characters'
      }
    ],
    city: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'City is required'
      },
      {
        validate: (value: string) => value.trim().length >= 2,
        message: 'City must be at least 2 characters'
      }
    ],
    postalCode: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'Postal code is required'
      },
      {
        validate: (value: string) => value.trim().length >= 3,
        message: 'Postal code must be at least 3 characters'
      }
    ],
    website: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'Website is required'
      },
      {
        validate: (value: string) => /^https?:\/\/.+\..+/.test(value) || value.startsWith('www.') || /^[a-z0-9]+(\.[a-z0-9]+)+$/.test(value),
        message: 'Website must be valid (e.g., example.com or https://example.com)'
      }
    ],
    businessHours: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'Business hours is required'
      }
    ],
    taxId: [
      {
        validate: (value: string) => value.trim().length > 0,
        message: 'Tax ID is required'
      },
      {
        validate: (value: string) => value.trim().length >= 5,
        message: 'Tax ID must be at least 5 characters'
      }
    ]
  };

  const validate = (fieldName: string, value: string): string | null => {
    const fieldRules = rules[fieldName];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    return null;
  };

  const validateAll = (data: Record<string, string>): Record<string, string> => {
    const errors: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      const error = validate(key, value);
      if (error) {
        errors[key] = error;
      }
    }
    return errors;
  };

  return {
    rules,
    validate,
    validateAll,
    businessHoursOptions
  };
};
