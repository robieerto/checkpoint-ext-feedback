<script setup lang="ts">
import { computed, reactive } from 'vue'
import axios from 'axios'

import store from '@/store'
import * as types from '@/types'

const state = reactive({
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  inputCount: 1,
  error: '',
  showError: false
})

const inputs = reactive({
  selectedOption: null,
  checkboxes: {} as any
})

const texts = computed(() => store.selectedAction?.texts?.[store.chosenLang] as types.OrderAction)
const options = computed(() => store.selectedAction.options)

const isOptionSelected = computed(() =>
  options?.value?.selection ? !!inputs.selectedOption : true
)

const endpointUrl = `${__API_URL__}/createExtUserOrder`

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      buildingId: store.buildingId,
      checkpointId: store.checkpointId,
      extActionPath: store.selectedAction?.path,
      inputs: [state.inputCount.toString()]
    })
    .then(function (response) {
      store.extUserActionId = response.data
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
  }
}

const ctaClick = () => {
  store.selectedActionId = 'review'
}

const backToMenuClick = () => {
  store.selectedActionId = null
}
</script>

<template>
  <v-carousel
    v-model="state.activeItem"
    :show-arrows="false"
    :hide-delimiter-background="true"
    color="#705D0D"
    height="auto"
  >
    <v-carousel-item :value="0" :disabled="!!state.activeItem" height="auto" content-class="pb-16">
      <h1 class="pb-5">{{ texts?.title }}</h1>
      <v-list>
        <p v-if="texts?.text" class="pb-1">
          {{ texts?.text }}
        </p>
        <p v-else-if="texts?.texts" v-for="(text, index) in texts?.texts" :key="index">
          {{ text }}
        </p>
        <v-text-field
          v-if="options?.inputNumber"
          v-model="state.inputCount"
          :label="texts?.inputText"
          :hint="texts?.typeText"
          class="py-10"
          variant="outlined"
          type="number"
        ></v-text-field>
        <v-radio-group v-if="options?.selection" v-model="inputs.selectedOption" color="#705d0d">
          <v-radio
            v-for="(option, index) in texts?.selectOptions"
            :label="option"
            :value="option"
            :key="index"
          ></v-radio>
        </v-radio-group>
        <div v-if="options?.checkbox">
          <v-checkbox
            v-for="(option, index) in texts?.checkboxes"
            v-model="inputs.checkboxes[index]"
            :key="index"
            :label="option"
          ></v-checkbox>
        </div>

        <p v-if="texts?.bottomText" class="pb-1">
          {{ texts?.bottomText }}
        </p>
      </v-list>
      <div class="text-end">
        <v-btn
          variant="text"
          class="checkpoint-secondary-button"
          @click="previousPage"
          :disabled="state.loadingBtn"
        >
          {{ texts?.buttonBack }}
        </v-btn>
        <v-btn
          variant="flat"
          class="checkpoint-button"
          :loading="state.loadingBtn"
          :disabled="!isOptionSelected || state.loadingBtn"
          @click="pushData"
        >
          {{ texts?.buttonOk }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item :value="1" :disabled="!state.activeItem">
      <div v-if="state.successPage">
        <h1 class="pb-5">{{ texts?.successTitle }}</h1>
        <p>
          {{ texts?.successText }}
        </p>
        <p v-if="store.hasViewsData" class="pb-5">
          {{ texts?.successText2 }}
        </p>
      </div>
      <div v-if="store.hasViewsData" class="text-center">
        <v-btn class="checkpoint-button" @click="ctaClick">
          {{ texts?.buttonCTA }}
        </v-btn>
        <v-btn variant="text" class="checkpoint-secondary-button mt-5" @click="backToMenuClick">
          {{ texts?.buttonBackMenu }}
        </v-btn>
      </div>
    </v-carousel-item>
  </v-carousel>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>
