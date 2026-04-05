<!--
  Report an issue — /report-issue (protected). Not linked from global nav; entry in UserMenu only.
-->
<template>
  <div class="report-issue">
    <main class="report-issue__main">
      <div class="report-issue__inner">
        <article class="report-issue__card" aria-labelledby="report-issue-title">
          <h1 id="report-issue-title" class="report-issue__title">Report a problem</h1>
          <p class="report-issue__lead">
            Tell us what went wrong or what we should improve. Your message is sent securely with your
            account details so we can follow up if needed.
          </p>

          <div v-if="currentUser" class="report-issue__meta" aria-label="Information included with your report">
            <p v-if="currentUser.email">
              <strong>Account email:</strong>
              {{ currentUser.email }}
            </p>
            <p>
              <strong>User ID:</strong>
              {{ currentUser.uid }}
            </p>
          </div>

          <div v-if="success" class="report-issue__success" role="status">
            <p class="report-issue__success-title">Thanks — we received your report</p>
            <p>
              Reference ID:
              <strong>{{ submittedId }}</strong>
            </p>
            <div class="report-issue__footer-actions">
              <NuxtLink :to="ROUTES.gallery" class="report-issue__back">Back to Gallery</NuxtLink>
              <NuxtLink :to="ROUTES.sites" class="report-issue__back">My Sites</NuxtLink>
            </div>
          </div>

          <form v-else class="report-issue__form" @submit.prevent="handleSubmit">
            <div v-if="formError" class="report-issue__error" role="alert">
              {{ formError }}
            </div>

            <label class="report-issue__label" for="report-category">
              Category
              <select
                id="report-category"
                v-model="category"
                class="report-issue__select"
                required
                :disabled="submitting"
              >
                <option v-for="c in ISSUE_REPORT_CATEGORIES" :key="c" :value="c">
                  {{ issueReportCategoryLabel(c) }}
                </option>
              </select>
            </label>

            <label class="report-issue__label" for="report-message">
              What happened?
              <span class="report-issue__hint">Minimum 10 characters. Be specific — include steps if you can.</span>
              <textarea
                id="report-message"
                v-model="message"
                class="report-issue__textarea"
                required
                :disabled="submitting"
                maxlength="4000"
                rows="6"
                autocomplete="off"
                placeholder="Describe the issue, what you expected, and what you saw instead."
              />
            </label>

            <button type="submit" class="report-issue__submit" :disabled="submitting">
              <span v-if="submitting" class="report-issue__spinner" aria-hidden="true" />
              {{ submitting ? 'Sending…' : 'Submit report' }}
            </button>
          </form>
        </article>
      </div>
    </main>

    <footer class="report-issue__page-footer">
      <p>&copy; {{ new Date().getFullYear() }} {{ appConfig.appName }}. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useIssueReport, IssueReportSubmissionError } from '~/composables/useIssueReport';
import { ROUTES } from '~/constants/routes';
import { ISSUE_REPORT_CATEGORIES, type IssueReportCategory } from '~/types/issueReport';
import { issueReportCategoryLabel } from '~/utils/issueReportValidation';
import { useUnsavedChanges } from '~/composables/useUnsavedChanges';

definePageMeta({
  middleware: 'auth',
});

defineOptions({ name: 'ReportIssuePage' });

const { currentUser } = useAuth();
const { submitReport } = useIssueReport();
const appConfig = useAppConfig();

const INITIAL_CATEGORY: IssueReportCategory = 'bug';

const category = ref<IssueReportCategory>(INITIAL_CATEGORY);
const message = ref('');
const submitting = ref(false);
const success = ref(false);
const formError = ref<string | null>(null);
const submittedId = ref('');

const isReportFormDirty = computed(() => {
  if (success.value || submitting.value) return false;
  return (
    message.value.trim() !== '' || category.value !== INITIAL_CATEGORY
  );
});

function discardReportForm(): void {
  message.value = '';
  category.value = INITIAL_CATEGORY;
  formError.value = null;
}

useUnsavedChanges({
  isDirty: isReportFormDirty,
  onDiscard: discardReportForm,
});

async function handleSubmit(): Promise<void> {
  formError.value = null;
  submitting.value = true;
  try {
    const result = await submitReport({
      category: category.value,
      message: message.value,
    });
    submittedId.value = result.reportId;
    success.value = true;
  } catch (err: unknown) {
    if (err instanceof IssueReportSubmissionError) {
      formError.value = err.message;
    } else {
      formError.value = 'Something went wrong. Please try again.';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped src="~/assets/css/report-issue.css"></style>

<style scoped>
.report-issue__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-white);
  border-top-color: transparent;
  border-radius: 50%;
  animation: report-issue-spin 0.75s linear infinite;
  opacity: 0.9;
}

@keyframes report-issue-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
