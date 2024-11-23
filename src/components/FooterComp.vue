<script setup lang="ts">
import { ref, watch } from 'vue'

import store from '@/store'

const extUserActionId = ref(store.extUserActionId)

watch(
  () => store.extUserActionId,
  (value) => {
    extUserActionId.value = value
  }
)
</script>

<template>
  <footer>
    <div class="footer">
      <p v-if="extUserActionId" class="opacity-text mb-1">{{ extUserActionId }}</p>
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
