<script setup lang="ts">
import type { Message } from '@/messages'

defineProps<{
  msg: Message
}>()
</script>

<template>
  <div>
    <h1>{{ msg.title() }}</h1>
    <p>
      {{ msg.text(206) }}
    </p>
  </div>
</template>
