<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { useRoute, type LocationQuery } from 'vue-router'
import axios from 'axios'
import store from '@/store'

const route = useRoute()

const state = reactive({
  data: null,
  langsData: null,
  actionType: null,
  query: null,
  loading: true
})

const endpointUrl = `${__API_URL__}/extFeedbackActionData`

const areDataReady = computed(() => state.data && route.query)
const areLangsDataReady = computed(() => state.langsData && route.query)
const isCompoundAction = computed(() => state.actionType === 'compound')

const getData = (query: LocationQuery) => {
  axios
    .get(endpointUrl, {
      params: query
    })
    .then((response) => {
      store.chosenLang = response.data?.building?.language ?? 'cz'
      state.data = response.data
      state.actionType = response.data?.actionType
      if (isCompoundAction.value) {
        // state.langsData = Object.keys(response.data?.actionDataList).filter(
        //   (propName) => propName !== 'extAction'
        // ) as any
      } else {
        store.selectedActionId = query.extActionId as any
        state.langsData = response.data?.actionDataList
        console.log('state.langsData', state.langsData)
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error.response.data)
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

setTimeout(() => {
  if (!Object.keys(route.query).length) state.loading = false
}, 1000)
</script>

<template>
  <main>
    <div class="text-center">
      <v-progress-circular v-if="state.loading" indeterminate />
    </div>
    <CompoundAction
      v-if="areDataReady && isCompoundAction"
      :data="state.data"
      :query="route.query"
    />
    <OccurrenceCarousel
      v-if="areDataReady && !isCompoundAction"
      :data="state.data"
      :query="route.query"
    />
    <LangChooser v-if="areLangsDataReady && route.query" :actionTexts="state.langsData" />
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
