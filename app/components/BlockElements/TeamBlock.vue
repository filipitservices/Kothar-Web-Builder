<template>
  <div class="team-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="team-header">
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

    <div class="team-grid">
      <div class="team-member" v-for="(member, index) in team" :key="index">
        <div class="member-controls">
          <button 
            class="delete-btn"
            @click="removeMember(index)"
            title="Remove this team member"
          >
            ×
          </button>
        </div>
        
        <div class="member-photo"></div>
        
        <div 
          class="member-name editable"
          :class="{ 'has-local-value': member.name !== DEFAULT_NAME }"
          @blur="updateMember(index, 'name', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ member.name }}
        </div>
        
        <div 
          class="member-role editable"
          :class="{ 'has-local-value': member.role !== DEFAULT_ROLE }"
          @blur="updateMember(index, 'role', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ member.role }}
        </div>

        <div 
          class="member-bio editable"
          :class="{ 'has-local-value': member.bio !== DEFAULT_BIO }"
          @blur="updateMember(index, 'bio', $event)"
          @keydown.enter.prevent="blurOnEnter"
          contenteditable="true"
        >
          {{ member.bio }}
        </div>
      </div>
    </div>

    <button class="add-btn" @click="addMember" title="Add team member">
      + Add Team Member
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';
import { extractContentEditableText, blurOnEnter } from '~/utils/contentEditableHelpers';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

const DEFAULT_NAME = 'Team Member';
const DEFAULT_ROLE = 'Position Title';
const DEFAULT_BIO = 'Brief professional background or expertise.';

const props = defineProps<{
  blockId: string;
  screenType?: string;
}>();

const { getField, setField, isLocalValue } = useBlockData(props.blockId, props.screenType);

const title = computed(() => getField('title') ?? 'Meet Our Team');
const subtitle = computed(() => getField('subtitle') ?? 'Experienced professionals dedicated to your success.');

const team = computed<TeamMember[]>(() => {
  const stored = getField('team');
  if (Array.isArray(stored) && stored.length > 0) return stored;
  
  return [
    { name: DEFAULT_NAME, role: DEFAULT_ROLE, bio: DEFAULT_BIO },
    { name: DEFAULT_NAME, role: DEFAULT_ROLE, bio: DEFAULT_BIO },
    { name: DEFAULT_NAME, role: DEFAULT_ROLE, bio: DEFAULT_BIO }
  ];
});

const addMember = () => {
  setField('team', [...team.value, { name: DEFAULT_NAME, role: DEFAULT_ROLE, bio: DEFAULT_BIO }]);
};

const removeMember = (index: number) => {
  if (index < 0 || index >= team.value.length || team.value.length <= 1) return;
  setField('team', team.value.filter((_, i) => i !== index));
};

const updateMember = (index: number, field: keyof TeamMember, event: FocusEvent) => {
  const newValue = extractContentEditableText(event);
  const updated = team.value.map((item, i) =>
    i === index ? { ...item, [field]: newValue } : item
  );
  setField('team', updated);
};

const updateField = (fieldName: string, event: FocusEvent) => {
  setField(fieldName, extractContentEditableText(event));
};
</script>

<style scoped>
.team-block {
  padding: 14px;
  background: #f8fafc;
}

.team-header .title {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
  margin-bottom: 4px;
  border-bottom: 2px solid #e2e8f0;
}

.team-header .subtitle {
  font-size: 12px;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.team-member {
  padding: 12px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  position: relative;
  text-align: center;
}

.member-controls {
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

.member-photo {
  width: 64px;
  height: 64px;
  margin: 0 auto 8px;
  border-radius: 50%;
  background: repeating-linear-gradient(45deg, #e2e8f0 0px, #e2e8f0 4px, transparent 4px, transparent 8px);
  border: 2px solid #cbd5e1;
}

.member-name {
  font-weight: 700;
  font-size: 12px;
  color: #334155;
  margin-bottom: 2px;
}

.member-role {
  font-size: 11px;
  color: #1e3a8a;
  font-weight: 600;
  margin-bottom: 6px;
}

.member-bio {
  font-size: 10px;
  color: #64748b;
  line-height: 1.4;
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

.team-block.mobile-layout {
  padding: 10px;
}

.team-block.mobile-layout .team-header .title {
  font-size: 14px;
}

.team-block.mobile-layout .team-header .subtitle {
  font-size: 11px;
}

.team-block.mobile-layout .team-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
</style>
