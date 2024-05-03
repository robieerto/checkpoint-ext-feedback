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
  props.data.actionTexts.find((at) => at.lang == store.chosenLang)?.texts

const state = reactive({
  activeActionText: getActualActionText(),
  activeItem: 0,
  successPage: false,
  loadingBtn: false
})

watch(
  () => store.chosenLang,
  () => {
    state.activeActionText = getActualActionText()
  }
)

const endpointUrl = `${__API_URL__}/createOccurrenceExt`

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, props.query)
    .then(function (response) {
      store.extFeedbackActionId = response.data
      state.successPage = true
      state.activeItem = 1
    })
    .catch(function (error) {
      console.log(error)
    })
    .finally(() => {
      state.loadingBtn = false
    })
}

const cancel = () => {
  state.successPage = false
  state.activeItem = 1
}

const goToPage = (url: string) => {
  window.location.href = url
}
</script>

<template>
  <v-carousel
    v-model="state.activeItem"
    :show-arrows="false"
    :hide-delimiter-background="true"
    color="#705D0D"
    height="280px"
  >
    <v-carousel-item :value="0" :disabled="!!state.activeItem">
      <h1 class="pb-5">{{ state.activeActionText?.title }}</h1>
      <p class="pb-1">
        {{ state.activeActionText?.text }}
      </p>
      <div class="text-end">
        <v-btn
          variant="text"
          class="checkpoint-secondary-button"
          @click="cancel"
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
        <p>
          {{ state.activeActionText?.successText }}
        </p>
      </div>
      <div v-else>
        <h1 class="pb-1">{{ state.activeActionText?.cancelTitle }}</h1>
        <p>
          {{ state.activeActionText?.cancelText }}
        </p>
      </div>
      <div class="text-center">
        <v-btn class="checkpoint-button" @click="() => goToPage(props.data.building.website)">
          {{ state.activeActionText?.buttonCTA }}
        </v-btn>
      </div>
    </v-carousel-item>
  </v-carousel>
</template>

<style lang="scss">
.v-btn--icon {
  width: initial !important;
  height: initial !important;
}

.v-btn--active > .v-btn__overlay {
  opacity: 0 !important;
}

.v-btn--active.v-carousel__controls__item .v-icon {
  opacity: 1 !important;
}
</style>
