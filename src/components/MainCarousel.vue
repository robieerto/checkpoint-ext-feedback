<script setup lang="ts">
import { reactive } from 'vue'
import type { Message } from '@/messages'

defineProps<{
  msg: Message
}>()

const state = reactive({
  activeItem: 0
})

const pushData = () => {
  state.activeItem = 1
}

const goToPage = (urk: string) => {
  window.location.href = urk
}
</script>

<template>
  <main>
    <div class="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <v-carousel
        v-model="state.activeItem"
        :show-arrows="false"
        :hide-delimiter-background="true"
        color="#705D0D"
        height="230px"
      >
        <v-carousel-item :value="0">
          <h1 class="pb-5">{{ msg.title() }}</h1>
          <p class="pb-1">
            {{ msg.text(206) }}
          </p>
          <div class="text-center">
            <v-btn class="checkpoint-button" @click="pushData"> Ano </v-btn>
          </div>
        </v-carousel-item>

        <v-carousel-item :value="1">
          <h1 class="pb-5">{{ msg.successTitle() }}</h1>
          <p>
            {{ msg.successText() }}
          </p>
          <div class="text-center">
            <v-btn class="checkpoint-button" @click="() => goToPage(msg.website())">
              {{ msg.buttonCTA() }}
            </v-btn>
          </div>
        </v-carousel-item>
      </v-carousel>
    </div>
  </main>
</template>

<style lang="scss">
.main {
  padding-top: 50%;
}

.v-btn--icon {
  width: initial !important;
  height: initial !important;
}

.v-btn--active > .v-btn__overlay {
  opacity: 1 !important;
}

.confirm-button {
  background-color: #705d0d !important;
  color: white !important;
  border-radius: 0 !important;
  padding: 10px 20px !important;
  margin-top: 20px !important;
}
</style>
