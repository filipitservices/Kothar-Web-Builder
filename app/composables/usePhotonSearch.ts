/**
 * Debounced Photon geocoding search composable.
 *
 * Queries the public Photon demo server (https://photon.komoot.io/api).
 * Debounces input at 300 ms and returns up to 5 GeoJSON-based suggestions.
 * Errors are swallowed silently — location verification is a UX helper, not a gate.
 */

import { ref, type Ref } from 'vue';

export interface PhotonSuggestion {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  lat: number;
  lon: number;
}

interface PhotonFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    county?: string;
    district?: string;
    type?: string;
  };
}

interface PhotonResponse {
  type: string;
  features: PhotonFeature[];
}

const PHOTON_API = 'https://photon.komoot.io/api';
const DEBOUNCE_MS = 300;
const MAX_RESULTS = 5;

function featureToSuggestion(feature: PhotonFeature): PhotonSuggestion {
  const p = feature.properties;
  const parts: string[] = [];
  if (p.name) parts.push(p.name);
  if (p.street) {
    const streetPart = p.housenumber ? `${p.street} ${p.housenumber}` : p.street;
    if (!parts.includes(streetPart)) parts.push(streetPart);
  }
  if (p.city && !parts.includes(p.city)) parts.push(p.city);
  if (p.state && !parts.includes(p.state)) parts.push(p.state);
  if (p.country && !parts.includes(p.country)) parts.push(p.country);

  return {
    displayName: parts.join(', ') || 'Unknown location',
    city: p.city,
    state: p.state,
    country: p.country,
    postcode: p.postcode,
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0]
  };
}

export interface UsePhotonSearchReturn {
  results: Ref<readonly PhotonSuggestion[]>;
  isSearching: Ref<boolean>;
  search: (query: string) => void;
  clear: () => void;
}

export function usePhotonSearch(): UsePhotonSearchReturn {
  const results = ref<readonly PhotonSuggestion[]>([]);
  const isSearching = ref(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let abortController: AbortController | null = null;

  function clear(): void {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    abortController?.abort();
    abortController = null;
    results.value = [];
    isSearching.value = false;
  }

  function search(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      clear();
      return;
    }

    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }

    isSearching.value = true;

    debounceTimer = setTimeout(async () => {
      abortController?.abort();
      abortController = new AbortController();

      try {
        const url = `${PHOTON_API}?q=${encodeURIComponent(trimmed)}&limit=${MAX_RESULTS}`;
        const response = await fetch(url, { signal: abortController.signal });
        if (!response.ok) {
          results.value = [];
          return;
        }
        const data = (await response.json()) as PhotonResponse;
        results.value = (data.features ?? []).map(featureToSuggestion);
      } catch {
        // Network errors, aborts, or API issues — silently degrade
        if (!abortController?.signal.aborted) {
          results.value = [];
        }
      } finally {
        isSearching.value = false;
      }
    }, DEBOUNCE_MS);
  }

  return { results, isSearching, search, clear };
}
