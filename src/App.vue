<script setup lang="ts">
import MainCarousel from './components/MainCarousel.vue'
import FooterComp from './components/FooterComp.vue'
import messages from '@/messages'
</script>

<template>
  <MainCarousel :msg="messages.uklidPokoje" />
  <FooterComp />
</template>
