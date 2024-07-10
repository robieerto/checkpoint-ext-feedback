<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import axios from 'axios'
import { type LocationQuery } from 'vue-router'
import { phone } from 'phone'

import store from '@/store'
import * as types from '@/types'

const props = defineProps<{
  data: types.ExtFeedbackAction
  query: LocationQuery
}>()

const getActualActionText = () =>
  props.data.actionDataList.find((at) => at.lang == store.chosenLang)?.texts

const state = reactive({
  activeActionText: getActualActionText() as types.QuestionAction,
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  inputText: '',
  inputEmail: '',
  inputPhone: '',
  error: '',
  showError: false,
  inputTextError: false,
  emailCorrect: true,
  phoneCorrect: true
})

const isTextFilled = computed(() => state.inputText.length > 0)
const isEmailOrPhoneFilled = computed(
  () =>
    (state.inputEmail.length || state.inputPhone.length) && state.emailCorrect && state.phoneCorrect
)

watch(
  () => store.chosenLang,
  () => {
    state.activeActionText = getActualActionText()
  }
)

const endpointUrl = `${__API_URL__}/createExtUserQuestion`

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      ...props.query,
      extActionId: store.selectedActionId,
      text: state.inputText,
      email: state.inputEmail,
      phone: state.inputPhone
    })
    .then(function (response) {
      store.extFeedbackActionId = response.data
      state.successPage = true
      state.activeItem++
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

const validateEmail = () => {
  const email = state.inputEmail
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  state.emailCorrect = emailPattern.test(email) || !email.length
  return state.emailCorrect || state.activeActionText?.errorEmail
}

const validatePhone = () => {
  const phoneNum = state.inputPhone
  // First, try validating as a Slovak phone number
  let phoneValidationResult = phone(phoneNum, { country: 'SK' })
  // If not valid as Slovak, try validating as an international number
  if (!phoneValidationResult.isValid) {
    phoneValidationResult = phone(phoneNum)
  }
  state.phoneCorrect = phoneValidationResult.isValid || !state.inputPhone.length
  return state.phoneCorrect || state.activeActionText?.errorPhone
}

const previousPage = () => {
  state.activeItem--
  if (state.activeItem < 0) {
    store.selectedActionId = null
    store.selectedActionType = 'compound' as any
  }
}
const nextPage = () => {
  if (state.activeItem === 0) {
    if (!state.inputText || state.inputText.length < 1) {
      state.inputTextError = true
      return
    } else {
      state.inputTextError = false
    }
  }
  state.activeItem++
}

const goToPage = (url: string | undefined) => {
  window.location.href = url ?? '/'
}

const ctaClick = () => {
  if (store.compoundAction) {
    // go to review page
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
    height="520px"
  >
    <v-carousel-item :value="0" :disabled="state.activeItem !== 0">
      <h1 class="pb-5">{{ state.activeActionText?.title }}</h1>
      <p class="pb-1">
        {{ state.activeActionText?.text }}
      </p>
      <div class="py-10">
        <v-text-field
          v-model="state.inputText"
          :label="state.activeActionText?.inputQuestionText"
          :hint="state.activeActionText?.typeQuestionText"
          variant="outlined"
          type="text"
        ></v-text-field>
        <span v-if="state.inputTextError" class="error"
          >*{{ state.activeActionText?.requiredText }}</span
        >
      </div>

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
          @click="nextPage"
          :disabled="!isTextFilled"
        >
          {{ state.activeActionText?.buttonNext }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item :value="1" :disabled="state.activeItem !== 1">
      <h1 class="pb-5">{{ state.activeActionText?.title }}</h1>
      <p class="pb-1">
        {{ state.activeActionText?.secondText }}
      </p>
      <v-text-field
        v-model="state.inputPhone"
        :label="state.activeActionText?.phoneText"
        :hint="state.activeActionText?.typePhone"
        :rules="[validatePhone]"
        class="py-3"
        variant="outlined"
        type="tel"
        required
      ></v-text-field>
      <v-text-field
        v-model="state.inputEmail"
        :label="state.activeActionText?.mailText"
        :hint="state.activeActionText?.typeEmail"
        :rules="[validateEmail]"
        class="py-3"
        variant="outlined"
        type="email"
        required
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
          :disabled="!isEmailOrPhoneFilled"
          @click="pushData"
        >
          {{ state.activeActionText?.buttonOk }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item :value="2" :disabled="state.activeItem !== 2">
      <div v-if="state.successPage">
        <h1 class="pb-5">{{ state.activeActionText?.successTitle }}</h1>
        <p class="pb-10">
          {{ state.activeActionText?.successText }}
        </p>
        <p class="pb-10">
          {{ state.activeActionText?.successText2 }}
        </p>
      </div>
      <div v-else>
        <h1 class="pb-1">{{ state.activeActionText?.cancelTitle }}</h1>
        <p>
          {{ state.activeActionText?.cancelText }}
        </p>
      </div>
      <div class="text-center">
        <v-btn class="checkpoint-button" @click="ctaClick">
          {{ state.activeActionText?.buttonCTA }}
        </v-btn>
      </div>
    </v-carousel-item>
  </v-carousel>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>
