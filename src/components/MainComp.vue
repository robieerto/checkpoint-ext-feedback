<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { useRoute, type LocationQuery } from 'vue-router'
import axios from 'axios'
import store from '@/store'
import ActionComp from './ActionComp.vue'

const route = useRoute()

const state = reactive({
  loading: true,
  errorCheckpoint: false
})

const endpointUrl = `${__API_URL__}/extFeedbackActionData`

const getData = (query: LocationQuery) => {
  axios
    .get(endpointUrl, {
      params: query
    })
    .then((response) => {
      store.buildingId = query.buildingId
      store.checkpointId = query.checkpointId
      store.extFeedbackId = query.extFeedbackId
      store.extActionId = query.extActionId

      store.checkpointName = response.data?.checkpointName
      store.actionData = response.data?.actionData
      store.feedbackData = response.data?.extFeedbackData
      store.buildingData = response.data?.building
      store.chosenLang = response.data?.building?.language ?? 'sk'

      store.languages = Object.keys(
        store.extFeedbackId ? store.feedbackData.texts : store.actionData.texts
      )
    })
    .catch(function (error) {
      // handle error
      console.log(error.response.data)
      if (error.response.data == 'Checkpoint not found') {
        state.errorCheckpoint = true
      }
    })
    .finally(() => {
      state.loading = false
    })
}

watch(
  () => route.query,
  (query) => Object.keys(query).length && getData(query),
  { immediate: true }
)

// if query params not present
setTimeout(() => {
  if (!Object.keys(route.query).length) state.loading = false
}, 1000)
</script>

<template>
  <main>
    <div class="text-center">
      <v-progress-circular v-if="state.loading" indeterminate />
    </div>
    <ActionComp v-if="!state.loading" />
    <ErrorCheckpoint v-if="state.errorCheckpoint" :query="route.query" />
    <LangChooser v-if="!state.loading" />
  </main>
</template>

<style lang="scss">
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

.error {
  color: #66380d;
}
</style>
