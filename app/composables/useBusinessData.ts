import { computed } from 'vue';
import { useBusinessStore } from '~/stores/business';

/**
 * Composable for accessing global business data
 * Provides reactive access to company information
 * 
 * Usage:
 * const { companyName, email, fullAddress, hasContact } = useBusinessData();
 * 
 * Benefits:
 * - Decouples components from store structure
 * - Provides computed helpers (fullAddress, hasContact, isComplete)
 * - Easy to mock for testing
 * - Type-safe access
 */
export function useBusinessData() {
  const businessStore = useBusinessStore();

  // Direct access to all business fields
  const companyName = computed(() => businessStore.companyName);
  const email = computed(() => businessStore.email);
  const telephone = computed(() => businessStore.telephone);
  const address = computed(() => businessStore.address);
  const city = computed(() => businessStore.city);
  const postalCode = computed(() => businessStore.postalCode);
  const website = computed(() => businessStore.website);
  const businessHours = computed(() => businessStore.businessHours);
  const taxId = computed(() => businessStore.taxId);

  // Computed helpers
  const fullAddress = computed(() => {
    const parts = [
      businessStore.address,
      businessStore.city,
      businessStore.postalCode
    ].filter(Boolean);
    return parts.join(', ');
  });

  const hasContact = computed(() => {
    return !!(businessStore.email || businessStore.telephone);
  });

  const isComplete = computed(() => {
    return !!(
      businessStore.companyName &&
      businessStore.email &&
      businessStore.telephone &&
      businessStore.address &&
      businessStore.city
    );
  });

  return {
    // Individual fields
    companyName,
    email,
    telephone,
    address,
    city,
    postalCode,
    website,
    businessHours,
    taxId,
    // Computed helpers
    fullAddress,
    hasContact,
    isComplete
  };
}
