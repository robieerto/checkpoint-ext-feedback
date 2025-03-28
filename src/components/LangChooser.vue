<script setup lang="ts">
import { reactive } from 'vue'
import store from '@/store'

const state = reactive({
  buttonLang: ''
})

const changeButtonLang = () => {
  if (store.languages.length <= 1) {
    return
  } else if (store.languages.length <= 2) {
    state.buttonLang = store.languages.find((lang) => lang !== store.chosenLang)!
  } else {
    state.buttonLang = 'XX'
  }
}

const changeLang = () => {
  store.chosenLang = state.buttonLang
  localStorage.setItem('userLanguage', store.chosenLang)
  changeButtonLang()
}

changeButtonLang()
</script>

<template>
  <div class="fab-container">
    <p id="active-language" style="display: none; visibility: hidden">{{ store.chosenLang }}</p>
    <div class="fab">
      <div class="fab-content">
        <v-btn v-if="state.buttonLang !== ''" @click="changeLang" class="checkpoint-lang-button">{{
          state.buttonLang
        }}</v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fab-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  user-select: none;
  position: absolute;
  bottom: 30px;
  z-index: 1000;
}
.fab-container .fab .fab-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  border-radius: 50%;
}
</style>
