<template>
  <div class="pricing-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="pricing-header">
      <div 
        class="title editable"
        :class="{ 'has-local-value': isLocalValue('title') }"
        @blur="updateField('title', $event)"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ title }}
      </div>
      <div 
        class="subtitle editable"
        :class="{ 'has-local-value': isLocalValue('subtitle') }"
        @blur="updateField('subtitle', $event)"
        @keydown.enter.prevent="blurOnEnter"
        contenteditable="true"
      >
        {{ subtitle }}
      </div>
    </div>

    <div class="pricing-cards">
      <div class="pricing-card" v-for="(plan, index) in plans" :key="index">
        <div class="card-controls">
          <button 
            class="delete-btn"
            @click="removePlan(index)"
            title="Remove this plan"
          >
            ×
          </button>
        </div>

        <div 
          class="plan-name editable"
          :class="{ 'has-local-value': plan.name !== DEFAULT_NAME }"
          @blur="updatePlan(index, 'name', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ plan.name }}
        </div>

        <div 
          class="plan-price editable"
          :class="{ 'has-local-value': plan.price !== DEFAULT_PRICE }"
          @blur="updatePlan(index, 'price', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ plan.price }}
        </div>

        <div 
          class="plan-description editable"
          :class="{ 'has-local-value': plan.description !== DEFAULT_DESC }"
          @blur="updatePlan(index, 'description', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ plan.description }}
        </div>

        <div 
          class="plan-features editable"
          :class="{ 'has-local-value': plan.features !== DEFAULT_FEATURES }"
          @blur="updatePlan(index, 'features', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ plan.features }}
        </div>

        <div class="plan-cta">
          <span
            class="cta-text editable"
            :class="{ 'has-local-value': plan.ctaText !== DEFAULT_CTA }"
            @blur="updatePlan(index, 'ctaText', $event)"
            @keydown.enter.prevent="blurOnEnter"
            contenteditable="true"
          >
            {{ plan.ctaText }}
          </span>
        </div>
      </div>
    </div>

    <button class="add-btn" @click="addPlan" title="Add new pricing plan">
      + Add Plan
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string;
  ctaText: string;
}

const DEFAULT_NAME = 'Plan Name';
const DEFAULT_PRICE = '$99/mo';
const DEFAULT_DESC = 'Perfect for...';
const DEFAULT_FEATURES = 'Feature 1\nFeature 2\nFeature 3';
const DEFAULT_CTA = 'Get Started';

const props = defineProps({
  blockId: {
    type: String,
    required: true
  },
  screenType: {
    type: String,
    default: 'desktop'
  }
});

const { getField, setField, isLocalValue } = useBlockData(props.blockId, props.screenType);

const title = computed<string>(() => getField('title') ?? 'Pricing Plans');
const subtitle = computed<string>(() => getField('subtitle') ?? 'Choose the plan that fits your needs.');

const plans = computed<PricingPlan[]>(() => {
  const stored = getField('plans');
  if (Array.isArray(stored) && stored.length > 0) return stored;
  
  return [
    { name: 'Basic', price: '$29/mo', description: 'For individuals', features: 'Core features\nEmail support\n1 user', ctaText: DEFAULT_CTA },
    { name: 'Professional', price: '$79/mo', description: 'For small teams', features: 'All basic features\nPriority support\n5 users', ctaText: DEFAULT_CTA },
    { name: 'Enterprise', price: '$199/mo', description: 'For large organizations', features: 'All features\n24/7 support\nUnlimited users', ctaText: DEFAULT_CTA }
  ];
});

const addPlan = () => {
  setField('plans', [...plans.value, { 
    name: DEFAULT_NAME, 
    price: DEFAULT_PRICE, 
    description: DEFAULT_DESC,
    features: DEFAULT_FEATURES,
    ctaText: DEFAULT_CTA
  }]);
};

const removePlan = (index: number) => {
  if (index < 0 || index >= plans.value.length || plans.value.length <= 1) return;
  setField('plans', plans.value.filter((_, i) => i !== index));
};

const updatePlan = (index: number, field: keyof PricingPlan, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = plans.value.map((item, i) =>
    i === index ? { ...item, [field]: newValue } : item
  );
  setField('plans', updated);
};

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>


<style scoped>
.pricing-block {
  padding: 14px;
  background: #f8fafc;
}

.pricing-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
}

.pricing-header .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.pricing-card {
  padding: 12px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-controls {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.15s ease;
  pointer-events: auto;
  z-index: 20;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.plan-name {
  font-weight: 700;
  font-size: 13px;
  color: #334155;
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}

.plan-price {
  font-weight: 700;
  font-size: 18px;
  color: #1e3a8a;
  text-align: center;
  padding: 6px 0;
}

.plan-description {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 1px dashed #e2e8f0;
}

.plan-features {
  font-size: 10px;
  color: #64748b;
  line-height: 1.5;
  flex: 1;
  white-space: pre-line;
}

.plan-cta {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.cta-text {
  display: block;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  padding: 6px 8px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
}

.add-btn {
  display: block;
  background: #dbeafe;
  border: 1px solid #7dd3fc;
  color: #0369a1;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.15s ease;
}

.add-btn:hover {
  background: #bfdbfe;
  border-color: #38bdf8;
}

.pricing-block.mobile-layout {
  padding: 10px;
}

.pricing-block.mobile-layout .pricing-header .title {
  font-size: 14px;
}

.pricing-block.mobile-layout .pricing-header .subtitle {
  font-size: 11px;
}

.pricing-block.mobile-layout .pricing-cards {
  grid-template-columns: 1fr;
  gap: 10px;
}

.pricing-block.mobile-layout .plan-price {
  font-size: 16px;
}
</style>

