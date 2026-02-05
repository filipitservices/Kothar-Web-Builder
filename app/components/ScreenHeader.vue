<template>
  <div class="screen-header">
    <h2>{{ title }}</h2>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.screen-header {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 2px solid #e0e0e0;
  background: #f9f9f9;
}

.screen-header h2 {
  margin: 0;
  font-weight: 600;
  font-size: 16px;
}
</style>
