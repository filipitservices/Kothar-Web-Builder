import { ref, readonly, computed } from 'vue';
import type { AmbientTrack } from '~/types/ambientMusic';

/**
 * Ordered track list derived from public/audio/ (alphabetical by filename).
 * Filenames contain codec tags, unicode punctuation, and live annotations that
 * make algorithmic title extraction unreliable, so titles are curated manually.
 * URLs are encoded at module init so encodeURIComponent runs once, not per render.
 */
const TRACK_DEFINITIONS: ReadonlyArray<{ file: string; title: string }> = [
  {
    file: 'Days of Wine and Roses (128kbit_AAC).m4a',
    title: 'Days of Wine and Roses',
  },
  {
    file: "' Autumn Leaves ' Chet Baker - Paul Desmond (128kbit_AAC).m4a",
    title: 'Autumn Leaves – Chet Baker & Paul Desmond',
  },
  {
    file: 'Bill Evans -  All The Things You Are (152kbit_Opus).opus',
    title: 'All the Things You Are – Bill Evans',
  },
  {
    file: 'Bill Evans - 9. On Green Dolphin Street [Live] (128kbit_AAC).m4a',
    title: 'On Green Dolphin Street – Bill Evans',
  },
  {
    file: 'Bill Evans Blue in Green (152kbit_Opus).opus',
    title: 'Blue in Green – Bill Evans',
  },
  {
    file: "Chet Baker & Paul Bley -Diane  ' If I should lose you '  Ph R. Dumas Chet & Diane Vavra Rennes '87 (152kbit_Opus).opus",
    title: 'If I Should Lose You – Chet Baker & Paul Bley',
  },
  {
    file: 'Chet Baker - I Remember You (128kbit_AAC).m4a',
    title: 'I Remember You – Chet Baker',
  },
  {
    file: 'Chet Baker - Time After Time (128kbit_AAC).m4a',
    title: 'Time After Time – Chet Baker',
  },
  {
    file: 'Clementi - Sonatina in C major, Op. 36 No. 1 (Complete),  Allegro - Andante - Vivace (128kbit_AAC).m4a',
    title: 'Sonatina in C Major, Op. 36 No. 1 – Clementi',
  },
  {
    file: 'Clifford Brown - Embraceable You (128kbit_AAC).m4a',
    title: 'Embraceable You – Clifford Brown',
  },
  {
    file: 'Ella Fitzgerald & Louis Armstrong-Dream A Little dream of me (subtitulada) (128kbit_AAC).m4a',
    title: 'Dream a Little Dream of Me – Ella Fitzgerald & Louis Armstrong',
  },
  {
    file: 'Erik Satie - Gymnopédie No.1 (128kbit_AAC).m4a',
    title: 'Gymnopédie No. 1 – Erik Satie',
  },
  {
    file: 'Four (128kbit_AAC).m4a',
    title: 'Four',
  },
  {
    file: 'Frank Sinatra - The Girl From Ipanema ft. Antonio Carlos Jobim ¦ A Man And His Music (1967) (128kbit_AAC).m4a',
    title: 'The Girl from Ipanema – Frank Sinatra',
  },
  {
    file: 'Herbie Hancock - Cantaloupe Island (128kbit_AAC).m4a',
    title: 'Cantaloupe Island – Herbie Hancock',
  },
  {
    file: 'Herbie Hancock - Maiden Voyage (128kbit_AAC).m4a',
    title: 'Maiden Voyage – Herbie Hancock',
  },
  {
    file: 'Joe Henderson  -  Blue Bossa (128kbit_AAC).m4a',
    title: 'Blue Bossa – Joe Henderson',
  },
  {
    file: 'Just Friends (Remastered) (128kbit_AAC).m4a',
    title: 'Just Friends',
  },
  {
    file: 'Miles Davis - Tune Up (128kbit_AAC).m4a',
    title: 'Tune Up – Miles Davis',
  },
  {
    file: "Miles Davis - Well You Needn't (128kbit_AAC).m4a",
    title: "Well You Needn't – Miles Davis",
  },
  {
    file: 'Night in Tunisia (128kbit_AAC).m4a',
    title: 'A Night in Tunisia',
  },
  {
    file: 'Relaxing Drum Music from Best Relaxing Music (instrumental background) (128kbit_AAC).m4a',
    title: 'Relaxing Drum Music',
  },
  {
    file: 'Someday My Prince Will Come\u2044Bill Evans Trio (1960) #Public domain (128kbit_AAC).m4a',
    title: 'Someday My Prince Will Come – Bill Evans Trio',
  },
  {
    file: 'Stan Getz & Bill Evans - Night And Day (128kbit_AAC).m4a',
    title: 'Night and Day – Stan Getz & Bill Evans',
  },
  {
    file: 'Teddy Wilson  Trio - All of me (128kbit_AAC).m4a',
    title: 'All of Me – Teddy Wilson Trio',
  },
  {
    file: 'Thelonious Monk - Blue Monk (128kbit_AAC).m4a',
    title: 'Blue Monk – Thelonious Monk',
  },
  {
    file: 'Till There Was You - The Beatles (piano solo) (160kbit_Opus).opus',
    title: 'Till There Was You – The Beatles',
  },
];

