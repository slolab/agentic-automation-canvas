<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="text-primary-600 hover:text-primary-800 underline"
    :title="tooltip"
  >
    <slot>{{ text }}</slot>
  </a>
</template>

<script setup lang="ts">
interface Props {
  url: string
  text?: string
  tooltip?: string
}

defineProps<Props>()
</script>
