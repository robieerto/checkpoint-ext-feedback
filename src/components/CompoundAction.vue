<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import axios from 'axios'
import { type LocationQuery } from 'vue-router'

import store from '@/store'
import * as types from '@/types'

const props = defineProps<{
  data: types.ExtFeedbackAction
  query: LocationQuery
}>()

const state = reactive({
  data: {
    occurrence: null,
    order: null,
    question: null,
    review: null
  } as Record<string, any> // Add type annotation here
})

const allDataLoaded = computed(() => {
  return Object.values(state.data).every((data) => data !== null)
})

watch(
  () => store.selectedActionType,
  () => {
    if (store.selectedActionType === 'review') {
      store.selectedActionId = props.data.actionDataList.find(
        (action) => action.type === 'review'
      )?.extAction
    }
  }
)

const endpointUrl = `${__API_URL__}/extFeedbackActionData`

const getData = (query: LocationQuery) => {
  axios
    .get(endpointUrl, {
      params: query
    })
    .then((response) => {
      const data = response.data
      const actionType = data?.actionType
      if (Object.prototype.hasOwnProperty.call(state.data, actionType)) {
        state.data[actionType] = data
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error.response.data)
    })
    .finally(() => {})
}

const getAllData = () => {
  for (const action of props.data.actionDataList) {
    getData({ ...props.query, extActionId: action.extAction })
  }
}

getAllData()

const selectAction = (extActionId: any, type: any) => {
  store.selectedActionId = extActionId
  store.selectedActionType = type
}
</script>

<template>
  <div class="text-center">
    <v-progress-circular v-if="!allDataLoaded" indeterminate />
  </div>
  <div v-if="!store.selectedActionId && allDataLoaded">
    <h1 class="pb-5">Dobrý deň, o čo máte záujem?</h1>
    <h4 class="pb-1">{{ props.data.checkpointName }}:</h4>
    <div class="py-4" v-for="(action, index) in props.data.actionDataList" :key="index">
      <v-btn
        variant="flat"
        class="checkpoint-button w-100"
        @click="selectAction(action.extAction, action.type)"
        >{{ action[store.chosenLang] }}</v-btn
      >
    </div>
  </div>
  <OccurrenceCarousel
    v-if="store.selectedActionType === 'occurrence'"
    :data="state.data.occurrence"
    :query="props.query"
  />
  <OrderCarousel
    v-if="store.selectedActionType === 'order'"
    :data="state.data.order"
    :query="props.query"
  />
  <QuestionCarousel
    v-if="store.selectedActionType === 'question'"
    :data="state.data.question"
    :query="props.query"
  />
  <ReviewCarousel
    v-if="store.selectedActionType === 'review'"
    :data="state.data.review"
    :query="props.query"
  />
</template>
