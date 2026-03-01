import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  fieldName: keyof typeof defaultAnswers;
  type: 'text' | 'select';
}

const defaultAnswers = {
  companyName: '',
  email: '',
  telephone: '',
  address: '',
  city: '',
  postalCode: '',
  website: '',
  businessHours: '',
  taxId: ''
};

export const useQuizStore = defineStore('quiz', () => {
  const quizCompleted = ref(false);
  const currentSlide = ref(0);
  const answers = ref<Record<string, string>>({
    companyName: '',
    email: '',
    telephone: '',
    address: '',
    city: '',
    postalCode: '',
    website: '',
    businessHours: '',
    taxId: ''
  });

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: 'What is your company name?',
      options: [],
      fieldName: 'companyName',
      type: 'text'
    },
    {
      id: 2,
      question: 'What is your email address?',
      options: [],
      fieldName: 'email',
      type: 'text'
    },
    {
      id: 3,
      question: 'What is your telephone number?',
      options: [],
      fieldName: 'telephone',
      type: 'text'
    },
    {
      id: 4,
      question: 'What is your street address?',
      options: [],
      fieldName: 'address',
      type: 'text'
    },
    {
      id: 5,
      question: 'What is your city?',
      options: [],
      fieldName: 'city',
      type: 'text'
    },
    {
      id: 6,
      question: 'What is your postal code?',
      options: [],
      fieldName: 'postalCode',
      type: 'text'
    },
    {
      id: 7,
      question: 'What is your website URL?',
      options: [],
      fieldName: 'website',
      type: 'text'
    },
    {
      id: 8,
      question: 'What are your business hours?',
      options: [
        '9AM - 5PM',
        '9AM - 6PM',
        '10AM - 6PM',
        '24/7',
        'Custom'
      ],
      fieldName: 'businessHours',
      type: 'select'
    },
    {
      id: 9,
      question: 'What is your tax ID?',
      options: [],
      fieldName: 'taxId',
      type: 'text'
    }
  ];

  const setAnswer = (fieldName: string, value: string) => {
    answers.value = { ...answers.value, [fieldName]: value };
  };

  const getAnswer = (fieldName: string): string => {
    return answers.value[fieldName] || '';
  };

  const nextSlide = () => {
    if (currentSlide.value < questions.length - 1) {
      currentSlide.value++;
    }
  };

  const completeQuiz = () => {
    quizCompleted.value = true;
  };

  const resetQuiz = () => {
    quizCompleted.value = false;
    currentSlide.value = 0;
    answers.value = {
      companyName: '',
      email: '',
      telephone: '',
      address: '',
      city: '',
      postalCode: '',
      website: '',
      businessHours: '',
      taxId: ''
    };
  };

  return {
    quizCompleted,
    currentSlide,
    questions,
    answers,
    setAnswer,
    getAnswer,
    nextSlide,
    completeQuiz,
    resetQuiz
  };
});
