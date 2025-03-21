<script setup lang="ts">
import { watch, computed, nextTick } from 'vue'

import store from '@/store'

const isDefaultSelectedView = computed(
  () => store.extFeedbackId && store.selectedView?.id === store.extFeedbackId
)
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
  store.selectedView = store.viewsData?.find((view: any) => view.id === store.extFeedbackId)
}
</script>

<template>
  <div id="main-view">
    <div v-if="showCloseButton" class="panel-container">
      <div class="panel-content">
        <v-btn class="close-button" density="default" @click="closeAction" icon flat>
          <v-icon color="text">mdi-close</v-icon>
        </v-btn>
      </div>
    </div>
    <!-- <div v-else class="mb-6"></div> -->
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

<style scoped>
.panel-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  user-select: none;
  position: relative;
  top: 5px;
  right: 0px;
  z-index: 1000;
}
.panel-container .panel-content {
  display: flex;
  align-items: center;
  justify-content: right;
  height: 100%;
  width: 100%;
  border-radius: 50%;
}
</style>
