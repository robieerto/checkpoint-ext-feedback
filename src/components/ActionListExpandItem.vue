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
const listTextsExpanded = computed(() =>
  texts.value?.listTexts?.length > 1 ? texts.value?.listTexts?.slice(1) : null
)

const selectItem = () => {
  emit('selectItem', props.item)
}
</script>

<template>
  <v-card class="mx-auto mb-4 py-2" @click="isExpanded = !isExpanded">
    <v-card-title>{{ texts?.listTitle }}</v-card-title>
    <v-card-text v-if="texts?.listText">
      {{ texts?.listText }}
    </v-card-text>
    <v-card-text v-if="texts?.listTexts">
      {{ texts?.listTexts?.[0] }}
    </v-card-text>
    <v-expand-transition>
      <div v-show="isExpanded && listTextsExpanded">
        <v-card-text v-for="(listText, index) in listTextsExpanded" :key="index">
          {{ listText }}
        </v-card-text>
        <v-card-text v-for="(link, index) in texts?.listLinks" :key="index">
          <a :href="link?.url" target="_blank" @click.stop>
            {{ link?.text }}
          </a>
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
        @click="selectItem"
      >
        {{ texts?.listCTAButton }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
