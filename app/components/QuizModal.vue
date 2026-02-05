<template>
  <div class="quiz-container">
    <!-- Background slides -->
    <div class="quiz-slides-wrapper">
      <transition name="slide-fade">
        <div :key="quizStore.currentSlide" class="quiz-slide">
          <div class="quiz-content">
            <div class="quiz-header">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: progressPercentage + '%' }"
                ></div>
              </div>
              <p class="question-number">
                Question {{ quizStore.currentSlide + 1 }} of {{ quizStore.questions.length }}
              </p>
            </div>

            <div class="quiz-question">
              <h2>{{ currentQuestion.question }}</h2>
            </div>

            <!-- Text Input Type -->
            <div v-if="currentQuestion.type === 'text'" class="quiz-input">
              <input 
                type="text"
                v-model="currentAnswer"
                :placeholder="`Enter your ${currentQuestion.fieldName}`"
                @keyup.enter="handleEnter"
                class="answer-input"
                :class="{ 'input-error': validationError && currentAnswer.trim() }"
              />
            </div>

            <!-- Selection Type -->
            <div v-else-if="currentQuestion.type === 'select'" class="quiz-options">
              <button
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                class="option-button"
                :class="{ selected: currentAnswer === option }"
                @click="selectOption(option)"
              >
                {{ option }}
              </button>
            </div>

            <div v-if="validationError" class="error-message">
              {{ validationError }}
            </div>

            <div class="quiz-footer">
              <button 
                v-if="quizStore.currentSlide > 0"
                class="btn-secondary"
                @click="previousSlide"
              >
                ← Previous
              </button>
              <button 
                v-if="quizStore.currentSlide < quizStore.questions.length - 1"
                class="btn-primary"
                :disabled="!isValid"
                @click="nextSlide"
              >
                Next →
              </button>
              <button 
                v-else
                class="btn-primary btn-complete"
                :disabled="!isValid"
                @click="completeQuiz"
              >
                Complete Quiz
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz';
import { useValidation } from '~/composables/useValidation';
import { computed } from 'vue';

const quizStore = useQuizStore();
const { validate } = useValidation();

const currentQuestion = computed(() => {
  return quizStore.questions[quizStore.currentSlide]!;
});

const currentAnswer = computed({
  get: () => quizStore.getAnswer(currentQuestion.value.fieldName),
  set: (value: string) => quizStore.setAnswer(currentQuestion.value.fieldName, value)
});

const validationError = computed(() => {
  if (!currentAnswer.value.trim()) {
    return 'This field is required';
  }
  return validate(currentQuestion.value.fieldName, currentAnswer.value);
});

const isValid = computed(() => !validationError.value);

const progressPercentage = computed(() => {
  return ((quizStore.currentSlide + 1) / quizStore.questions.length) * 100;
});

const handleEnter = () => {
  if (isValid.value) {
    if (quizStore.currentSlide < quizStore.questions.length - 1) {
      nextSlide();
    } else {
      completeQuiz();
    }
  }
};

const selectOption = (option: string) => {
  currentAnswer.value = option;
};

const nextSlide = () => {
  quizStore.nextSlide();
};

const previousSlide = () => {
  if (quizStore.currentSlide > 0) {
    quizStore.currentSlide--;
  }
};

const completeQuiz = () => {
  quizStore.completeQuiz();
};
</script>

<style scoped>
.quiz-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.quiz-slides-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.quiz-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
}

.quiz-content {
  background: white;
  padding: 60px;
  border-radius: 20px;
  max-width: 700px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.quiz-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1e3a8a;
  transition: width 0.3s ease;
}

.question-number {
  font-size: 14px;
  color: #888;
  margin: 0;
  font-weight: 500;
}

.quiz-question {
  text-align: center;
}

.quiz-question h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
  line-height: 1.4;
}

.quiz-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-input {
  padding: 16px 20px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  color: #333;
}

.answer-input:focus {
  outline: none;
  border-color: #1e3a8a;
  background-color: #f0f4ff;
}

.answer-input.input-error {
  border-color: #d32f2f;
  background-color: #ffebee;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-button {
  padding: 16px 20px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  color: #333;
  font-weight: 500;
}

.option-button:hover {
  border-color: #1e3a8a;
  background-color: #f0f4ff;
  transform: translateX(5px);
}

.option-button.selected {
  background-color: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
  transform: translateX(5px);
}

.error-message {
  color: #d32f2f;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.quiz-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #1e3a8a;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(30, 58, 138, 0.35);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #1e3a8a;
  border: 2px solid #1e3a8a;
}

.btn-secondary:hover {
  background: #f0f4ff;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 768px) {
  .quiz-content {
    padding: 40px 30px;
  }

  .quiz-question h2 {
    font-size: 22px;
  }

  .answer-input {
    font-size: 14px;
    padding: 14px 16px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
