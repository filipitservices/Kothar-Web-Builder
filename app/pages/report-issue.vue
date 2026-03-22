<!--
  Report an issue — auth-only; linked from UserMenu only (not global nav).
-->
<template>
  <div class="report-issue">
    <main class="report-issue__main">
      <div class="report-issue__inner">
        <header class="report-issue__header">
          <h1 class="report-issue__title">Report an issue</h1>
          <p class="report-issue__lead">
            Tell us what went wrong or what we could improve. Your message is sent securely and only used to
            help fix problems or follow up when needed.
          </p>
        </header>

        <div class="report-issue__card">
          <form class="report-issue__form" @submit.prevent="onSubmit">
            <div class="form-group">
              <label class="form-label" for="issue-category">Category</label>
              <select
                id="issue-category"
                v-model="category"
                class="form-select report-issue__select"
                required
                :disabled="isSubmitting"
              >
                <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="issue-message">
                Description <span class="required" aria-hidden="true">*</span>
              </label>
              <textarea
                id="issue-message"
                v-model="message"
                class="form-textarea"
                rows="8"
                required
                maxlength="4000"
                placeholder="What happened? What did you expect? Steps to reproduce help a lot."
                :disabled="isSubmitting"
                aria-describedby="issue-message-hint"
              />
              <p id="issue-message-hint" class="report-issue__hint">
                Up to 4,000 characters.
              </p>
            </div>

            <div class="report-issue__actions">
              <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Sending…' : 'Send report' }}
              </button>
            </div>
          </form>

          <div class="report-issue__meta" aria-labelledby="report-meta-heading">
            <h2 id="report-meta-heading" class="report-issue__meta-title">Included with your report</h2>
            <dl class="report-issue__meta-list">
              <dt>Page</dt>
              <dd>{{ route.path }}</dd>
              <template v-if="localeLabel">
                <dt>Language</dt>
                <dd>{{ localeLabel }}</dd>
              </template>
              <template v-if="currentUser?.uid">
                <dt>Account</dt>
                <dd>{{ currentUser.uid }}</dd>
              </template>
            </dl>
          </div>
        </div>

        <footer class="report-issue__footer">
          <NuxtLink :to="PATH_SITES" class="report-issue__back">← Back to My Sites</NuxtLink>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PATH_SITES } from '~/constants/routes';
import { useAuth } from '~/composables/useAuth';
import { IssueReportError, useIssueReport } from '~/composables/useIssueReport';
import { useToast } from '~/composables/useToast';
import type { IssueReportCategory } from '~/types/issueReport';

definePageMeta({
  middleware: 'auth',
});

defineOptions({ name: 'ReportIssuePage' });

const route = useRoute();
const { currentUser } = useAuth();
const { submitReport } = useIssueReport();
const toast = useToast();

const message = ref('');
const category = ref<IssueReportCategory>('bug');
const isSubmitting = ref(false);

const categoryOptions: { value: IssueReportCategory; label: string }[] = [
  { value: 'bug', label: 'Something is broken' },
  { value: 'ui', label: 'Layout or usability' },
  { value: 'account', label: 'Account or sign-in' },
  { value: 'billing', label: 'Billing or plans' },
  { value: 'other', label: 'Other' },
];

const localeLabel = computed(() => {
  if (!import.meta.client) return '';
  return navigator.language || '';
});

async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  const locale = import.meta.client ? navigator.language || '' : '';
  isSubmitting.value = true;
  try {
    await submitReport({
      message: message.value,
      category: category.value,
      routePath: route.path,
      locale,
    });
    toast.showSuccess('Thanks — your report was sent.');
    message.value = '';
  } catch (err) {
    if (err instanceof IssueReportError) {
      toast.showError(err.message);
    } else {
      toast.showError('Something went wrong. Please try again.');
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped src="~/assets/css/report-issue.css"></style>
