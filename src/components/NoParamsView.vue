<script setup lang="ts">
import ofrLogo from '@/assets/ofrules-logo.png'
</script>

<template>
  <div class="no-params-view">
    <img :src="ofrLogo" alt="ofrules" class="logo" />
    <a href="https://www.ofrules.com" target="_blank" rel="noopener noreferrer" class="visit-btn">
      www.ofrules.com
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
  max-width: 320px;
  width: 100%;
}

.visit-btn {
  display: inline-block;
  background-color: #003c69;
  color: #ffffff !important;
  border-radius: 100px;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
}
</style>
