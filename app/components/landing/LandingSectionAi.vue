<template>
  <section class="sect sect--ai" aria-labelledby="sect-ai-title">
    <div class="sect-inner">
      <header class="sect-ai-head">
        <h2 id="sect-ai-title" class="sect-ai-title">AI-assisted layout and templates</h2>
        <p class="sect-ai-lead">Choose a direction in seconds. Smart templates and guided layout help you start with a professional structure — no blank canvas.</p>
      </header>
      <div class="sect-ai-flow">
        <div class="sect-ai-card">
          <span class="sect-ai-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/></svg>
          </span>
          <div class="sect-ai-card-body">
            <strong class="sect-ai-card-title">Smart templates</strong>
            <span class="sect-ai-card-desc">Industry-fit starting points</span>
          </div>
        </div>
        <div class="sect-ai-card">
          <span class="sect-ai-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </span>
          <div class="sect-ai-card-body">
            <strong class="sect-ai-card-title">AI-guided layout</strong>
            <span class="sect-ai-card-desc">Structure that converts</span>
          </div>
        </div>
        <div class="sect-ai-card">
          <span class="sect-ai-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
          </span>
          <div class="sect-ai-card-body">
            <strong class="sect-ai-card-title">Instant preview</strong>
            <span class="sect-ai-card-desc">See it before you commit</span>
          </div>
        </div>
        <div class="sect-ai-card">
          <span class="sect-ai-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </span>
          <div class="sect-ai-card-body">
            <strong class="sect-ai-card-title">One-click apply</strong>
            <span class="sect-ai-card-desc">Go live in minutes</span>
          </div>
        </div>
      </div>
      <div class="sect-ai-bar">
        <span class="sect-ai-bar-label">From idea to structure</span>
        <div class="sect-ai-bar-line" aria-hidden="true"><span class="sect-ai-bar-dot"></span><span class="sect-ai-bar-dot"></span><span class="sect-ai-bar-dot"></span></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'LandingSectionAi' });
</script>

<style scoped>
.sect-ai-head {
  text-align: center;
  margin-bottom: var(--landing-spacing-2xl);
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.sect-ai-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--landing-violet);
  margin-bottom: var(--landing-spacing);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.sect-ai-lead {
  font-size: 1.0625rem;
  line-height: 1.55;
  color: var(--landing-muted);
  margin: 0;
}

.sect-ai-flow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--landing-spacing-lg);
  margin-bottom: var(--landing-spacing-xl);
}

.sect-ai-card {
  display: flex;
  align-items: flex-start;
  gap: var(--landing-spacing);
  padding: var(--landing-spacing-lg);
  background: #fff;
  border: 1px solid var(--landing-border);
  border-radius: var(--landing-radius-lg);
  box-shadow: 0 2px 8px rgba(91, 33, 182, 0.06);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.sect-ai-card:hover {
  box-shadow: 0 8px 24px rgba(91, 33, 182, 0.12);
  transform: translateY(-2px);
}

.sect-ai-card-icon {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--landing-violet-tint);
  color: var(--landing-violet);
  border-radius: var(--landing-radius);
}

.sect-ai-card-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.sect-ai-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.sect-ai-card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--landing-muted-dark);
  display: block;
}

.sect-ai-card-desc {
  font-size: 0.8125rem;
  color: var(--landing-muted);
}

.sect-ai-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--landing-spacing);
  padding-top: var(--landing-spacing);
  border-top: 1px dashed var(--landing-border);
}

.sect-ai-bar-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--landing-muted);
}

.sect-ai-bar-line {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sect-ai-bar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--landing-violet);
  opacity: 0.6;
}

.sect-ai-bar-dot:nth-child(2) {
  opacity: 1;
  transform: scale(1.2);
}

@media (max-width: 900px) {
  .sect-ai-flow {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .sect-ai-title {
    font-size: 1.375rem;
  }

  .sect-ai-flow {
    grid-template-columns: 1fr;
    gap: var(--landing-spacing);
  }

  .sect-ai-card {
    padding: var(--landing-spacing);
  }
}
</style>
