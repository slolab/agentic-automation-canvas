<template>
  <div class="mb-4">
    <label
      v-if="label"
      :for="id"
      class="form-label"
      :class="{ 'text-red-600': error }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500" aria-label="required">*</span>
    </label>
    
    <slot :id="id" :error="error" :aria-describedby="helpText ? `${id}-help` : undefined" />
    
    <p
      v-if="helpText && !error"
      :id="`${id}-help`"
      class="form-help"
    >
      {{ helpText }}
    </p>
    
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
interface Props {
  id: string
  label?: string
  helpText?: string
  error?: string
  required?: boolean
}

defineProps<Props>()
</script>
