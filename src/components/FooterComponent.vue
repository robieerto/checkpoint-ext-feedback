<script setup lang="ts">
import { computed } from 'vue'
import store from '@/store'

const buttonLabels: Record<string, string> = {
  sk: 'Ako funguje táto appka?',
  cz: 'Jak funguje tato appka?',
  en: 'How is this app?',
}

const label = computed(() => buttonLabels[store.chosenLang] ?? buttonLabels['en'])
</script>

<template>
  <footer>
    <div class="footer">
      <p id="checkpoint-name" class="pb-0" style="display: none">
        {{ store?.checkpointData?.name }}
      </p>
      <p v-if="store.extUserActionId" class="opacity-text mb-1">{{ store.extUserActionId }}</p>
      <v-btn
        v-if="store.feedbackButtonEnabled"
        variant="outlined"
        density="compact"
        size="small"
        class="feedback-btn mb-1"
        color="#003c69"
        prepend-icon="mdi-comment-text"
        @click="store.feedbackModalOpen = true"
      >
        {{ label }}
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
  border-radius: 100px !important;
  text-transform: none !important;
}
</style>
