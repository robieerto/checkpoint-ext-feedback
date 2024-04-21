<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRoute, type LocationQuery } from 'vue-router'
import axios from 'axios'

const route = useRoute()

const state = reactive({
  data: null,
  query: null,
  loading: true
})

const endpointUrl = `${__API_URL__}/extFeedbackActionData`

const getData = (query: LocationQuery) => {
  axios
    .get(endpointUrl, {
      params: query
    })
    .then((response) => {
      state.data = response.data
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
    <v-progress-circular v-if="state.loading" indeterminate />
    <MainCarousel v-if="state.data && route.query" :data="state.data" :query="route.query" />
  </main>
</template>