const AMBIENT_TRACKS: AmbientTrack[] = TRACK_DEFINITIONS.map(({ file, title }) => ({
  pathSegment: file,
  url: `/audio/${encodeURIComponent(file)}`,
  title,
}));

// ── Module-level singleton state ──────────────────────────────────────────────
// These refs live at module scope so all composable consumers share the same
// reactive state without prop-drilling or a separate Pinia store.
const isPlaying = ref(false);
const currentTrackIndex = ref(0);

// The single HTMLAudioElement instance. Created lazily on first client play.
let _audio: HTMLAudioElement | null = null;

function getOrCreateAudio(): HTMLAudioElement {
  if (_audio) return _audio;

  _audio = new Audio();

  // When a track finishes playing naturally, advance to the next one.
  // Browsers permit play() inside ended handlers because the user initiated
  // playback earlier in the same gesture chain.
  _audio.addEventListener('ended', () => {
    if (!_audio) return;
    const nextIndex = (currentTrackIndex.value + 1) % AMBIENT_TRACKS.length;
    currentTrackIndex.value = nextIndex;
    const nextTrack = AMBIENT_TRACKS[nextIndex];
    if (!nextTrack) return;
    _audio.src = nextTrack.url;
    _audio.play().catch(() => {
      isPlaying.value = false;
    });
  });

  return _audio;
}

// ── Public composable ─────────────────────────────────────────────────────────

export function useAmbientMusic() {
  const currentTrack = computed<AmbientTrack | null>(
    () => AMBIENT_TRACKS[currentTrackIndex.value] ?? null
  );

  /**
   * Toggle playback on/off. Must be called from a user interaction handler
   * (click, keypress) so the browser permits the Audio.play() call.
   */
  async function togglePlayback(): Promise<void> {
    if (!import.meta.client) return;

    if (isPlaying.value) {
      const audio = getOrCreateAudio();
      audio.pause();
      isPlaying.value = false;
      return;
    }

    const audio = getOrCreateAudio();
    const track = AMBIENT_TRACKS[currentTrackIndex.value];
    if (!track) return;

    // Only assign src when the element has no source yet (fresh or after reset).
    // If src is already set (e.g. resuming after pause), leave it so playback
    // continues from the paused position rather than restarting the track.
    if (!audio.src) {
      audio.src = track.url;
    }

    try {
      await audio.play();
      isPlaying.value = true;
    } catch {
      // NotAllowedError: browser blocked play (autoplay policy violation).
      // Any other error: malformed src, network issue, etc. In both cases
      // we stay in the stopped state and surface nothing — the button just
      // does not activate. The user can try again.
      isPlaying.value = false;
    }
  }

  return {
    isPlaying: readonly(isPlaying),
    currentTrack,
    tracks: AMBIENT_TRACKS as readonly AmbientTrack[],
    currentTrackIndex: readonly(currentTrackIndex),
    togglePlayback,
  };
}
