<script setup lang="ts">
import ofrLogo from '@/assets/ofrules-logo.png'
</script>

<template>
  <div class="no-params-view">
    <img :src="ofrLogo" alt="ofrules" class="logo" fetchpriority="high" />
    <a href="https://www.ofrules.com" rel="noopener noreferrer" class="visit-btn">
      Go to our website
    </a>
  </div>
</template>

<style scoped>
.no-params-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  gap: 40px;
}

.logo {
  max-width: 480px;
  width: 100%;
  height: auto;
  aspect-ratio: 680 / 197;
}

.visit-btn {
  display: inline-block;
  background-color: #705d0d;
  color: #ffffff !important;
  border-radius: 100px;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
}
</style>
