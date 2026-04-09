<template>
  <button
    type="button"
    class="light-switch"
    :class="{ 'is-on': isPlaying }"
    :aria-pressed="isPlaying"
    :title="isPlaying && currentTrack ? currentTrack.title : 'Ambient music'"
    aria-label="Toggle ambient music"
    @click="togglePlayback"
  >
    <span class="switch-rocker" aria-hidden="true">
      <svg class="switch-note" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </span>
    <span class="switch-led" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { useAmbientMusic } from '~/composables/useAmbientMusic';

const { isPlaying, currentTrack, togglePlayback } = useAmbientMusic();
</script>

<style scoped>
/* Wall plate */
.light-switch {
  position: fixed;
  top: calc(83px + var(--space-xl));
  right: var(--space-xl);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 60px;
  padding: 0;
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: 5px;
  cursor: pointer;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.light-switch:hover {
  border-color: var(--color-border-hover);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 6px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.light-switch:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-primary);
  border-color: var(--color-primary);
}

.light-switch.is-on {
  border-color: color-mix(in srgb, var(--color-text-muted-dark) 35%, var(--color-border));
}

/* Rocker paddle */
.switch-rocker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 40px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-hover);
  border-radius: 3px;
  /* Off: bottom of rocker pressed in → top face visible */
  transform: perspective(120px) rotateX(-12deg);
  box-shadow:
    0 3px 5px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(0, 0, 0, 0.06);
  transition:
    transform 0.14s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.14s ease;
}

/* On: charcoal rocker, top pressed in → bottom face visible */
.light-switch.is-on .switch-rocker {
  background: #fef9f4;
  border-color: #d7bd9d;
  transform: perspective(120px) rotateX(12deg);
}

/* Music note icon centered on the rocker */
.switch-note {
  width: 16px;
  height: 16px;
  color: var(--color-border-hover);
  flex-shrink: 0;
  transition: color 0.18s ease, opacity 0.18s ease;
}

.light-switch.is-on .switch-note {
  color: #d8bfa1;
}

/* Indicator LED */
.switch-led {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-border-hover);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

@media (max-width: 768px) {
  .light-switch {
    top: calc(83px - 16px);
    left: var(--space-md);
  }
}
</style>
