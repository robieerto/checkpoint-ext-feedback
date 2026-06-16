<script setup lang="ts">
import { reactive, computed } from 'vue'
import api from '@/services/api'
import store from '@/store'

const texts: Record<string, Record<string, string>> = {
  en: {
    title: 'How do you like this app? Let us know!',
    text: "Tell us what's working well or what could be better.",
    inputText: 'Your feedback',
    typeText: 'At least 3 characters',
    disclaimer: 'Your feedback goes directly to the ofrules app developers.',
    buttonOk: 'Send',
    buttonBack: 'Cancel',
    successTitle: 'Thank you!',
    successText: 'Your feedback helps us improve.',
    buttonBackMenu: 'Back to menu',
  },
  sk: {
    title: 'Ako sa Vám páči táto aplikácia?',
    text: 'Chýba Vám tu niečo? Napíšte nám, čo funguje dobre alebo čo by sa dalo zlepšiť.',
    inputText: 'Vaša spätná väzba',
    typeText: 'Aspoň 3 znaky',
    disclaimer: 'Vaša spätná väzba ide priamo vývojárom aplikácie ofrules.',
    buttonOk: 'Odoslať',
    buttonBack: 'Zrušiť',
    successTitle: 'Ďakujeme!',
    successText: 'Vaša spätná väzba nám pomáha sa zlepšovať.',
    buttonBackMenu: 'Späť do menu',
  },
  cz: {
    title: 'Jak funguje tato appka?',
    text: 'Napište nám, co funguje dobře nebo co by šlo zlepšit.',
    inputText: 'Vaše zpětná vazba',
    typeText: 'Alespoň 3 znaky',
    disclaimer: 'Vaše zpětná vazba jde přímo vývojářům aplikace ofrules.',
    buttonOk: 'Odeslat',
    buttonBack: 'Zrušit',
    successTitle: 'Děkujeme!',
    successText: 'Vaše zpětná vazba nám pomáhá se zlepšovat.',
    buttonBackMenu: 'Zpět do menu',
  },
}

const state = reactive({
  activeItem: 0,
  loadingBtn: false,
  inputNote: '',
  error: '',
  showError: false
})

const text = computed(() => texts[store.chosenLang] ?? texts['en'])
const isNoteValid = computed(() => state.inputNote.trim().length >= 3)

const endpointUrl = `${__API_URL__}/createPlatformFeedback`

const pushData = () => {
  state.loadingBtn = true

  api
    .post(endpointUrl, {
      buildingId: store.buildingId,
      note: state.inputNote.trim(),
      viewId: store.selectedView?.id ?? undefined,
      actionId: store.selectedAction?.id ?? undefined,
      checkpointId: store.checkpointId ?? undefined,
      checkpointName: store.checkpointData?.name ?? undefined,
      extFeedbackId: store.extFeedbackId ?? undefined,
    })
    .then(() => {
      state.activeItem = 1
    })
    .catch((error: any) => {
      const responseData = error.response?.data
      state.error = typeof responseData === 'string' ? responseData : (responseData?.message ?? responseData?.error ?? 'Error')
      state.showError = true
    })
    .finally(() => {
      state.loadingBtn = false
    })
}

const closeDialog = () => {
  store.feedbackModalOpen = false
}

const resetState = () => {
  state.activeItem = 0
  state.inputNote = ''
  state.error = ''
  state.showError = false
  state.loadingBtn = false
}
</script>

<template>
  <v-dialog v-model="store.feedbackModalOpen" max-width="480" @after-leave="resetState">
    <v-card class="pa-4">
      <!-- Step 0: Feedback form -->
      <div v-if="state.activeItem === 0">
        <v-card-title class="pb-2 px-0">{{ text.title }}</v-card-title>
        <v-card-text class="px-0 pb-1">{{ text.text }}</v-card-text>
        <v-text-field
          v-model="state.inputNote"
          :label="text.inputText"
          :hint="text.typeText"
          class="pt-3 pb-1"
          variant="outlined"
          type="text"
          :maxlength="1000"
        ></v-text-field>
        <p class="disclaimer-text mb-3">{{ text.disclaimer }}</p>
        <v-card-actions class="px-0 justify-end">
          <v-btn variant="text" class="checkpoint-secondary-button cancel-btn" @click="closeDialog">
            {{ text.buttonBack }}
          </v-btn>
          <v-btn
            variant="flat"
            class="checkpoint-button"
            :loading="state.loadingBtn"
            :disabled="!isNoteValid"
            @click="pushData"
          >
            <strong>{{ text.buttonOk }}</strong>
          </v-btn>
        </v-card-actions>
      </div>

      <!-- Step 1: Success -->
      <div v-else class="text-center py-6">
        <h2 class="pb-4">{{ text.successTitle }}</h2>
        <p class="pb-6">{{ text.successText }}</p>
        <v-btn variant="flat" class="checkpoint-button" @click="closeDialog">
          {{ text.buttonBackMenu }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>

<style scoped>
.disclaimer-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.4;
}

.cancel-btn {
  background-color: #fff8ee !important;
}
</style>
