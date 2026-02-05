<template>
  <section class="showcase-section showcase-section--team">
    <div class="showcase-section__inner">
      <h2 v-if="data.title" class="showcase-section__title">{{ data.title }}</h2>
      <div class="team__grid">
        <div v-for="member in data.members" :key="member.name" class="team__member">
          <div class="team__photo showcase-placeholder showcase-placeholder--circle"></div>
          <h3 class="team__name">{{ member.name }}</h3>
          <p class="team__title">{{ member.title }}</p>
          <p v-if="member.bio" class="team__bio">{{ member.bio }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface TeamMember {
  name: string;
  title: string;
  bio?: string;
}

interface TeamData {
  title?: string;
  members: TeamMember[];
}

defineProps<{
  data: TeamData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.team__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.team__member {
  text-align: center;
}

.team__photo {
  width: 64px;
  height: 64px;
  margin: 0 auto 8px;
}

.team__name {
  font-size: 0.9em;
  font-weight: 700;
  margin: 0 0 2px 0;
}

.team__title {
  font-size: 0.75em;
  color: var(--showcase-primary);
  margin: 0 0 4px 0;
}

.team__bio {
  font-size: 0.7em;
  color: #6b7280;
  margin: 0;
}
</style>
