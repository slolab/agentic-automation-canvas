<template>
  <span class="canvas-block-icon shrink-0" aria-hidden="true" v-html="iconSvg" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import projectSvg from '@/assets/icons/canvas/project.svg?raw'
import expectationsSvg from '@/assets/icons/canvas/expectations.svg?raw'
import feasibilitySvg from '@/assets/icons/canvas/feasibility.svg?raw'
import governanceSvg from '@/assets/icons/canvas/governance.svg?raw'
import dataSvg from '@/assets/icons/canvas/data.svg?raw'
import outcomesSvg from '@/assets/icons/canvas/outcomes.svg?raw'

const props = defineProps<{ name: 'project' | 'expectations' | 'feasibility' | 'governance' | 'data' | 'outcomes' }>()

const iconMap: Record<string, string> = {
  project: projectSvg,
  expectations: expectationsSvg,
  feasibility: feasibilitySvg,
  governance: governanceSvg,
  data: dataSvg,
  outcomes: outcomesSvg,
}

const iconSvg = computed(() => iconMap[props.name] ?? '')
</script>

<style scoped>
.canvas-block-icon {
  @apply inline-flex items-center justify-center text-gray-700;
}
.canvas-block-icon :deep(svg) {
  display: block;
}
</style>
