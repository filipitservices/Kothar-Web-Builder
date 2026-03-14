/**
 * Live Sites Store
 *
 * Holds state for websites that have been delivered and are "live."
 * Live sites are managed via the control panel (/sites/:id), not the builder.
 * The builder is for design selection and request flow only; it cannot rebuild live sites.
 *
 * No backend integration yet — in-memory state only.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/** Status shown to the user in SME-friendly language */
export type SiteStatus = 'live' | 'updating' | 'pending-review';

export interface SiteSummary {
  id: string;
  businessName: string;
  /** Display domain or placeholder label when no custom domain yet */
  domainLabel: string;
  status: SiteStatus;
  /** ISO date string */
  lastUpdatedAt: string;
  industry: string;
}

export interface BusinessHoursEntry {
  days: string;
  hours: string;
}

export interface SiteDetails {
  id: string;
  businessName: string;
  domainLabel: string;
  status: SiteStatus;
  lastUpdatedAt: string;
  industry: string;
  /** Hero section */
  hero: {
    headline: string;
    subline: string;
    ctaText: string;
    imageUrl: string;
  };
  /** Services or main offerings */
  services: Array<{ name: string; description: string }>;
  /** Contact */
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  /** Business hours (e.g. "Mon–Fri 9am–5pm") */
  businessHours: BusinessHoursEntry[];
  /** Seasonal or promotional announcement banner */
  seasonalAnnouncement: {
    enabled: boolean;
    text: string;
  };
}

const INITIAL_SITE: SiteDetails = {
  id: 'site-riverside-plumbing',
  businessName: 'Riverside Plumbing & Heating',
  domainLabel: 'riverside-plumbing.example.com',
  status: 'live',
  lastUpdatedAt: '2026-02-20T14:30:00Z',
  industry: 'Plumbing & HVAC',
  hero: {
    headline: 'Reliable Plumbing When You Need It',
    subline: '24/7 emergency service • Licensed & insured • Serving the area since 2010',
    ctaText: 'Request a Free Estimate',
    imageUrl: '',
  },
  services: [
    { name: 'Emergency Repairs', description: 'Fast response for urgent plumbing issues, day or night.' },
    { name: 'Drain Cleaning', description: 'Professional clearing for clogged drains and sewer lines.' },
    { name: 'Water Heaters', description: 'Installation, repair, and maintenance for all types.' },
    { name: 'Pipe Repair', description: 'Leak detection and pipe replacement with modern materials.' },
  ],
  contact: {
    phone: '(555) 234-5678',
    email: 'info@riversideplumbing.example.com',
    address: '123 Main St, Riverside, CA 92501',
  },
  businessHours: [
    { days: 'Mon – Fri', hours: '8:00 AM – 6:00 PM' },
    { days: 'Sat', hours: '9:00 AM – 2:00 PM' },
    { days: 'Sun', hours: 'Emergency only' },
  ],
  seasonalAnnouncement: {
    enabled: true,
    text: 'Spring tune-up special: 15% off water heater maintenance. Book by March 31.',
  },
};

export const useSitesStore = defineStore('sites', () => {
  const sites = ref<SiteDetails[]>([{ ...INITIAL_SITE }]);

  const siteSummaries = computed<SiteSummary[]>(() =>
    sites.value.map((s) => ({
      id: s.id,
      businessName: s.businessName,
      domainLabel: s.domainLabel,
      status: s.status,
      lastUpdatedAt: s.lastUpdatedAt,
      industry: s.industry,
    }))
  );

  function getSiteById(id: string): SiteDetails | undefined {
    return sites.value.find((s) => s.id === id);
  }

  function updateSite(id: string, updates: Omit<Partial<SiteDetails>, 'id'>): void {
    const index = sites.value.findIndex((s) => s.id === id);
    if (index === -1) return;
    const current = sites.value[index] as SiteDetails | undefined;
    if (!current) return;
    const next: SiteDetails = {
      id: current.id,
      businessName: updates.businessName ?? current.businessName,
      domainLabel: updates.domainLabel ?? current.domainLabel,
      status: updates.status ?? current.status,
      industry: updates.industry ?? current.industry,
      hero: updates.hero ? { ...current.hero, ...updates.hero } : current.hero,
      services: updates.services ? [...updates.services] : current.services,
      contact: updates.contact ? { ...current.contact, ...updates.contact } : current.contact,
      businessHours: updates.businessHours ? [...updates.businessHours] : current.businessHours,
      seasonalAnnouncement: updates.seasonalAnnouncement
        ? { ...current.seasonalAnnouncement, ...updates.seasonalAnnouncement }
        : current.seasonalAnnouncement,
      lastUpdatedAt: new Date().toISOString(),
    };
    sites.value = [
      ...sites.value.slice(0, index),
      next,
      ...sites.value.slice(index + 1),
    ];
  }

  function updateSiteHero(id: string, hero: Partial<SiteDetails['hero']>): void {
    const site = getSiteById(id);
    if (!site) return;
    updateSite(id, { hero: { ...site.hero, ...hero } });
  }

  function updateSiteContact(id: string, contact: Partial<SiteDetails['contact']>): void {
    const site = getSiteById(id);
    if (!site) return;
    updateSite(id, { contact: { ...site.contact, ...contact } });
  }

  function updateSiteBusinessHours(id: string, businessHours: BusinessHoursEntry[]): void {
    updateSite(id, { businessHours: [...businessHours] });
  }

  function updateSiteSeasonalAnnouncement(id: string, seasonalAnnouncement: Partial<SiteDetails['seasonalAnnouncement']>): void {
    const site = getSiteById(id);
    if (!site) return;
    updateSite(id, { seasonalAnnouncement: { ...site.seasonalAnnouncement, ...seasonalAnnouncement } });
  }

  function updateSiteServices(id: string, services: SiteDetails['services']): void {
    updateSite(id, { services: [...services] });
  }

  /** User-friendly status label for UI */
  function getStatusLabel(status: SiteStatus): string {
    const labels: Record<SiteStatus, string> = {
      live: 'Live',
      updating: 'Updates in progress',
      'pending-review': 'Pending review',
    };
    return labels[status];
  }

  /** Formatted last updated for display */
  function formatLastUpdated(isoDate: string): string {
    const d = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 7) return `Updated ${diffDays} days ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return {
    sites,
    siteSummaries,
    getSiteById,
    updateSite,
    updateSiteHero,
    updateSiteContact,
    updateSiteBusinessHours,
    updateSiteSeasonalAnnouncement,
    updateSiteServices,
    getStatusLabel,
    formatLastUpdated,
  };
});
