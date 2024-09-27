<script setup lang="ts">
import { type LocationQuery } from 'vue-router'

const props = defineProps<{
  query: LocationQuery
}>()
</script>

<template>
  <v-carousel
    model-value="0"
    :show-arrows="false"
    :hide-delimiter-background="true"
    color="#705D0D"
    height="400px"
  >
    <v-carousel-item :value="0" :disabled="true">
      <h1 class="pb-5">Checkpoint nie je priradený</h1>
      <p class="pb-1 fw-bold fs-4">Checkpoint ID: {{ props.query?.checkpointId }}</p>
    </v-carousel-item>
  </v-carousel>
</template>
