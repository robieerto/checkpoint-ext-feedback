<script setup lang="ts">
import { computed, ref } from 'vue'

import store from '@/store'

const props = defineProps<{
  item: any
}>()

const emit = defineEmits<{
  selectItem: [item: any]
}>()

const isExpanded = ref(false)

const texts = computed(() => props.item?.texts?.[store.chosenLang])
const listTextWords = computed(() => {
  return texts?.value?.listText?.split(' ')
})
const listTextWordsLen = computed(() => {
  return listTextWords.value?.length
})
const displayText = computed(() => {
  if (isExpanded.value) {
    return texts?.value?.listText
  } else {
    if (listTextWordsLen.value < 25) {
      return texts?.value?.listText
    } else {
      return listTextWords.value?.slice(0, 25).join(' ') + '...'
    }
  }
})
</script>

<template>
  <v-card class="mx-auto mb-4 py-2" @click="isExpanded = !isExpanded">
    <v-card-title>{{ texts?.listTitle }}</v-card-title>
    <v-card-text v-show="!isExpanded || listTextWordsLen < 25">
      {{ displayText }}
    </v-card-text>
    <v-expand-transition>
      <div v-show="isExpanded && listTextWordsLen >= 25">
        <v-card-text>
          {{ displayText }}
        </v-card-text>
      </div>
    </v-expand-transition>
    <v-card-actions>
      <v-btn
        :icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        color="#8E8E93"
        density="default"
        @click="() => {}"
      ></v-btn>
      <v-card-title>{{ texts?.listBottomText }}</v-card-title>
      <v-spacer></v-spacer>
      <v-btn
        v-show="texts?.listCTAButton"
        variant="flat"
        class="checkpoint-button mr-2"
        @click="emit('selectItem', item)"
      >
        {{ texts?.listCTAButton }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.v-card-text {
  padding-top: 0;
}
</style>
