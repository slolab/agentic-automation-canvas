<template>
  <div class="space-y-2">
    <div
      v-for="(item, index) in items"
      :key="getItemKey(item, index)"
      class="flex gap-2 items-start"
    >
      <div class="flex-1">
        <slot
          name="input"
          :item="item"
          :index="index"
          :update="(value: T) => updateItem(index, value)"
        />
      </div>
      <button
        type="button"
        @click="removeItem(index)"
        class="mt-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        :aria-label="`Remove ${label} ${index + 1}`"
      >
        Remove
      </button>
    </div>
    
    <button
      type="button"
      @click="addItem"
      class="btn-secondary text-sm"
    >
      Add {{ label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue'

interface Props {
  modelValue: T[]
  label: string
  createDefault: () => T
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: T[]]
}>()

// Use computed with getter/setter for proper v-model handling
const items = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getItemKey = (item: T, index: number): string => {
  // Try to use id if available, otherwise use index
  if (typeof item === 'object' && item !== null && 'id' in item) {
    return String((item as any).id) || `item-${index}`
  }
  return `item-${index}`
}

const addItem = () => {
  const newItem = props.createDefault()
  items.value = [...items.value, newItem]
}

const removeItem = (index: number) => {
  items.value = items.value.filter((_, i) => i !== index)
}

const updateItem = (index: number, value: T) => {
  // Create a completely new array with the updated item to ensure Vue reactivity
  items.value = items.value.map((item, i) => i === index ? value : item)
}
</script>
