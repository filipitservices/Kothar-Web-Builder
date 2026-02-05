import { defineStore } from 'pinia';
import { ref } from 'vue';

export type BusinessFieldKey = 
  | 'companyName' 
  | 'email' 
  | 'telephone' 
  | 'address' 
  | 'city' 
  | 'postalCode' 
  | 'website' 
  | 'businessHours' 
  | 'taxId';

export interface BusinessData {
  companyName: string;
  email: string;
  telephone: string;
  address: string;
  city: string;
  postalCode: string;
  website: string;
  businessHours: string;
  taxId: string;
}

export const useBusinessStore = defineStore('business', () => {
  // State
  const companyName = ref('');
  const email = ref('');
  const telephone = ref('');
  const address = ref('');
  const city = ref('');
  const postalCode = ref('');
  const website = ref('');
  const businessHours = ref('');
  const taxId = ref('');

  // Actions
  const updateBusinessInfo = (data: {
    companyName?: string;
    email?: string;
    telephone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    website?: string;
    businessHours?: string;
    taxId?: string;
  }) => {
    if (data.companyName !== undefined) companyName.value = data.companyName;
    if (data.email !== undefined) email.value = data.email;
    if (data.telephone !== undefined) telephone.value = data.telephone;
    if (data.address !== undefined) address.value = data.address;
    if (data.city !== undefined) city.value = data.city;
    if (data.postalCode !== undefined) postalCode.value = data.postalCode;
    if (data.website !== undefined) website.value = data.website;
    if (data.businessHours !== undefined) businessHours.value = data.businessHours;
    if (data.taxId !== undefined) taxId.value = data.taxId;
  };

  const resetBusinessInfo = () => {
    companyName.value = '';
    email.value = '';
    telephone.value = '';
    address.value = '';
    city.value = '';
    postalCode.value = '';
    website.value = '';
    businessHours.value = '';
    taxId.value = '';
  };

  // Type-safe field getter
  const getField = (fieldName: BusinessFieldKey): string => {
    const fields: Record<BusinessFieldKey, typeof companyName> = {
      companyName,
      email,
      telephone,
      address,
      city,
      postalCode,
      website,
      businessHours,
      taxId
    };
    return fields[fieldName].value;
  };

  const getBusinessInfo = () => ({
    companyName: companyName.value,
    email: email.value,
    telephone: telephone.value,
    address: address.value,
    city: city.value,
    postalCode: postalCode.value,
    website: website.value,
    businessHours: businessHours.value,
    taxId: taxId.value,
  });

  return {
    // State
    companyName,
    email,
    telephone,
    address,
    city,
    postalCode,
    website,
    businessHours,
    taxId,
    // Actions
    updateBusinessInfo,
    resetBusinessInfo,
    getBusinessInfo,
    getField,
  };
});
