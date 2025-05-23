<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

import { validatePhone } from '@/helpers'
import store from '@/store'
import * as types from '@/types'

const route = useRoute()

const endpointUrl = `${__API_URL__}/createExtUserOrder`
const getDataUrl = `${__API_URL__}/extFeedbackActionData`

const { selectedAction } = store

const state = reactive({
  activeItem: 0,
  successPage: false,
  loadingBtn: false,
  error: '',
  showError: false,
  inputPhone: store.userPhone,
  phoneCorrect: true,
  tab: null as any
})

const inputs = reactive({
  number: 1,
  text: '',
  selectedOptionId: null as number | null,
  checkboxes: {} as any
})

const options = selectedAction.options
const reservation = selectedAction?.reservation
const reservationTimes = reservation?.times as types.ReservationTime[]
const isReservationExclusive = !!reservation?.exclusive
const areMultipleTimeTypes = !!reservation?.multipleTimeTypes

const reservationDate = (() => {
  if (isReservationExclusive) {
    const date = new Date()
    if (reservation?.type === 'tomorrow') {
      date.setDate(date.getDate() + 1)
    }
    return date.toLocaleDateString('sk-SK').replace(/\s/g, '')
  } else {
    return null
  }
})()

const reservationTimesGroupedByType = reservationTimes?.reduce(
  (acc, time, id) => {
    if (!acc[time.type]) {
      acc[time.type] = []
    }
    acc[time.type].push({ ...time, id })
    return acc
  },
  {} as Record<string, (types.ReservationTime & { id: number })[]>
)

const texts = computed(() => selectedAction?.texts?.[store.chosenLang] as types.OrderAction)
const reservationText = computed(() => {
  let text = texts.value?.reservationText!
  const textInputs = createTextInputs()
  textInputs?.forEach((input, index) => {
    text = text?.replace(`$${index + 1}`, input ?? '')
  })
  return text
})

const isOptionSelected = computed(() =>
  options?.selection ? inputs.selectedOptionId !== null : true
)
const areAllOptionsDisabled = computed(() =>
  options?.selection ? reservationTimes?.every((_, index) => isOptionDisabled(index)) : false
)
const isPhoneCorrect = computed(
  () => state.phoneCorrect && (options?.phoneRequired ? !!state.inputPhone.length : true)
)

const formatTimeRange = (index: number) => {
  const time = reservationTimes?.[index]
  return time?.start + (time?.end ? ` - ${time.end}` : '')
}

