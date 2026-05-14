<script setup lang="ts">
import { reactive, computed } from 'vue'
import api from '@/services/api'
import store from '@/store'

const state = reactive({
  activeItem: 0,
  loadingBtn: false,
  inputNote: '',
  error: '',
  showError: false
})

const text = computed(() => store.feedbackAction?.texts?.[store.chosenLang])
const isNoteValid = computed(() => state.inputNote.trim().length > 3)

const endpointUrl = `${__API_URL__}/createGuestFeedback`

const pushData = () => {
  state.loadingBtn = true

  api
    .post(endpointUrl, {
      buildingId: store.buildingId,
      note: state.inputNote.trim(),
      viewId: store.selectedView?.id ?? undefined,
      actionId: store.selectedAction?.id ?? undefined
    })
    .then(() => {
      state.activeItem = 1
    })
    .catch((error: any) => {
      state.error = error.response?.data ?? 'Error'
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
}
</script>

<template>
  <v-dialog v-model="store.feedbackModalOpen" max-width="480" @after-leave="resetState">
    <v-card class="pa-4">
      <!-- Step 0: Feedback form -->
      <div v-if="state.activeItem === 0">
        <v-card-title class="pb-2 px-0">{{ text?.title }}</v-card-title>
        <v-card-text class="px-0 pb-1">{{ text?.text }}</v-card-text>
        <v-text-field
          v-model="state.inputNote"
          :label="text?.inputText"
          :hint="text?.typeText"
          class="py-3"
          variant="outlined"
          type="text"
          :maxlength="1000"
        ></v-text-field>
        <v-card-actions class="px-0 justify-end">
          <v-btn variant="text" class="checkpoint-secondary-button" @click="closeDialog">
            {{ text?.buttonBack }}
          </v-btn>
          <v-btn
            variant="flat"
            class="checkpoint-button"
            :loading="state.loadingBtn"
            :disabled="!isNoteValid"
            @click="pushData"
          >
            <strong>{{ text?.buttonOk }}</strong>
          </v-btn>
        </v-card-actions>
      </div>

      <!-- Step 1: Success -->
      <div v-else class="text-center py-6">
        <h2 class="pb-4">{{ text?.successTitle }}</h2>
        <p class="pb-6">{{ text?.successText }}</p>
        <v-btn variant="flat" class="checkpoint-button" @click="closeDialog">
          {{ text?.buttonBackMenu }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>
