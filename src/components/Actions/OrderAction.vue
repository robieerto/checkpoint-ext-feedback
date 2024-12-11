<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import axios from 'axios'

import store from '@/store'
import * as types from '@/types'

const endpointUrl = `${__API_URL__}/createExtUserOrder`

const state = reactive({
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  error: '',
  showError: false
})

const inputs = reactive({
  number: 1,
  text: '',
  selectedOption: setSelectedOption() as number | null,
  checkboxes: {} as any
})

const noteFocused = ref(false)
const selectedOptionIsDisabled = ref(false)

const texts = computed(() => store.selectedAction?.texts?.[store.chosenLang] as types.OrderAction)
const reservationText = computed(() => {
  let text = texts.value?.reservationText!
  const textInputs = createTextInputs()
  textInputs?.forEach((input, index) => {
    text = text?.replace(`$${index + 1}`, input ?? '')
  })
  return text
})
const reservation = computed(() => store.selectedAction?.reservation)
const isReservationExclusive = computed(() => !!reservation.value?.exclusive)
const reservationDate = computed(() => {
  if (isReservationExclusive.value) {
    const reservationDate = new Date()
    if (reservation.value?.type === 'tomorrow') {
      reservationDate.setDate(reservationDate.getDate() + 1)
    }
    return reservationDate.toLocaleDateString('sk-SK').replace(/\s/g, '')
  } else {
    return null
  }
})
const options = computed(() => store.selectedAction.options)
const isOptionSelected = computed(() =>
  options?.value?.selection ? inputs.selectedOption !== null : true
)
const areAllOptionsDisabled = computed(() =>
  options?.value?.selection
    ? texts.value?.selectOptions?.every((_, index) => isOptionDisabled(index))
    : false
)

const createPostInputs = () => {
  const postInputs = []
  if (options.value?.inputNumber) {
    postInputs.push(inputs.number.toString())
  }
  if (options.value?.selection) {
    postInputs.push(
      store.selectedAction?.texts?.[store.buildingData?.language ?? 'sk']?.selectOptions?.[
        inputs.selectedOption!
      ]
    )
  }
  if (options.value?.inputText) {
    postInputs.push(inputs.text)
  }
  if (options.value?.checkbox) {
    const buildingLanguageTexts =
      store.selectedAction?.texts?.[store.buildingData?.language ?? 'sk']?.checkboxesTexts

    const checkedTexts = Object.keys(inputs.checkboxes)
      .filter((key) => inputs.checkboxes[key])
      .map((_, index) => buildingLanguageTexts?.[index])
      .join(' ')

    postInputs.push(checkedTexts)
  }
  return postInputs
}

const createTextInputs = () => {
  const textInputs = []
  if (options.value?.inputNumber) {
    textInputs.push(inputs.number.toString())
  }
  if (options.value?.selection) {
    textInputs.push(texts.value?.selectOptions?.[inputs.selectedOption!])
  }
  if (options.value?.inputText) {
    textInputs.push(inputs.text)
  }
  if (options.value?.checkbox) {
    const buildingLanguageTexts = texts.value?.checkboxesTexts

    const checkedTexts = Object.keys(inputs.checkboxes)
      .filter((key) => inputs.checkboxes[key])
      .map((_, index) => buildingLanguageTexts?.[index])
      .join(' ')

    textInputs.push(checkedTexts)
  }
  return textInputs
}

