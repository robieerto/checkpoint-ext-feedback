<script setup lang="ts">
import { reactive, watch } from 'vue'
import axios from 'axios'
import { type LocationQuery } from 'vue-router'

import store from '@/store'
import * as types from '@/types'

const props = defineProps<{
  data: types.ExtFeedbackAction
  query: LocationQuery
}>()

const getActualActionText = () =>
  props.data.actionDataList.find((at) => at.lang == store.chosenLang)?.texts

const state = reactive({
  activeActionText: getActualActionText() as types.OrderAction,
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  inputCount: 1,
  error: '',
  showError: false
})

watch(
  () => store.chosenLang,
  () => {
    state.activeActionText = getActualActionText()
  }
)

const endpointUrl = `${__API_URL__}/createExtUserOrder`

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      ...props.query,
      extActionId: store.selectedActionId,
      inputs: [state.inputCount.toString()]
    })
    .then(function (response) {
      store.extFeedbackActionId = response.data
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
    store.selectedActionId = null
    store.selectedActionType = 'compound' as any
  }
}

const goToPage = (url: string | undefined) => {
  window.location.href = url ?? '/'
}

const ctaClick = () => {
  if (store.isCompoundAction) {
    store.selectedActionType = 'review' as any
  } else {
    goToPage(props.data.building?.website)
  }
}
</script>

<template>
  <v-carousel
    v-model="state.activeItem"
    :show-arrows="false"
    :hide-delimiter-background="true"
    color="#705D0D"
    height="400px"
  >
    <v-carousel-item :value="0" :disabled="!!state.activeItem">
      <h1 class="pb-5">{{ state.activeActionText?.title }}</h1>
      <p class="pb-1">
        {{ state.activeActionText?.text }}
      </p>
      <v-text-field
        v-model="state.inputCount"
        :label="state.activeActionText?.inputText"
        :hint="state.activeActionText?.typeText"
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
          {{ state.activeActionText?.buttonBack }}
        </v-btn>
        <v-btn
          variant="flat"
          class="checkpoint-button"
          :loading="state.loadingBtn"
          @click="pushData"
        >
          {{ state.activeActionText?.buttonOk }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item :value="1" :disabled="!state.activeItem">
      <div v-if="state.successPage">
        <h1 class="pb-5">{{ state.activeActionText?.successTitle }}</h1>
        <p class="pb-4">
          {{ state.activeActionText?.successText }}
        </p>
        <p class="pb-4">
          {{ state.activeActionText?.successText2 }}
        </p>
      </div>
      <!-- <div v-else>
        <h1 class="pb-1">{{ state.activeActionText?.cancelTitle }}</h1>
        <p>
          {{ state.activeActionText?.cancelText }}
        </p>
      </div> -->
      <div class="text-center">
        <v-btn class="checkpoint-button" @click="ctaClick">
          {{ state.activeActionText?.buttonCTA }}
        </v-btn>
      </div>
    </v-carousel-item>
  </v-carousel>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>
