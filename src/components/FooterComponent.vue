<script setup lang="ts">
import store from '@/store'
</script>

<template>
  <footer>
    <div class="footer">
      <p id="checkpoint-name" class="pb-0" style="display: none">
        {{ store?.checkpointData?.name }}
      </p>
      <p v-if="store.extUserActionId" class="opacity-text mb-1">{{ store.extUserActionId }}</p>
      <v-btn
        v-if="store.feedbackAction"
        variant="text"
        density="compact"
        size="small"
        class="feedback-btn mb-1"
        @click="store.feedbackModalOpen = true"
      >
        {{ store.feedbackAction?.texts?.[store.chosenLang]?.listTitle ?? 'Feedback' }}
      </v-btn>
      <p class="opacity-text mb-0">powered by</p>
      <a href="https://www.ofrules.com" rel="noopener noreferrer">www.ofrules.com</a>
      <br />
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-background);
  text-align: center;
  padding-top: 0px;
  padding-bottom: 5px;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}

.feedback-btn {
  display: block;
  margin: 0 auto;
  opacity: 0.7;
}
</style>
