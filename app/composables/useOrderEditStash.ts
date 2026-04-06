import type { OrderLayout } from '~/types/order';
import type { TemplateRequestFormData } from '~/types/templateRequest';

interface OrderEditStashPayload {
  version: 1;
  orderId: string;
  savedAt: string;
  formData: TemplateRequestFormData;
  layout?: OrderLayout;
}

const STASH_KEY_PREFIX = 'order-edit-stash:';

function getStorageKey(orderId: string): string {
  return `${STASH_KEY_PREFIX}${orderId}`;
}

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isValidStashFormData(value: unknown): value is TemplateRequestFormData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  const location = data.location;
  const colors = data.colorCustomization;

  if (!location || typeof location !== 'object' || Array.isArray(location)) return false;
  if (!colors || typeof colors !== 'object' || Array.isArray(colors)) return false;

  const colorRecord = colors as Record<string, unknown>;
  const locationRecord = location as Record<string, unknown>;

  return (
    typeof colorRecord.primary === 'string' &&
    typeof colorRecord.secondary === 'string' &&
    typeof colorRecord.accent === 'string' &&
    typeof colorRecord.background === 'string' &&
    typeof colorRecord.text === 'string' &&
    typeof data.businessName === 'string' &&
    typeof data.preferredUrl === 'string' &&
    typeof data.industry === 'string' &&
    typeof data.customIndustry === 'string' &&
    typeof data.contactName === 'string' &&
    typeof data.email === 'string' &&
    typeof data.phone === 'string' &&
    typeof data.website === 'string' &&
    typeof data.additionalNotes === 'string' &&
    typeof locationRecord.displayName === 'string' &&
    typeof locationRecord.verified === 'boolean' &&
    isStringArray(data.logoAssets) &&
    isStringArray(data.brandAssets) &&
    isStringArray(data.goals) &&
    isStringArray(data.audienceTags) &&
    isStringArray(data.requestCategories)
  );
}

function isValidOrderLayout(value: unknown): value is OrderLayout {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const layout = value as Record<string, unknown>;
  if (typeof layout.customized !== 'boolean' || !Array.isArray(layout.blocks)) return false;
  return layout.blocks.every((block) => {
    if (!block || typeof block !== 'object' || Array.isArray(block)) return false;
    const record = block as Record<string, unknown>;
    return (
      typeof record.id === 'string' &&
      typeof record.type === 'string' &&
      typeof record.label === 'string'
    );
  });
}

function normalizeStashFormData(data: TemplateRequestFormData): TemplateRequestFormData {
  return {
    colorCustomization: { ...data.colorCustomization },
    logoAssets: data.logoAssets.filter((entry) => typeof entry === 'string'),
    logoFiles: [],
    brandAssets: data.brandAssets.filter((entry) => typeof entry === 'string'),
    files: [],
    businessName: data.businessName,
    preferredUrl: data.preferredUrl,
    location: { ...data.location },
    industry: data.industry,
    customIndustry: data.customIndustry,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    website: data.website,
    goals: [...data.goals],
    audienceTags: [...data.audienceTags],
    additionalNotes: data.additionalNotes,
    requestCategories: [...data.requestCategories],
  };
}

export interface UseOrderEditStashReturn {
  saveStash: (orderId: string, formData: TemplateRequestFormData, layout?: OrderLayout) => void;
  loadStash: (orderId: string) => { formData: TemplateRequestFormData; layout?: OrderLayout } | null;
  clearStash: (orderId: string) => void;
}

export function useOrderEditStash(): UseOrderEditStashReturn {
  function saveStash(orderId: string, formData: TemplateRequestFormData, layout?: OrderLayout): void {
    if (!canUseSessionStorage() || !orderId.trim()) return;

    const payload: OrderEditStashPayload = {
      version: 1,
      orderId,
      savedAt: new Date().toISOString(),
      formData: normalizeStashFormData(formData),
      layout: layout
        ? {
            customized: layout.customized,
            blocks: layout.blocks.map((block) => ({
              id: block.id,
              type: block.type,
              label: block.label,
            })),
          }
        : undefined,
    };

    window.sessionStorage.setItem(getStorageKey(orderId), JSON.stringify(payload));
  }

  function loadStash(orderId: string): { formData: TemplateRequestFormData; layout?: OrderLayout } | null {
    if (!canUseSessionStorage() || !orderId.trim()) return null;
    const raw = window.sessionStorage.getItem(getStorageKey(orderId));
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<OrderEditStashPayload>;
      if (parsed.version !== 1 || parsed.orderId !== orderId || !isValidStashFormData(parsed.formData)) {
        clearStash(orderId);
        return null;
      }

      if (parsed.layout !== undefined && !isValidOrderLayout(parsed.layout)) {
        clearStash(orderId);
        return null;
      }

      return {
        formData: normalizeStashFormData(parsed.formData),
        layout: parsed.layout,
      };
    } catch {
      clearStash(orderId);
      return null;
    }
  }

  function clearStash(orderId: string): void {
    if (!canUseSessionStorage() || !orderId.trim()) return;
    window.sessionStorage.removeItem(getStorageKey(orderId));
  }

  return {
    saveStash,
    loadStash,
    clearStash,
  };
}
