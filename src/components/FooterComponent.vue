<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import store from '@/store'

const buttonLabels: Record<string, string> = {
  sk: 'Ako sa Vám páči táto aplikácia?',
  cz: 'Jak funguje tato appka?',
  en: 'How do you like this app? Let us know!',
}

const label = computed(() => buttonLabels[store.chosenLang] ?? buttonLabels['en'])

const footerEl = ref<HTMLElement>()
const observer = new ResizeObserver(([entry]) => {
  document.documentElement.style.setProperty('--footer-height', `${entry.borderBoxSize[0].blockSize}px`)
})
onMounted(() => { if (footerEl.value) observer.observe(footerEl.value) })
onUnmounted(() => observer.disconnect())
</script>

<template>
  <footer>
    <div class="footer" ref="footerEl">
      <p id="checkpoint-name" class="pb-0" style="display: none">
        {{ store?.checkpointData?.name }}
      </p>
      <p v-if="store.extUserActionId" class="opacity-text mb-1">{{ store.extUserActionId }}</p>
      <v-btn
        v-if="store.platformFeedbackEnabled"
        variant="outlined"
        class="feedback-btn mt-2 mb-1"
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
  border-radius: 100px !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
}
</style>
