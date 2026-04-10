<template>
  <section class="show-sect show-sect--team">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="team__grid">
        <div v-for="member in data.members" :key="member.name" class="team__member">
          <div class="team__photo-wrap">
            <div class="team__photo">
              <span class="team__initials">{{ getInitials(member.name) }}</span>
            </div>
          </div>
          <div class="team__info">
            <h3 class="team__name">{{ member.name }}</h3>
            <p class="team__title">{{ member.title }}</p>
            <p v-if="member.bio" class="team__bio">{{ member.bio }}</p>
          </div>
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

function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}
</script>

<style scoped>
.show-sect--team {
  background: var(--showcase-bg);
}

.team__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-md);
}

.team__member {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-lg) var(--space-md);
  background: color-mix(in srgb, var(--showcase-primary) 4%, var(--showcase-bg));
  border-radius: var(--radius-lg);
  border-top: 3px solid var(--showcase-accent);
  gap: var(--space-sm);
}

.team__photo-wrap {
  position: relative;
  width: 72px;
  height: 72px;
}

.team__photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--showcase-primary),
    var(--showcase-secondary, color-mix(in srgb, var(--showcase-primary) 60%, black))
  );
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid color-mix(in srgb, var(--showcase-accent) 40%, transparent);
}

.team__initials {
  font-size: 1.1em;
  font-weight: 800;
  color: var(--color-white);
  letter-spacing: -0.02em;
}

.team__info {
  flex: 1;
}

.team__name {
  font-size: 0.9em;
  font-weight: 700;
  margin: 0 0 2px 0;
  color: var(--showcase-text);
  line-height: 1.3;
}

.team__title {
  font-size: 0.72em;
  font-weight: 600;
  color: var(--showcase-primary);
  margin: 0 0 var(--space-xs) 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.team__bio {
  font-size: 0.72em;
  color: color-mix(in srgb, var(--showcase-text) 58%, var(--showcase-bg));
  margin: 0;
  line-height: 1.45;
}
</style>