const createPostInputs = () => {
  const postInputs = []
  if (options?.selection) {
    // postInputs.push(
    //   selectedAction?.texts?.[store.buildingData?.language ?? 'sk']?.selectOptions?.[
    //     inputs.selectedOption!
    //   ]
    // )
    postInputs.push(formatTimeRange(inputs.selectedOptionId!))
  }
  if (options?.inputNumber) {
    postInputs.push(inputs.number.toString())
  }
  if (options?.inputText) {
    postInputs.push(inputs.text)
  }
  if (options?.checkbox) {
    const buildingLanguageTexts =
      selectedAction?.texts?.[store.buildingData?.language ?? 'sk']?.checkboxesTexts

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
  if (options?.selection) {
    textInputs.push(formatTimeRange(inputs.selectedOptionId!))
  }
  if (options?.inputNumber) {
    textInputs.push(inputs.number.toString())
  }
  if (options?.inputText) {
    textInputs.push(inputs.text)
  }
  if (options?.checkbox) {
    const buildingLanguageTexts = texts.value?.checkboxesTexts

    const checkedTexts = Object.keys(inputs.checkboxes)
      .filter((key) => inputs.checkboxes[key])
      .map((_, index) => buildingLanguageTexts?.[index])
      .join(' ')

    textInputs.push(checkedTexts)
  }
  return textInputs
}

const pushData = async () => {
  state.loadingBtn = true
  axios
    .post(endpointUrl, {
      buildingId: store.buildingId,
      checkpointId: store.userRoomId ?? store.checkpointId,
      extActionPath: selectedAction?.path,
      selectedOption: inputs.selectedOptionId,
      inputs: createPostInputs(),
      note: inputs.text,
      phone: state.inputPhone || undefined
    })
    .then(function (response) {
      store.extUserActionId = response.data
      state.successPage = true
      state.activeItem = 1
      createTextInputs()
      if (isReservationExclusive) {
        reloadActionData()
      }
      if (state.inputPhone) {
        store.userPhone = state.inputPhone
        localStorage.setItem('userPhone', store.userPhone)
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

const reloadActionData = async () => {
  axios
    .get(getDataUrl, {
      params: route.query
    })
    .then((response) => {
      store.actionsData = response.data?.actionsDataList
    })
    .catch(function (error) {
      // handle error
      console.log(error)
    })
}

const isOptionReserved = (index: number) =>
  isReservationExclusive && reservationTimes?.[index]?.dateReserved === reservationDate

const isOptionAfterStartTime = (index: number) => {
  const optionStartTime = reservationTimes?.[index]?.start
  if (optionStartTime && reservation?.type === 'today') {
    const hoursInAdvance = reservation?.hoursInAdvance ?? 0
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
  if (reservation) {
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

const previousPage = () => {
  if (state.activeItem > 0) {
    state.activeItem--
  } else {
    if (store.hasViewsData) {
      store.selectedActionId = null
    }
  }
}

const ctaClick = () => {
  store.selectedActionId = selectedAction?.upsellId
}

const backToMenuClick = () => {
  store.selectedActionId = null
}
</script>

<template>
  <v-carousel
    v-model="state.activeItem"
    id="order-action"
    :data-action-id="selectedAction?.id"
    :show-arrows="false"
    :hide-delimiter-background="true"
    color="#705D0D"
    height="75vh"
  >
    <v-carousel-item :value="0" :disabled="!!state.activeItem">
      <v-list max-height="65vh" style="overflow-x: hidden">
        <h1>{{ texts?.title }}</h1>
        <p v-if="texts?.text" class="pb-1">
          {{ texts?.text }}
        </p>
        <div v-if="texts?.texts" class="pb-1">
          <p v-for="(text, index) in texts?.texts" :key="index">
            {{ text }}
          </p>
        </div>

        <p v-if="texts?.selectionText" class="mb-0">
          {{ texts?.selectionText }}
        </p>

        <span v-if="areAllOptionsDisabled" class="error font-weight-bold">{{
          texts?.reservationFull
        }}</span>

        <div v-if="areMultipleTimeTypes">
          <v-tabs v-model="state.tab" align-tabs="center" fixed-tabs>
            <v-tab
              v-for="(_, type) in reservationTimesGroupedByType"
              :key="type"
              :value="type"
              readonly
              >{{ type }}</v-tab
            >
          </v-tabs>

          <v-row v-if="options?.selection">
            <v-col v-for="(typeGroup, type) in reservationTimesGroupedByType" :key="type">
              <v-radio-group v-model="inputs.selectedOptionId" color="#705d0d">
                <v-radio
                  v-for="option in typeGroup"
                  :label="formatTimeRange(option.id)"
                  :value="option.id"
                  :key="option.id"
                  :disabled="isOptionDisabled(option.id)"
                  @click="() => (state.tab = type)"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </div>

        <div v-else>
          <div v-if="options?.selection">
            <v-radio-group v-model="inputs.selectedOptionId" color="#705d0d">
              <v-radio
                v-for="(_, index) in reservationTimes"
                :label="formatTimeRange(index)"
                :value="index"
                :key="index"
                :disabled="isOptionDisabled(index)"
              ></v-radio>
            </v-radio-group>
          </div>
        </div>

        <div v-if="options?.checkbox">
          <v-checkbox
            v-for="(option, index) in texts?.checkboxes"
            v-model="inputs.checkboxes[index]"
            :key="index"
            :label="option"
          ></v-checkbox>
        </div>

        <div v-if="options?.inputNumber">
          <p>
            {{ texts?.numberInputText }}
          </p>
          <v-number-input
            v-if="options?.inputNumber"
            v-model="inputs.number"
            :label="texts?.inputText"
            :hint="texts?.typeNumberText"
            class="pb-2"
            controlVariant="split"
            variant="outlined"
            :min="1"
            :max="30"
            @blur="() => !inputs.number && (inputs.number = 1)"
          ></v-number-input>
        </div>

        <p v-if="texts?.bottomText" class="pb-1">
          {{ texts?.bottomText }}
        </p>

        <div v-if="options?.noteInput">
          <p>
            {{ texts?.noteText }}
          </p>
          <v-text-field
            v-model="inputs.text"
            :hint="texts?.typeNote"
            :label="texts?.noteInput"
            class="pb-2"
            variant="outlined"
            :maxlength="100"
          ></v-text-field>
        </div>

        <div v-if="options?.phoneInput">
          <p>
            {{ texts?.phoneText }}
          </p>
          <v-text-field
            v-model="state.inputPhone"
            :label="texts?.phoneInput"
            :hint="texts?.typePhone"
            :rules="[validatePhone(state.inputPhone) || texts.errorPhone]"
            class="pb-3"
            variant="outlined"
            type="tel"
            required
            maxlength="20"
          ></v-text-field>
        </div>

        <div class="text-end">
          <v-btn
            v-if="store.hasViewsData"
            id="back-button"
            variant="text"
            class="checkpoint-secondary-button"
            @click="previousPage"
            :disabled="state.loadingBtn"
          >
            {{ texts?.buttonBack }}
          </v-btn>
          <v-btn
            v-if="texts?.buttonOk"
            id="submit-button"
            variant="flat"
            class="checkpoint-button"
            :loading="state.loadingBtn"
            :disabled="!isOptionSelected || state.loadingBtn || !isPhoneCorrect"
            @click="pushData"
          >
            {{ texts?.buttonOk }}
          </v-btn>
        </div>
      </v-list>
    </v-carousel-item>

    <v-carousel-item v-if="texts?.buttonOk" :value="1" :disabled="!state.activeItem">
      <div v-if="state.successPage" id="success-page">
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
        <v-btn
          v-if="texts?.buttonCTA"
          id="upsell-button"
          class="checkpoint-button"
          @click="ctaClick"
        >
          {{ texts?.buttonCTA }}
        </v-btn>
        <v-btn
          id="back-to-menu-button"
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
