<script setup lang="ts">
import { ref, watch } from 'vue'
import { thumbnailUrl, gsToHttps } from '@/helpers/firebase-storage'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  gsUrl: string
}>()

const src = ref(thumbnailUrl(props.gsUrl))

function loadFullRes(gsUrl: string) {
  const fullUrl = gsToHttps(gsUrl)
  const img = new Image()
  img.onload = () => {
    src.value = fullUrl
  }
  img.src = fullUrl
}

function onError() {
  // thumbnail failed — try full-res directly
  src.value = gsToHttps(props.gsUrl)
}

// Start thumbnail, then preload full-res in background
watch(
  () => props.gsUrl,
  (newUrl) => {
    src.value = thumbnailUrl(newUrl)
    loadFullRes(newUrl)
  },
  { immediate: true }
)
</script>

<template>
  <v-img v-bind="$attrs" :src="src" @error="onError">
    <template v-if="$slots.placeholder" #placeholder>
      <slot name="placeholder" />
    </template>
    <slot />
  </v-img>
</template>
