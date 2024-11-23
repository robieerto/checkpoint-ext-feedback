<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import store from '@/store'

const selectedActionData = ref(null as any)

const text = computed(() => store.feedbackData?.texts?.[store.chosenLang])

if (store.extActionId) {
  store.selectedActionId = store.actionData.extActionId
  store.selectedActionType = store.actionData.type
  selectedActionData.value = store.actionData
}

const selectAction = (type: any) => {
  store.selectedActionType = type
}

watch(
  () => store.selectedActionType,
  () => {
    if (store.selectedActionType) {
      const actionData = store.feedbackData?.actionsDataList.find(
        (action: any) => action.type === store.selectedActionType
      )
      store.selectedActionId = actionData?.extActionId
      selectedActionData.value = actionData
    } else {
      store.selectedActionId = null
      selectedActionData.value = null
    }
  }
)
</script>

<template>
  <div v-if="!store.selectedActionType">
    <h1 class="pb-5">{{ text?.title }}</h1>
    <h4 class="pb-1">{{ store.checkpointName }}:</h4>
    <div class="py-4" v-for="(action, index) in store.feedbackData?.actionsDataList" :key="index">
      <v-btn variant="flat" class="checkpoint-button w-100" @click="selectAction(action.type)">
        {{ action.texts?.[store.chosenLang]?.title }}
      </v-btn>
    </div>
  </div>
  <OccurrenceCarousel v-if="store.selectedActionType === 'occurrence'" :data="selectedActionData" />
  <OrderCarousel v-if="store.selectedActionType === 'order'" :data="selectedActionData" />
  <QuestionCarousel v-if="store.selectedActionType === 'question'" :data="selectedActionData" />
  <ReviewCarousel v-if="store.selectedActionType === 'review'" :data="selectedActionData" />
</template>
