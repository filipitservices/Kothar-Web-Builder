<template>
  <section class="sect sect--delivery" aria-labelledby="sect-delivery-title">
    <div class="sect-inner">
      <header class="sect-del-head">
        <h2 id="sect-delivery-title" class="sect-del-title">Your site. Your control.</h2>
        <p class="sect-del-lead">Receive a complete, professionally built website. Edit content anytime, own your data, and keep full control — no lock-in.</p>
      </header>
      <div class="sect-del-cards">
        <div class="sect-del-card">
          <span class="sect-del-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </span>
          <strong class="sect-del-card-title">Full ownership</strong>
          <p class="sect-del-card-desc">Your content and site stay yours. No vendor lock-in.</p>
        </div>
        <div class="sect-del-card">
          <span class="sect-del-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </span>
          <strong class="sect-del-card-title">Edit anytime</strong>
          <p class="sect-del-card-desc">Change copy, images, and structure when you need to.</p>
        </div>
        <div class="sect-del-card">
          <span class="sect-del-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </span>
          <strong class="sect-del-card-title">Ready to go live</strong>
          <p class="sect-del-card-desc">Polished, responsive, and ready for real traffic.</p>
        </div>
      </div>
      <div class="sect-del-outcome">
        <span class="sect-del-outcome-overline" aria-hidden="true">The outcome</span>
        <p class="sect-del-outcome-text">From request to live site — fast, clear, and under your control.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'LandingSectionDelivery' });
</script>

<style scoped>
.sect-del-head {
  text-align: center;
  margin-bottom: var(--landing-spacing-2xl);
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.sect-del-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--landing-primary);
  margin-bottom: var(--landing-spacing);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.sect-del-lead {
  font-size: 1.0625rem;
  line-height: 1.55;
  color: var(--landing-muted);
  margin: 0;
}

.sect-del-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--landing-spacing-xl);
  margin-bottom: var(--landing-spacing-xl);
}

.sect-del-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--landing-spacing-xl);
  background: #fff;
  border: 1px solid var(--landing-border);
  border-radius: var(--landing-radius-lg);
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.06);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.sect-del-card:hover {
  box-shadow: 0 8px 24px rgba(30, 58, 138, 0.12);
  border-color: var(--landing-primary);
}

.sect-del-card-icon {
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--landing-primary-tint);
  color: var(--landing-primary);
  border-radius: var(--landing-radius);
  margin-bottom: var(--landing-spacing);
}

.sect-del-card-icon svg {
  width: 1.375rem;
  height: 1.375rem;
}

.sect-del-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--landing-muted-dark);
  display: block;
  margin-bottom: 0.375rem;
}

.sect-del-card-desc {
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--landing-muted);
  margin: 0;
}

/* Outcome block: milestone statement — crafted, grounded, no left-border cliché */
.sect-del-outcome {
  position: relative;
  overflow: hidden;
  max-width: 40rem;
  margin: 0 auto;
  padding: var(--landing-spacing-xl) var(--landing-spacing-lg);
  text-align: center;
  background: var(--landing-primary-tint);
  border-radius: var(--landing-radius-lg);
  border-top: 2px solid rgba(30, 58, 138, 0.18);
  box-shadow:
    0 2px 12px rgba(30, 58, 138, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.sect-del-outcome::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: radial-gradient(
    circle at center,
    rgba(30, 58, 138, 0.04) 1px,
    transparent 1px
  );
  background-size: 0.625rem 0.625rem;
  pointer-events: none;
}

.sect-del-outcome-overline,
.sect-del-outcome-text {
  position: relative;
  z-index: 1;
}

.sect-del-outcome-overline {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--landing-muted);
  margin-bottom: 0.5rem;
}

.sect-del-outcome-text {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--landing-primary);
  margin: 0;
  letter-spacing: 0.01em;
}

@media (max-width: 900px) {
  .sect-del-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .sect-del-title {
    font-size: 1.375rem;
  }

  .sect-del-card {
    padding: var(--landing-spacing-lg);
  }

  .sect-del-outcome {
    padding: var(--landing-spacing-lg) var(--landing-spacing);
    margin-left: 0;
    margin-right: 0;
  }

  .sect-del-outcome-text {
    font-size: 0.9375rem;
  }
}
</style>
