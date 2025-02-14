<script setup lang="ts">
import { reactive, computed } from 'vue'
import axios from 'axios'
import { phone } from 'phone'

import store from '@/store'
import * as types from '@/types'

const state = reactive({
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

const text = computed(() => store.selectedAction?.texts?.[store.chosenLang] as types.QuestionAction)

const isTextFilled = computed(() => state.inputText.length > 0)
const isEmailOrPhoneFilled = computed(
  () =>
    (state.inputEmail.length || state.inputPhone.length) && state.emailCorrect && state.phoneCorrect
)

const endpointUrl = `${__API_URL__}/createExtUserQuestion`

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      buildingId: store.buildingId,
      checkpointId: store.checkpointId,
      extActionPath: store.selectedAction?.path,
      text: state.inputText,
      email: state.inputEmail,
      phone: state.inputPhone
    })
    .then(function (response) {
      store.extUserActionId = response.data
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
  return state.emailCorrect || text.value?.errorEmail
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
  return state.phoneCorrect || text.value?.errorPhone
}

const previousPage = () => {
  state.activeItem--
  if (state.activeItem < 0) {
    store.selectedActionId = null
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
    id="question-action"
    :data-action-id="store.selectedAction?.id"
    :show-arrows="false"
    :hide-delimiter-background="true"
    color="#705D0D"
    height="520px"
  >
    <v-carousel-item :value="0" :disabled="state.activeItem !== 0">
      <h1 class="pb-5">{{ text?.title }}</h1>
      <p class="pb-1">
        {{ text?.text }}
      </p>
      <div class="py-10">
        <v-text-field
          v-model="state.inputText"
          :label="text?.inputQuestionText"
          :hint="text?.typeQuestionText"
          variant="outlined"
          type="text"
        ></v-text-field>
        <span v-if="state.inputTextError" class="error">*{{ text?.requiredText }}</span>
      </div>

      <div class="text-end">
        <v-btn
          id="back-button"
          variant="text"
          class="checkpoint-secondary-button"
          @click="previousPage"
          :disabled="state.loadingBtn"
        >
          {{ text?.buttonBack }}
        </v-btn>
        <v-btn
          id="next-button"
          variant="flat"
          class="checkpoint-button"
          :loading="state.loadingBtn"
          @click="nextPage"
          :disabled="!isTextFilled"
        >
          {{ text?.buttonNext }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item :value="1" :disabled="state.activeItem !== 1">
      <h1 class="pb-5">{{ text?.title }}</h1>
      <p class="pb-1">
        {{ text?.secondText }}
      </p>
      <v-text-field
        v-model="state.inputPhone"
        :label="text?.phoneText"
        :hint="text?.typePhone"
        :rules="[validatePhone]"
        class="py-3"
        variant="outlined"
        type="tel"
        required
      ></v-text-field>
      <v-text-field
        v-model="state.inputEmail"
        :label="text?.mailText"
        :hint="text?.typeEmail"
        :rules="[validateEmail]"
        class="py-3"
        variant="outlined"
        type="email"
        required
      ></v-text-field>
      <div class="text-end">
        <v-btn
          id="back-button"
          variant="text"
          class="checkpoint-secondary-button"
          @click="previousPage"
          :disabled="state.loadingBtn"
        >
          {{ text?.buttonBack }}
        </v-btn>
        <v-btn
          id="submit-button"
          variant="flat"
          class="checkpoint-button"
          :loading="state.loadingBtn"
          :disabled="!isEmailOrPhoneFilled"
          @click="pushData"
        >
          {{ text?.buttonOk }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item :value="2" :disabled="state.activeItem !== 2">
      <div v-if="state.successPage" id="success-page">
        <h1 class="pb-5">{{ text?.successTitle }}</h1>
        <p class="pb-10">
          {{ text?.successText }}
        </p>
        <p v-if="store.hasViewsData" class="pb-10">
          {{ text?.successText2 }}
        </p>
      </div>
      <div v-else>
        <h1 class="pb-1">{{ text?.cancelTitle }}</h1>
        <p>
          {{ text?.cancelText }}
        </p>
      </div>
      <div v-if="store.hasViewsData" class="text-center">
        <v-btn id="upsell-button" class="checkpoint-button" @click="ctaClick">
          {{ text?.buttonCTA }}
        </v-btn>
        <v-btn
          id="back-to-menu-button"
          variant="text"
          class="checkpoint-secondary-button mt-5"
          @click="backToMenuClick"
        >
          {{ text?.buttonBackMenu }}
        </v-btn>
      </div>
    </v-carousel-item>
  </v-carousel>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>
