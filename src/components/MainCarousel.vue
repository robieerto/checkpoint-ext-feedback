<script setup lang="ts">
import { reactive } from 'vue'
import axios from 'axios'
import { type LocationQuery } from 'vue-router'

import store from '@/store'
import * as types from '@/types'

const props = defineProps<{
  data: types.ExtFeedbackAction
  query: LocationQuery
}>()

const state = reactive({
  activeActionText: props.data?.actionTexts[0].texts,
  numOfLangs: 1,
  chosenLang: 0,
  activeItem: 0,
  loadingBtn: false
})

const endpointUrl = `${__API_URL__}/createOccurrenceExt`

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, props.query)
    .then(function (response) {
      store.extFeedbackActionId = response.data
      state.activeItem = 1
    })
    .catch(function (error) {
      console.log(error)
    })
    .finally(() => {
      state.loadingBtn = false
    })
}

const goToPage = (url: string) => {
  window.location.href = url
}
</script>

<template>
  <div class="d-flex flex-column min-vh-100 justify-content-center align-items-center">
    <v-carousel
      v-model="state.activeItem"
      :show-arrows="false"
      :hide-delimiter-background="true"
      color="#705D0D"
      height="230px"
    >
      <v-carousel-item :value="0">
        <h1 class="pb-5">{{ state.activeActionText.title }}</h1>
        <p class="pb-1">
          {{ state.activeActionText.text }}
        </p>
        <div class="text-center">
          <v-btn class="checkpoint-button" :loading="state.loadingBtn" @click="pushData">
            {{ state.activeActionText.buttokOk }}
          </v-btn>
        </div>
      </v-carousel-item>

      <v-carousel-item :value="1">
        <h1 class="pb-5">{{ state.activeActionText.successTitle }}</h1>
        <p>
          {{ state.activeActionText.successText }}
        </p>
        <div class="text-center">
          <v-btn class="checkpoint-button" @click="() => goToPage(props.data.building.website)">
            {{ state.activeActionText.buttonCTA }}
          </v-btn>
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<style lang="scss">
.main {
  padding-top: 50%;
}

.v-carousel__controls {
  pointer-events: none;
}

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

.confirm-button {
  background-color: #705d0d !important;
  color: white !important;
  border-radius: 0 !important;
  padding: 10px 20px !important;
  margin-top: 20px !important;
}
</style>
