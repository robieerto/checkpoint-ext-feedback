<script setup lang="ts">
import { computed, watch, ref } from 'vue'

import store from '@/store'

const texts = computed(() => store.selectedView?.texts?.[store.chosenLang])
const selectedViewListItems = ref([] as any[])

watch(
  () => store.selectedView,
  () => {
    selectedViewListItems.value = store.selectedView?.actions.map((id: any) => ({
      expanded: false,
      ...(store.actionsData.find((action: any) => action.id === id) ??
        store.viewsData.find((action: any) => action.id === id))
    }))
    // console.log(selectedViewListItems.value)
  },
  { immediate: true }
)

const selectItem = (item: any) => {
  if (item?.type) {
    if (item?.type === 'link') {
      window.open(item.url, '_blank')
    } else {
      store.selectedActionId = item.id
    }
  } else if (item?.viewType) {
    store.selectedView = item
  }
}
</script>

<template>
  <div>
    <h1 class="pt-1">{{ texts?.title }}</h1>
    <h4 v-if="store.selectedView?.viewType !== 'expansion'" class="pb-0">
      {{ store.checkpointName }}
    </h4>
    <div v-if="store.selectedView?.viewType === 'tile'">
      <v-list max-height="70vh" class="mt-0 pt-0 pb-15">
        <v-row class="m-0">
          <v-col cols="6" v-for="(item, index) in selectedViewListItems" class="pa-2" :key="index">
            <v-card
              class="px-0 py-2"
              height="160"
              :hover="true"
              :title="item?.texts?.[store.chosenLang]?.listTitle"
              :text="item?.texts?.[store.chosenLang]?.listText"
              @click="selectItem(item)"
            ></v-card>
          </v-col>
        </v-row>
      </v-list>
    </div>
    <div v-else-if="store.selectedView?.viewType === 'expansion'">
      <v-list max-height="75vh" class="mt-0 pt-0 pb-15">
        <div
          v-for="(item, index) in selectedViewListItems"
          :key="index"
          @click="item.expanded = !item.expanded"
        >
          <v-card class="mx-auto mb-4 py-2">
            <v-card-title>{{ item?.texts?.[store.chosenLang]?.listTitle }}</v-card-title>
            <v-expand-transition>
              <!-- <div v-show="item.expanded"> -->
              <v-card-text>
                {{ item?.texts?.[store.chosenLang]?.listText }}
              </v-card-text>
              <!-- </div> -->
            </v-expand-transition>
            <v-card-actions>
              <v-btn
                :icon="item.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                color="#8E8E93"
                density="default"
                @click="() => {}"
              ></v-btn>
              <v-card-title>{{ item?.texts?.[store.chosenLang]?.listBottomText }}</v-card-title>
              <v-spacer></v-spacer>
              <v-btn
                v-show="item?.texts?.[store.chosenLang]?.listCTAButton"
                variant="flat"
                class="checkpoint-button mr-2"
                @click="selectItem(item)"
              >
                {{ item?.texts?.[store.chosenLang]?.listCTAButton }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <div v-if="texts?.buttonCTA" class="text-center px-5">
          <p v-if="texts?.buttonCTA" class="pt-5">
            {{ texts?.ctaText }}
          </p>
          <v-btn
            v-if="texts?.buttonCTA"
            class="checkpoint-button"
            @click="() => (store.selectedActionId = store.selectedView?.upsellId)"
          >
            {{ texts?.buttonCTA }}
          </v-btn>
        </div>
      </v-list>
    </div>
    <div v-else>
      <div v-for="(action, index) in store.selectedView?.actionsData" class="py-4" :key="index">
        <v-btn variant="flat" class="checkpoint-button w-100" @click="selectItem(action.type)">
          {{ action.texts?.[store.chosenLang]?.title }}
        </v-btn>
      </div>
    </div>
  </div>
</template>
