<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
    <!-- Collapsed View -->
    <button
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="w-full text-left p-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <label class="text-sm font-medium text-gray-700">{{ label }}</label>
            <span v-if="items.length > 0" class="text-xs text-gray-500">
              ({{ items.length }} {{ items.length === 1 ? 'item' : 'items' }})
            </span>
          </div>
          <div v-if="items.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="(item, index) in items"
              :key="index"
              class="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300"
            >
              {{ item.value }}
            </span>
          </div>
          <div v-else class="text-xs text-gray-400 italic">
            No {{ label.toLowerCase() }} added yet
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Expanded View -->
    <div v-else class="p-4">
      <div class="flex items-center justify-between mb-4">
        <label class="text-sm font-medium text-gray-700">{{ label }}</label>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          :aria-label="`Collapse ${label}`"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      
      <MultiValueInput
        v-model="localItems"
        :label="label.toLowerCase()"
        :create-default="() => ({ value: '' })"
      >
        <template #input="{ item, index, update }">
          <input
            :id="`${label.toLowerCase()}-${index}`"
            :value="item.value"
            type="text"
            class="form-input"
            :placeholder="placeholder"
            @input="update({ ...item, value: ($event.target as HTMLInputElement).value })"
          />
        </template>
      </MultiValueInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MultiValueInput from './MultiValueInput.vue'

interface Props {
  items: Array<{ value: string }>
  label: string
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:items': [items: Array<{ value: string }>]
}>()

const isExpanded = ref(false)
const localItems = ref<Array<{ value: string }>>([...props.items])

// Watch for changes from parent (when data is cleared or imported)
watch(() => props.items, (newItems) => {
  localItems.value = newItems.map(item => ({ ...item }))
}, { deep: true })

// Watch for local changes and emit to parent
watch(localItems, (newItems) => {
  emit('update:items', newItems.map(item => ({ ...item })))
}, { deep: true })
</script>