const pushData = () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      buildingId: store.buildingId,
      checkpointId: store.checkpointId,
      extActionPath: store.selectedAction?.path,
      selectedOption: inputs.selectedOption,
      inputs: createPostInputs()
    })
    .then(function (response) {
      store.extUserActionId = response.data
      state.successPage = true
      state.activeItem = 1
      createTextInputs()
      if (isReservationExclusive.value) {
        if (!reservation.value.dates) {
          reservation.value.dates = []
        }
        reservation.value.dates[inputs.selectedOption!] = reservationDate.value
      }
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

const validateInteger = (event: any) => {
  const value = event.target.value
  // Remove any non-digit characters
  const integerValue = value.replace(/\D/g, '')
  inputs.number = integerValue
}

const isOptionReserved = (index: number) =>
  isReservationExclusive.value && reservation.value?.dates?.[index] === reservationDate.value

const isOptionAfterStartTime = (index: number) => {
  const optionStartTime = reservation.value?.times?.[index]?.start
  if (optionStartTime) {
    const hoursInAdvance = reservation.value?.hoursInAdvance ?? 0
    const currentDatePlusAdvance = new Date()
    currentDatePlusAdvance.setHours(currentDatePlusAdvance.getHours() + hoursInAdvance)
    const currentTimePlusAdvance = currentDatePlusAdvance.getTime()
    const [hours, minutes] = optionStartTime.split(':')
    const optionDate = new Date()
    optionDate.setHours(Number(hours))
    optionDate.setMinutes(Number(minutes))
    const optionTime = optionDate.getTime()
    return currentTimePlusAdvance + hoursInAdvance > optionTime
  } else {
    return false
  }
}

const isOptionDisabled = (index: number) => {
  if (reservation.value) {
    return isOptionReserved(index) || isOptionAfterStartTime(index)
  } else {
    return false
  }
}

watch(
  () => inputs.number,
  () => {
    if (inputs.number && inputs.number < 1) {
      inputs.number = 1
    }
  }
)

watch(
  () => inputs.selectedOption,
  () => {
    if (inputs.selectedOption !== null && isOptionDisabled(inputs.selectedOption)) {
      selectedOptionIsDisabled.value = true
    }
  },
  { immediate: true }
)

const previousPage = () => {
  state.activeItem--
  if (state.activeItem < 0) {
    store.selectedActionId = null
  }
}

const ctaClick = () => {
  store.selectedActionId = store.selectedAction?.upsellId
}

const backToMenuClick = () => {
  store.selectedActionId = null
}

function setSelectedOption() {
  const defaultOption = store.selectedAction?.reservation?.times?.[0]
  if (!store.selectedAction?.options?.selection && defaultOption) {
    return 0
  } else {
    return null
  }
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
      <v-list max-height="65vh">
        <h1>{{ texts?.title }}</h1>
        <p v-if="texts?.text" class="pb-1">
          {{ texts?.text }}
        </p>
        <div v-if="texts?.texts" class="pb-1">
          <p v-for="(text, index) in texts?.texts" :key="index">
            {{ text }}
          </p>
        </div>

        <v-text-field
          v-if="options?.inputNumber"
          v-model="inputs.number"
          :label="texts?.inputText"
          :hint="texts?.typeNumberText"
          class="pb-5"
          variant="outlined"
          type="number"
          @input="validateInteger"
          @blur="() => !inputs.number && (inputs.number = 1)"
        ></v-text-field>
        <p v-if="texts?.selectionText">
          {{ texts?.selectionText }}
        </p>
        <span v-if="areAllOptionsDisabled" class="error font-weight-bold">{{
          texts?.reservationFull
        }}</span>
        <v-radio-group v-if="options?.selection" v-model="inputs.selectedOption" color="#705d0d">
          <v-radio
            v-for="(option, index) in texts?.selectOptions"
            :label="option"
            :value="index"
            :key="index"
            :disabled="isOptionDisabled(index)"
          ></v-radio>
        </v-radio-group>
        <p v-if="texts?.stringInputText">
          {{ texts?.stringInputText }}
        </p>
        <v-text-field
          v-if="options?.inputText"
          v-model="inputs.text"
          :hint="texts?.typeText"
          :label="noteFocused ? texts?.labelText : texts?.typeText"
          class="pb-5"
          variant="outlined"
          :maxlength="100"
          @update:focused="(e: any) => (noteFocused = e)"
        ></v-text-field>
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
            :disabled="selectedOptionIsDisabled || !isOptionSelected || state.loadingBtn"
            @click="pushData"
          >
            {{ texts?.buttonOk }}
          </v-btn>
        </div>
      </v-list>
    </v-carousel-item>

    <v-carousel-item :value="1" :disabled="!state.activeItem">
      <div v-if="state.successPage">
        <h1 class="pb-0">{{ texts?.successTitle }}</h1>
        <v-list max-height="62vh">
          <v-card class="mx-auto mb-5 pt-1 pb-2">
            <v-card-title>{{ texts?.reservation }}</v-card-title>
            <v-card-text>
              {{ reservationText }}
            </v-card-text>
          </v-card>
          <p v-if="texts?.successText" class="pb-5">
            {{ texts?.successText }}
          </p>
          <div v-if="texts?.successTexts" class="pb-5">
            <p v-for="(text, index) in texts?.successTexts" :key="index">
              {{ text }}
            </p>
          </div>
          <p v-if="store.hasViewsData && texts?.buttonCTA">
            {{ texts?.ctaText }}
          </p>
        </v-list>
      </div>
      <div v-if="store.hasViewsData" class="text-center">
        <v-btn v-if="texts?.buttonCTA" class="checkpoint-button" @click="ctaClick">
          {{ texts?.buttonCTA }}
        </v-btn>
        <v-btn
          variant="text"
          class="checkpoint-secondary-button mt-5 mb-12"
          @click="backToMenuClick"
        >
          {{ texts?.buttonBackMenu }}
        </v-btn>
      </div>
    </v-carousel-item>
  </v-carousel>
  <v-snackbar v-model="state.showError" rounded="pill">{{ state.error }}</v-snackbar>
</template>
