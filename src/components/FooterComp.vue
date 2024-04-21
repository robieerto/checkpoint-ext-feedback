<script setup lang="ts">
import { ref, watch } from 'vue'

import store from '@/store'

const extFeedbackActionId = ref(store.extFeedbackActionId)

watch(
  () => store.extFeedbackActionId,
  (value) => {
    extFeedbackActionId.value = value
  }
)
</script>

<template>
  <footer>
    <div class="footer">
      <p v-if="extFeedbackActionId" class="opacity-text mb-1">{{ extFeedbackActionId }}</p>
      <p class="opacity-text mb-0">powered by</p>
      <a href="https://www.ofrules.com" rel="noopener noreferrer">www.ofrules.com</a>
      <br />
    </div>
  </footer>
</template>

<style scoped>
.footer {
  text-align: center;
  padding: 10px;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
