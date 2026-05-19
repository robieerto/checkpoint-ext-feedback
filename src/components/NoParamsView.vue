<script setup lang="ts">
import ofrLogo from '@/assets/ofrules-logo.png'
</script>

<template>
  <div class="no-params-view">
    <img :src="ofrLogo" alt="ofrules" class="logo" />
    <a
      href="https://www.ofrules.com"
      target="_blank"
      rel="noopener noreferrer"
      class="site-link"
    >
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
  gap: 20px;
}

.logo {
  max-width: 240px;
  width: 100%;
}

.site-link {
  font-size: 16px;
  color: var(--color-primary) !important;
}
</style>
