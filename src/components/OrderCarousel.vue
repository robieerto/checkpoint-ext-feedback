<script setup lang="ts">
import { computed, reactive } from 'vue'
import axios from 'axios'
import { type LocationQuery } from 'vue-router'

import store from '@/store'
import * as types from '@/types'

const props = defineProps<{
  data: any
}>()

const state = reactive({
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  inputCount: 1,
  error: '',
  showError: false
})

const text = computed(() => props.data.texts?.[store.chosenLang] as types.OrderAction)

const endpointUrl = `${__API_URL__}/createExtUserOrder`

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      buildingId: store.buildingId,
      checkpointId: store.checkpointId,
      extActionId: store.selectedActionId,
      inputs: [state.inputCount.toString()]
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

const previousPage = () => {
  state.activeItem--
  if (state.activeItem < 0) {
    store.selectedActionType = null
  }
}

const ctaClick = () => {
  store.selectedActionType = 'review'
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
      <p class="pb-1">
        {{ text?.text }}
      </p>
      <v-text-field
        v-model="state.inputCount"
        :label="text?.inputText"
        :hint="text?.typeText"
        class="py-10"
        variant="outlined"
        type="number"
      ></v-text-field>
      <div class="text-end">
        <v-btn
          variant="text"
          class="checkpoint-secondary-button"
          @click="previousPage"
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
