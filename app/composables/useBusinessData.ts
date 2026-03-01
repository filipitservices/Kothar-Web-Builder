import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useBusinessStore } from '~/stores/business';
import type { BusinessFieldKey } from '~/stores/business';

/**
 * Composable for accessing and updating global business data.
 * Prefer this over direct store access in components.
 */
export function useBusinessData() {
  const businessStore = useBusinessStore();
  const {
    companyName,
    email,
    telephone,
    address,
    city,
    postalCode,
    website,
    businessHours,
    taxId
  } = storeToRefs(businessStore);

  const fullAddress = computed(() => {
    const parts = [address.value, city.value, postalCode.value].filter(Boolean);
    return parts.join(', ');
  });

  const hasContact = computed(() => {
    return !!(email.value || telephone.value);
  });

  const isComplete = computed(() => {
    return !!(
      companyName.value &&
      email.value &&
      telephone.value &&
      address.value &&
      city.value
    );
  });

  const getField = (fieldName: BusinessFieldKey): string => businessStore.getField(fieldName);

  const updateBusinessInfo = (data: Partial<Record<BusinessFieldKey, string>>) => {
    businessStore.updateBusinessInfo(data);
  };

  return {
    companyName,
    email,
    telephone,
    address,
    city,
    postalCode,
    website,
    businessHours,
    taxId,
    fullAddress,
    hasContact,
    isComplete,
    getField,
    updateBusinessInfo,
  };
}
