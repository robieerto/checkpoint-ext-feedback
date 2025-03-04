<script setup lang="ts">
import { watch, computed, nextTick } from 'vue'

import store from '@/store'

const isDefaultSelectedView = computed(() => store.selectedView?.id === 'default')
const showCloseButton = computed(
  () => !store.isOnlySimpleAction && (!isDefaultSelectedView.value || store.selectedActionId)
)

watch(
  () => store.selectedActionId,
  () => {
    store.selectedAction = null
    store.extUserActionId = null
    nextTick(() => {
      if (store.selectedActionId) {
        const selectedAction = (store.selectedAction = store.actionsData?.find(
          (action: any) => action.id === store.selectedActionId
        ))
        if (selectedAction) {
          store.selectedAction = selectedAction
        } else {
          store.selectedView = store.viewsData?.find(
            (view: any) => view.id === store.selectedActionId
          )
          store.selectedActionId = null
        }
      }
    })
  }
)

function closeAction() {
  store.selectedActionId = null
  store.selectedView = store.viewsData?.find((view: any) => view.id === 'default')
}
</script>

<template>
  <div id="main-view">
    <div v-if="showCloseButton" class="d-flex justify-end mt-0 mb-2">
      <v-btn class="close-button" density="default" @click="closeAction" icon flat>
        <v-icon color="text">mdi-close</v-icon>
      </v-btn>
    </div>
    <ActionListView v-if="!store.selectedActionId" />
    <OccurrenceAction v-else-if="store.selectedAction?.type === 'occurrence'" />
    <OrderAction v-else-if="store.selectedAction?.type === 'order'" />
    <QuestionAction v-else-if="store.selectedAction?.type === 'question'" />
    <div v-else-if="store.selectedAction?.type === 'review'">
      <ReviewComplexAction v-if="store.selectedAction?.options?.complex" />
      <ReviewAction v-else />
    </div>
  </div>
</template>
