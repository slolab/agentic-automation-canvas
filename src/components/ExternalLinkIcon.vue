<template>
  <a
    v-if="url && isHttpUrl(url)"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="text-primary-600 hover:text-primary-800 flex-shrink-0"
    :title="title"
    :aria-label="title ? `${title} (opens in new tab)` : 'Open link (opens in new tab)'"
  >
    <svg :class="size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </a>
</template>

<script setup lang="ts">
import { isHttpUrl } from '@/utils/url'

interface Props {
  url: string
  title?: string
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})
</script>
