import type { OrderLayout } from '~/types/order';
import type { TemplateRequestFormData } from '~/types/templateRequest';
import { normalizeLocationData } from '~/utils/requestInputNormalization';

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

export function isValidOrderLayout(value: unknown): value is OrderLayout {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const layout = value as Record<string, unknown>;
  if (typeof layout.customized !== 'boolean' || !Array.isArray(layout.blocks)) return false;
  const hasValidBlocks = layout.blocks.every((block) => {
    if (!block || typeof block !== 'object' || Array.isArray(block)) return false;
    const record = block as Record<string, unknown>;
    return (
      typeof record.id === 'string' &&
      typeof record.type === 'string' &&
      typeof record.label === 'string'
    );
  });
  if (!hasValidBlocks) return false;
  if (layout.builderAnnotations === undefined) return true;
  if (!layout.builderAnnotations || typeof layout.builderAnnotations !== 'object' || Array.isArray(layout.builderAnnotations)) {
    return false;
  }
  const annotations = layout.builderAnnotations as Record<string, unknown>;
  const validateScreen = (screen: unknown): boolean => {
    if (!screen || typeof screen !== 'object' || Array.isArray(screen)) return false;
    const value = screen as Record<string, unknown>;
    if (!Array.isArray(value.strokes) || !Array.isArray(value.textBoxes)) return false;
    return value.textBoxes.every((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
      const box = entry as Record<string, unknown>;
      return (
        typeof box.id === 'string' &&
        typeof box.x === 'number' &&
        typeof box.y === 'number' &&
        typeof box.width === 'number' &&
        typeof box.height === 'number' &&
        typeof box.text === 'string' &&
        typeof box.fontSize === 'number' &&
        typeof box.color === 'string' &&
        (box.emphasis === 'normal' || box.emphasis === 'bold' || box.emphasis === 'italic')
      );
    });
  };
  return (
    annotations.version === 1 &&
    validateScreen(annotations.desktop) &&
    validateScreen(annotations.mobile)
  );
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
    location: normalizeLocationData({
      displayName: data.location.displayName,
      verified: data.location.verified,
      city: data.location.city,
      state: data.location.state,
      country: data.location.country,
      postcode: data.location.postcode,
      lat: data.location.lat,
      lon: data.location.lon
    }),
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
            builderAnnotations: layout.builderAnnotations
              ? {
                  version: 1,
                  desktop: {
                    strokes: [...layout.builderAnnotations.desktop.strokes],
                    textBoxes: layout.builderAnnotations.desktop.textBoxes.map((box) => ({
                      id: box.id,
                      x: box.x,
                      y: box.y,
                      width: box.width,
                      height: box.height,
                      text: box.text,
                      fontSize: box.fontSize,
                      color: box.color,
                      emphasis: box.emphasis,
                    })),
                  },
                  mobile: {
                    strokes: [...layout.builderAnnotations.mobile.strokes],
                    textBoxes: layout.builderAnnotations.mobile.textBoxes.map((box) => ({
                      id: box.id,
                      x: box.x,
                      y: box.y,
                      width: box.width,
                      height: box.height,
                      text: box.text,
                      fontSize: box.fontSize,
                      color: box.color,
                      emphasis: box.emphasis,
                    })),
                  },
                }
              : undefined,
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
