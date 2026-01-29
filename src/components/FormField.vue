<template>
  <div class="mb-6">
    <label
      v-if="label"
      :for="id"
      class="form-label flex items-center gap-2"
      :class="{ 'text-red-600': error }"
    >
      <span>{{ label }}</span>
      <InfoTooltip
        v-if="tooltip"
        :content="tooltip"
        :title="tooltipTitle"
        position="top"
      />
      <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
    </label>
    
    <div class="mt-1">
      <slot :id="id" :error="error" :aria-describedby="helpText || tooltip ? `${id}-help` : undefined" />
    </div>
    
    <p
      v-if="helpText && !error"
      :id="`${id}-help`"
      class="form-help"
      v-html="helpText"
    />
    
    <p
      v-if="error"
      :id="`${id}-error`"
      class="form-error"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import InfoTooltip from './InfoTooltip.vue'

interface Props {
  id: string
  label?: string
  helpText?: string
  tooltip?: string
  tooltipTitle?: string
  error?: string
  required?: boolean
}

defineProps<Props>()
</script>
