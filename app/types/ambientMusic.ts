/**
 * Shared types for the ambient music playlist API and Pinia store.
 */

export interface AmbientTrackDto {
  pathSegment: string;
  url: string;
  title: string;
}

export interface AmbientTracksApiResponse {
  tracks: AmbientTrackDto[];
}

/** Client/store copy of a playlist entry (immutable fields). */
export interface AmbientTrack {
  pathSegment: string;
  url: string;
  title: string;
}

export type AmbientMusicLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
