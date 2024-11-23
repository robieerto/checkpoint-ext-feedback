<script setup lang="ts">
import { computed, reactive } from 'vue'
import axios from 'axios'

import store from '@/store'
import * as types from '@/types'

const props = defineProps<{
  data: any
}>()

const state = reactive({
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  error: '',
  showError: false
})

const text = computed(() => props.data.texts?.[store.chosenLang] as types.OccurenceAction)

const endpointUrl = `${__API_URL__}/createOccurrenceExt`

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      buildingId: store.buildingId,
      checkpointId: store.checkpointId,
      extActionId: store.selectedActionId
    })
    .then(function (response) {
      store.extActionId = response.data
      state.successPage = true
      state.activeItem = 1
    })
    .catch(function (error) {
      state.error = error.response.data
      state.showError = true
      console.log(error)
    })
    .finally(() => {
      state.loadingBtn = false
    })
}

const cancel = () => {
  if (store.extFeedbackId) {
    state.activeItem = 0
    store.selectedActionType = null
  } else {
    state.successPage = false
    state.activeItem = 1
  }
}

const goToPage = (url: string | undefined) => {
  window.location.href = url ?? '/'
}

const ctaClick = () => {
  if (store.extFeedbackId) {
    store.selectedActionType = 'review' as any
  } else {
    if (props.data.building?.website) {
      goToPage(props.data.building?.website)
    }
  }
}

const backToMenuClick = () => {
  store.selectedActionType = null
}
</script>

<template>
  <v-carousel
    v-model="state.activeItem"
    :show-arrows="false"
    :hide-delimiter-background="true"
    color="#705D0D"
    height="420px"
  >
    <v-carousel-item :value="0" :disabled="!!state.activeItem">
      <h1 class="pb-5">{{ text?.title }}</h1>
      <h5 class="pb-1">{{ props.data?.checkpointName }}</h5>
      <p class="pb-1">{{ text?.text }}</p>
      <div class="text-end">
        <v-btn
          variant="text"
          class="checkpoint-secondary-button"
          @click="cancel"
          :disabled="state.loadingBtn"
        >
          {{ text?.buttonBack }}
        </v-btn>
        <v-btn
          variant="flat"
          class="checkpoint-button"
          :loading="state.loadingBtn"
          @click="pushData"
        >
          {{ text?.buttonOk }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item :value="1" :disabled="!state.activeItem">
      <div v-if="state.successPage">
        <h1 class="pb-5">{{ text?.successTitle }}</h1>
        <p>
          {{ text?.successText }}
        </p>
        <p v-if="store.extFeedbackId" class="pb-5">
          {{ text?.successText2 }}
        </p>
      </div>
      <div v-else>
        <h1 class="pb-1">{{ text?.cancelTitle }}</h1>
        <p>
          {{ text?.cancelText }}
        </p>
      </div>
      <div v-if="store.extFeedbackId" class="text-center">
        <v-btn class="checkpoint-button" @click="ctaClick">
          {{ text?.buttonCTA }}
        </v-btn>
        <v-btn variant="text" class="checkpoint-secondary-button mt-5" @click="backToMenuClick">
          {{ text?.buttonBackMenu }}
        </v-btn>
      </div>
    </v-carousel-item>
  </v-carousel>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>
