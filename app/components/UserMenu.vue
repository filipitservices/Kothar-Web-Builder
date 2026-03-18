<template>
  <div class="menu">
    <div v-if="isOpen" class="backdrop" @click="isOpen = false" />
    
    <div v-if="isLoading" class="loader" />
    
    <template v-else-if="isAuthenticated">
      <button class="trigger" :class="{ open: isOpen }" @click="isOpen = !isOpen" @keydown.escape="isOpen = false" aria-haspopup="true" :aria-expanded="isOpen">
        <span class="avatar">
          <img v-if="currentUser?.photoURL" :src="currentUser.photoURL" :alt="name" />
          <span v-else>{{ initials }}</span>
        </span>
        <span v-if="showName" class="name">{{ name }}</span>
        <svg class="arrow" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <Transition name="dropdown">
        <div v-if="isOpen" class="dropdown">
          <p class="dropdown-name">{{ name }}</p>
          <p v-if="currentUser?.email" class="dropdown-email">{{ currentUser.email }}</p>
          <hr />
          <NuxtLink to="/gallery" class="item" @click="isOpen = false">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
            Gallery
          </NuxtLink>
          <NuxtLink to="/sites" class="item" @click="isOpen = false">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>
            My Live Sites
          </NuxtLink>
          <button class="item" @click="handleSignOut">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" /></svg>
            Sign Out
          </button>
        </div>
      </Transition>
    </template>
    
    <NuxtLink v-else to="/login" class="signin">Sign In</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';

withDefaults(defineProps<{ showName?: boolean }>(), { showName: false });

const { currentUser, isAuthenticated, isLoading, signOut } = useAuth();
const isOpen = ref(false);

const name = computed(() => currentUser.value?.displayName || currentUser.value?.email?.split('@')[0] || 'User');

const initials = computed(() => {
  const [a, b] = name.value.split(' ');
  return a && b ? (a.charAt(0) + b.charAt(0)).toUpperCase() : name.value.slice(0, 2).toUpperCase();
});

async function handleSignOut() {
  isOpen.value = false;
  await signOut();
  navigateTo('/');
}
</script>

<style scoped>
.menu { position: relative; }
.backdrop { position: fixed; inset: 0; z-index: 40; }
.loader { width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: pulse 1.5s infinite; }
@keyframes pulse { 50% { opacity: .4; } }

.trigger { display: flex; align-items: center; gap: .5rem; padding: .25rem .5rem .25rem .25rem; background: transparent; border: 1px solid transparent; border-radius: 9999px; cursor: pointer; }
.trigger:hover, .trigger.open { background: #f3f4f6; border-color: #e5e7eb; }

.avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: #1e3a8a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 600; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }

.name { font-size: .875rem; font-weight: 500; color: #374151; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arrow { width: 16px; height: 16px; color: #6b7280; transition: transform .15s; }
.trigger.open .arrow { transform: rotate(180deg); }

.dropdown { position: absolute; top: calc(100% + 4px); right: 0; min-width: 200px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1); z-index: 50; padding: .75rem 1rem; }
.dropdown-name { margin: 0; font-size: .875rem; font-weight: 600; color: #111827; }
.dropdown-email { margin: .25rem 0 0; font-size: .75rem; color: #6b7280; }
.dropdown hr { border: none; height: 1px; background: #e5e7eb; margin: .75rem 0; }

.item { display: flex; align-items: center; gap: .5rem; width: 100%; padding: .5rem 0; background: transparent; border: none; font-size: .875rem; color: #374151; cursor: pointer; text-decoration: none; }
.item:hover { color: #111827; }
.item svg { width: 16px; height: 16px; color: #6b7280; }

.signin { display: inline-block; padding: .5rem 1rem; background: #1e3a8a; color: #fff; border-radius: 6px; font-size: .875rem; font-weight: 500; text-decoration: none; }
.signin:hover { background: #1e2d7d; }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity .15s, transform .15s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
