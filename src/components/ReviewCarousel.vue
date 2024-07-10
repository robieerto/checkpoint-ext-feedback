<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import axios from 'axios'
import { type LocationQuery } from 'vue-router'

import store from '@/store'
import * as types from '@/types'

const props = defineProps<{
  data: types.ExtFeedbackAction
  query: LocationQuery
}>()

const isScoreFilled = computed(() => state.inputScore !== null && state.inputScore > 0)

const getActualActionText = () =>
  props.data.actionDataList.find((at) => at.lang == store.chosenLang)?.texts

const state = reactive({
  activeActionText: getActualActionText() as types.ReviewAction,
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  inputScore: null,
  inputNote: '',
  error: '',
  showError: false,
  inputScoreError: false
})

watch(
  () => store.chosenLang,
  () => {
    state.activeActionText = getActualActionText()
  }
)

const endpointUrl = `${__API_URL__}/createExtUserReview`

const pushData = () => {
  const rules = [validateInputScore]
  if (!rules.every((rule) => rule())) {
    return
  }
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      ...props.query,
      extActionId: store.selectedActionId,
      score: state.inputScore,
      note: state.inputNote
    })
    .then(function (response) {
      store.extFeedbackActionId = response.data
      if (state.inputScore! < 4) {
        state.successPage = false
      } else {
        state.successPage = true
      }
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

const validateInputScore = () => {
  const value = state.inputScore
  if (value === null || value === undefined || isNaN(value)) {
    state.inputScoreError = true
    return false
  }
  state.inputScoreError = false
  return true
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
  if (store.compoundAction) {
    goToPage(props.data.building?.googleUrl)
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
    height="500px"
  >
    <v-carousel-item :value="0" :disabled="!!state.activeItem">
      <h1 class="pb-5">{{ state.activeActionText?.title }}</h1>
      <p class="pb-1">
        {{ state.activeActionText?.text }}
      </p>
      <div class="text-center py-2">
        <v-rating v-model="state.inputScore" density="default" hover></v-rating>
      </div>
      <span v-if="state.inputScoreError" class="error"
        >*{{ state.activeActionText?.requiredScore }}</span
      >
      <v-text-field
        v-model="state.inputNote"
        :label="state.activeActionText?.inputText"
        :hint="state.activeActionText?.typeText"
        class="py-5"
        variant="outlined"
        type="text"
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
          :disabled="!isScoreFilled"
        >
          {{ state.activeActionText?.buttonOk }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item :value="1" :disabled="!state.activeItem">
      <div v-if="state.successPage">
        <h1 class="py-10">{{ state.activeActionText?.successTitle }}</h1>
        <p class="pb-10">
          {{ state.activeActionText?.successText }}
        </p>
        <div class="text-center">
          <v-btn class="checkpoint-button" @click="ctaClick">
            {{ state.activeActionText?.buttonCTA }}
          </v-btn>
        </div>
      </div>
      <div v-else>
        <h1 class="py-10">{{ state.activeActionText?.cancelTitle }}</h1>
        <p>
          {{ state.activeActionText?.cancelText }}
        </p>
      </div>
    </v-carousel-item>
  </v-carousel>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>

<style lang="scss">
.v-rating__wrapper {
  padding: 5px;
}

.v-rating__item .v-btn .v-icon {
  color: #705d0d;
}
</style>
