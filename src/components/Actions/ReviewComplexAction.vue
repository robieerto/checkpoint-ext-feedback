<script setup lang="ts">
import { reactive, computed } from 'vue'
import axios from 'axios'

import store from '@/store'
import * as types from '@/types'

const options = store.selectedAction?.options
const showContactPage = !!options?.contactPage

const state = reactive({
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  inputScore: 0,
  inputNote: '',
  inputEmail: '',
  error: '',
  showError: false,
  inputScoreError: false,
  emailCorrect: true,
  isNegativeRating: false,
  selectedChoices: new Array(options?.numberPages?.positive).fill([]) as any[],
  otherUserInputs: new Array(options?.numberPages?.positive).fill('') as any[]
})

const isScoreFilled = computed(() => state.inputScore > 0)
const text = computed(() => store.selectedAction?.texts?.[store.chosenLang] as types.ReviewAction)
const questionPagesText = computed(() =>
  !state.isNegativeRating ? text.value?.positivePages : text.value?.negativePages
)
const numberOfQuestionPages = computed(() =>
  !state.isNegativeRating ? options?.numberPages?.positive : options?.numberPages?.negative
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
      buildingId: store.buildingId,
      checkpointId: store.checkpointId,
      extActionPath: store.selectedAction?.path,
      score: state.inputScore,
      note: state.inputNote,
      questionnaire: dataToQuestionnairePost(),
      email: state.inputEmail !== '' ? state.inputEmail : undefined
    })
    .then(function (response) {
      store.extUserActionId = response.data
      if (state.inputScore < 4) {
        state.successPage = false
      } else {
        state.successPage = true
      }
      nextPage()
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

const validateEmail = () => {
  const email = state.inputEmail
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  state.emailCorrect = emailPattern.test(email) || !email.length
  return state.emailCorrect || text.value?.errorEmail
}

const previousPage = () => {
  if (state.activeItem > 0) {
    state.activeItem--
  } else {
    if (store.hasViewsData) {
      store.selectedActionId = null
    }
  }
}

const goToPage = (url: string | undefined) => {
  window.location.href = url ?? '/'
}

const resetChoicesAndInputs = () => {
  state.selectedChoices = new Array(numberOfQuestionPages.value).fill([])
  state.otherUserInputs = new Array(numberOfQuestionPages.value).fill('')
}

const dataToQuestionnairePost = () => {
  console.log(state.selectedChoices)

  return state.selectedChoices.map((pageChoices, index) => {
    const questionPage = questionPagesText.value?.[index] as any
    const question = questionPage.question
    return {
      question: question,
      answers: pageChoices.map((choice: any) => ({
        choice: choice
      })),
      otherInput: state.otherUserInputs[index]
    }
  })
}

const nextPage = () => {
  if (state.activeItem == 0) {
    if (state.inputScore < 4) {
      if (state.isNegativeRating != true) {
        state.isNegativeRating = true
        resetChoicesAndInputs()
      }
    } else {
      if (state.isNegativeRating != false) {
        state.isNegativeRating = false
        resetChoicesAndInputs()
      }
    }
  }
  state.activeItem++
}

const ctaClick = () => {
  if (store.buildingData?.googleUrl) {
    goToPage(store.buildingData?.googleUrl)
  } else {
    goToPage(store.buildingData?.website)
  }
}

const backToMenuClick = () => {
  store.selectedActionId = null
}
</script>

<template>
  <v-carousel
    v-model="state.activeItem"
    id="review-action"
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
      <p v-if="text?.textQuestion" class="fw-bold">{{ text?.textQuestion }}</p>
      <div class="text-center py-2">
        <v-rating v-model="state.inputScore" density="default" hover></v-rating>
      </div>
      <span v-if="state.inputScoreError" class="error">*{{ text?.requiredScore }}</span>
      <v-text-field
        v-if="!options?.hiddenRatingQuestion"
        v-model="state.inputNote"
        :label="text?.inputText"
        :hint="text?.typeText"
        class="py-5"
        variant="outlined"
        type="text"
        maxlength="100"
      ></v-text-field>
      <div v-else class="py-3"></div>
      <div class="text-end">
        <v-btn
          v-if="store.hasViewsData"
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
          :disabled="!isScoreFilled"
        >
          {{ text?.buttonNext }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item
      v-for="(page, index) in questionPagesText"
      :key="index + 1"
      :value="index + 1"
      :disabled="state.activeItem !== index + 1"
    >
      <p class="pb-1 fw-bold">{{ (page as any)?.question }}</p>
      <v-checkbox
        v-for="(choice, indexPage) in (page as any)?.choices"
        :key="indexPage"
        :value="choice"
        v-model="state.selectedChoices[index]"
        :label="choice"
        class="pb-3"
        color="#705d0d"
        hide-details
      ></v-checkbox>
      <v-text-field
        v-model="state.otherUserInputs[index]"
        :label="(page as any)?.otherInput"
        :hint="(page as any)?.otherText"
        class="py-5"
        variant="outlined"
        type="text"
        maxlength="100"
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
          v-if="index + 1 < numberOfQuestionPages || showContactPage"
          id="next-button"
          variant="flat"
          class="checkpoint-button"
          @click="nextPage"
        >
          {{ text?.buttonNext }}
        </v-btn>
        <v-btn
          v-else
          id="submit-button"
          variant="flat"
          class="checkpoint-button"
          :loading="state.loadingBtn"
          @click="pushData"
        >
          {{ text?.buttonOk }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item
      v-if="showContactPage"
      :value="numberOfQuestionPages + 1"
      :disabled="state.activeItem !== numberOfQuestionPages + 1"
    >
      <div v-if="!state.isNegativeRating">
        <p v-if="text?.contactPositiveTitle" class="pb-5 fw-bold">
          {{ text?.contactPositiveTitle }}
        </p>
        <p v-if="text?.contactPositiveText" class="">{{ text?.contactPositiveText }}</p>
      </div>
      <div v-else>
        <p v-if="text?.contactNegativeTitle" class="pb-2 fw-bold">
          {{ text?.contactNegativeTitle }}
        </p>
        <p v-if="text?.contactNegativeText" class="">{{ text?.contactNegativeText }}</p>
      </div>
      <v-text-field
        v-model="state.inputEmail"
        :label="text?.mailText"
        :hint="text?.typeEmail"
        :rules="[validateEmail]"
        class="py-3"
        variant="outlined"
        type="email"
        required
        maxlength="50"
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
          :disabled="!state.emailCorrect"
          @click="pushData"
        >
          {{ text?.buttonOk }}
        </v-btn>
      </div>
    </v-carousel-item>

    <v-carousel-item
      :value="numberOfQuestionPages + 1 + showContactPage"
      :disabled="state.activeItem !== numberOfQuestionPages + 1 + showContactPage"
    >
      <div v-if="state.successPage" id="success-page">
        <h1 class="py-10">{{ text?.successTitle }}</h1>
        <p class="pb-10">
          {{ text?.successText }}
        </p>
        <div class="text-center">
          <v-btn id="upsell-button" class="checkpoint-button" @click="ctaClick">
            {{ text?.buttonCTA }}
          </v-btn>
        </div>
      </div>
      <div v-else id="success-page">
        <h1 class="py-10">{{ text?.cancelTitle }}</h1>
        <p>
          {{ text?.cancelText }}
        </p>
      </div>
      <div v-if="store.hasViewsData" class="text-center">
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

<style lang="scss">
.v-rating__wrapper {
  padding: 5px;
}

.v-rating__item .v-btn .v-icon {
  color: #705d0d;
}
</style>
