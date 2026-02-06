<template>
  <div class="space-y-2">
    <div
      v-for="(item, index) in items"
      :key="getItemKey(item, index)"
      class="flex gap-2 items-stretch min-h-[60px]"
    >
      <div class="flex-1 min-w-0">
        <slot
          name="input"
          :item="item"
          :index="index"
          :update="(value: T) => updateItem(index, value)"
        />
      </div>
      <div class="flex flex-col gap-1 justify-start shrink-0 items-center">
        <button
          type="button"
          @click="removeItem(index)"
          class="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded shrink-0"
          :aria-label="`Remove ${label} ${index + 1}`"
        >
          Remove
        </button>
        <div class="flex gap-1 justify-center">
          <button
            type="button"
            @click="moveItemUp(index)"
            :disabled="index === 0"
            class="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 rounded border border-gray-300 hover:border-gray-400 disabled:border-gray-200"
            :aria-label="`Move ${label} ${index + 1} up`"
            title="Move up"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            @click="moveItemDown(index)"
            :disabled="index === items.length - 1"
            class="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 rounded border border-gray-300 hover:border-gray-400 disabled:border-gray-200"
            :aria-label="`Move ${label} ${index + 1} down`"
            title="Move down"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
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
  /** Enable drag-and-drop reordering. Uses up/down buttons by default for better reliability. */
  enableDragging?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enableDragging: false
})

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

const moveItemUp = (index: number) => {
  if (index === 0) return
  const newItems = [...items.value]
  const temp = newItems[index]
  newItems[index] = newItems[index - 1]
  newItems[index - 1] = temp
  items.value = newItems
}

const moveItemDown = (index: number) => {
  if (index === items.value.length - 1) return
  const newItems = [...items.value]
  const temp = newItems[index]
  newItems[index] = newItems[index + 1]
  newItems[index + 1] = temp
  items.value = newItems
}
</script>
