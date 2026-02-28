<template>
  <section class="sect sect--designers" aria-labelledby="sect-designers-title">
    <div class="sect-inner">
      <header class="sect-d-head">
        <h2 id="sect-designers-title" class="sect-d-title">Our professional designers refine<br />and build it.</h2>
        <p class="sect-d-lead">Real people polish your site. Structured process, quality checks, and clear handoff — no black box.</p>
      </header>
      <div class="sect-d-process">
        <div class="sect-d-step">
          <span class="sect-d-step-num" aria-hidden="true">1</span>
          <div class="sect-d-step-content">
            <strong class="sect-d-step-title">Refinement</strong>
            <p class="sect-d-step-desc">Designers tune layout, typography, and spacing to your brand.</p>
          </div>
          <span class="sect-d-step-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </span>
        </div>
        <div class="sect-d-connector" aria-hidden="true"></div>
        <div class="sect-d-step">
          <span class="sect-d-step-num" aria-hidden="true">2</span>
          <div class="sect-d-step-content">
            <strong class="sect-d-step-title">Quality check</strong>
            <p class="sect-d-step-desc">Every page is reviewed for consistency and clarity.</p>
          </div>
          <span class="sect-d-step-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          </span>
        </div>
        <div class="sect-d-connector" aria-hidden="true"></div>
        <div class="sect-d-step">
          <span class="sect-d-step-num" aria-hidden="true">3</span>
          <div class="sect-d-step-content">
            <strong class="sect-d-step-title">Handoff</strong>
            <p class="sect-d-step-desc">You get a live site and full control to edit anytime.</p>
          </div>
          <span class="sect-d-step-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          </span>
        </div>
      </div>
      <div class="sect-d-badges">
        <span class="sect-d-badge">Structured workflow</span>
        <span class="sect-d-badge">Human review</span>
        <span class="sect-d-badge">Clear delivery</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'LandingSectionDesigners' });
</script>

<style scoped>
.sect-d-head {
  text-align: center;
  margin-bottom: var(--landing-spacing-2xl);
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.sect-d-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--landing-emerald);
  margin-bottom: var(--landing-spacing);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.sect-d-lead {
  font-size: 1.0625rem;
  line-height: 1.55;
  color: var(--landing-muted);
  margin: 0;
}

.sect-d-process {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: start;
  gap: 0;
  margin-bottom: var(--landing-spacing-xl);
}

.sect-d-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--landing-spacing-xl);
  background: #fff;
  border: 1px solid var(--landing-border);
  border-radius: var(--landing-radius-lg);
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.06);
  position: relative;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.sect-d-step:hover {
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.1);
  border-color: var(--landing-emerald);
}

.sect-d-step-num {
  position: absolute;
  top: var(--landing-spacing);
  right: var(--landing-spacing);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: var(--landing-emerald);
  border-radius: 50%;
}

.sect-d-step-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--landing-emerald);
  margin-bottom: var(--landing-spacing);
}

.sect-d-step-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.sect-d-step-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.sect-d-step-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--landing-muted-dark);
  display: block;
}

.sect-d-step-desc {
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--landing-muted);
  margin: 0;
}

.sect-d-connector {
  width: 2rem;
  height: 2px;
  background: var(--landing-border);
  margin-top: 4rem;
  flex-shrink: 0;
}

.sect-d-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--landing-spacing);
}

.sect-d-badge {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--landing-emerald);
  padding: 0.375rem 0.75rem;
  background: var(--landing-emerald-tint);
  border-radius: 999px;
  border: 1px solid rgba(5, 150, 105, 0.2);
}

@media (max-width: 900px) {
  .sect-d-process {
    grid-template-columns: 1fr;
    gap: var(--landing-spacing);
  }

  .sect-d-connector {
    width: 2px;
    height: 2rem;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .sect-d-title {
    font-size: 1.375rem;
  }

  .sect-d-step {
    padding: var(--landing-spacing-lg);
  }
}
</style>
