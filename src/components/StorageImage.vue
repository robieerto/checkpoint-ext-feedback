<script setup lang="ts">
import { ref, watch } from 'vue'
import { thumbnailUrl, gsToHttps } from '@/helpers/firebase-storage'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  gsUrl: string
}>()

const src = ref(thumbnailUrl(props.gsUrl))
const usedFallback = ref(false)

watch(
  () => props.gsUrl,
  (newUrl) => {
    src.value = thumbnailUrl(newUrl)
    usedFallback.value = false
  }
)

function onError() {
  if (!usedFallback.value) {
    usedFallback.value = true
    src.value = gsToHttps(props.gsUrl)
  }
}
</script>

<template>
  <v-img v-bind="$attrs" :src="src" @error="onError">
    <template v-if="$slots.placeholder" #placeholder>
      <slot name="placeholder" />
    </template>
    <slot />
  </v-img>
</template>
