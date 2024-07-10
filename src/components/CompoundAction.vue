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

const state = reactive({
  data: {
    occurrence: null,
    order: null,
    question: null,
    review: null
  },
  loading: false
})

const endpointUrl = `${__API_URL__}/extFeedbackActionData`

const getData = (query: LocationQuery) => {
  state.loading = true
  axios
    .get(endpointUrl, {
      params: query
    })
    .then((response) => {
      state.data = response.data
      store.selectedActionType = response.data.actionType
    })
    .catch(function (error) {
      // handle error
      console.log(error.response.data)
    })
    .finally(() => {
      state.loading = false
    })
}

// const getAllData = () => {
//   for (const action of props.data.actionDataList) {
//     getData({ ...props.query, extActionId: action.extAction })
//   }
// }

const selectAction = (extActionId: any) => {
  store.selectedActionId = extActionId
  getData({ ...props.query, extActionId })
}
</script>

<template>
  <div class="text-center">
    <v-progress-circular v-if="state.loading" indeterminate />
  </div>
  <div v-if="!store.selectedActionId && !state.loading">
    <h1 class="pb-5">Dobrý deň, o čo máte záujem?</h1>
    <div class="py-4" v-for="(action, index) in props.data.actionDataList" :key="index">
      <v-btn
        variant="flat"
        class="checkpoint-button w-100"
        @click="selectAction(action.extAction)"
        >{{ action[store.chosenLang] }}</v-btn
      >
    </div>
  </div>
  <OccurrenceCarousel
    v-if="store.selectedActionType === 'occurrence'"
    :data="state.data"
    :query="props.query"
  />
  <OrderCarousel
    v-if="store.selectedActionType === 'order'"
    :data="state.data"
    :query="props.query"
  />
  <QuestionCarousel
    v-if="store.selectedActionType === 'question'"
    :data="state.data"
    :query="props.query"
  />
  <ReviewCarousel
    v-if="store.selectedActionType === 'review'"
    :data="state.data"
    :query="props.query"
  />
</template>
