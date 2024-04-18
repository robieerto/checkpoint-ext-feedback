<script setup lang="ts">
import MainSwiper from './components/MainSwiper.vue'
import messages from '@/messages'
</script>

<template>
  <main>
    <MainSwiper :msg="messages.uklidPokoje" />
  </main>
</template>

<style scoped>
@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}
</style>
