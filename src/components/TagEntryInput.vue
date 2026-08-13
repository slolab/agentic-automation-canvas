<template>
  <div>
    <div
      :class="[
        'flex flex-wrap items-center bg-white transition focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100',
        disabled && 'cursor-not-allowed bg-gray-100 opacity-60 focus-within:border-gray-300 focus-within:ring-0',
        compact
          ? 'min-h-8 gap-1 border-0 border-b border-gray-300 px-1 py-0.5'
          : 'min-h-[2.625rem] gap-2 rounded-md border border-gray-300 px-2 py-1.5 shadow-sm hover:border-gray-400',
      ]"
      @click="!disabled && inputElement?.focus()"
    >
      <span
        v-for="(value, index) in modelValue"
        :key="`${value}-${index}`"
        :class="[
          'inline-flex max-w-full items-center gap-1 rounded bg-primary-100 font-medium text-primary-900',
          disabled && 'bg-gray-200 text-gray-500',
          compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm',
        ]"
      >
        <span class="truncate">{{ value }}</span>
        <button
          type="button"
          :disabled="disabled"
          class="rounded p-0.5 text-primary-700 hover:bg-primary-200 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
          :aria-label="`Remove ${value}`"
          @click.stop="removeValue(index)"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M4.29 4.29a1 1 0 0 1 1.42 0L10 8.59l4.29-4.3a1 1 0 1 1 1.42 1.42L11.41 10l4.3 4.29a1 1 0 0 1-1.42 1.42L10 11.41l-4.29 4.3a1 1 0 0 1-1.42-1.42L8.59 10l-4.3-4.29a1 1 0 0 1 0-1.42Z" />
          </svg>
        </button>
      </span>

      <input
        :id="id"
        ref="inputElement"
        v-model="draft"
        type="text"
        :disabled="disabled"
        :class="[
          'flex-1 border-0 bg-transparent px-1 text-gray-900 placeholder-gray-400 outline-none',
          compact ? 'min-w-[8rem] py-0.5 text-xs' : 'min-w-[12rem] py-1 text-sm',
        ]"
        :placeholder="modelValue.length === 0 ? placeholder : 'Add another…'"
        :aria-describedby="describedBy"
        @keydown.enter.prevent="addDraft"
        @keydown.backspace="removeLastWhenEmpty"
        @blur="addDraft"
      />

      <button
        v-if="draft.trim() && !disabled"
        type="button"
        class="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        @click.stop="addDraft"
      >
        Add
      </button>
    </div>
    <p class="sr-only" aria-live="polite">{{ modelValue.length }} {{ itemLabel }} added</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  id: string
  modelValue: string[]
  placeholder: string
  itemLabel?: string
  describedBy?: string
  compact?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemLabel: 'items',
  describedBy: undefined,
  compact: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [values: string[]]
}>()

const draft = ref('')
const inputElement = ref<HTMLInputElement | null>(null)

function addDraft() {
  const value = draft.value.trim()
  if (!value) return
  const duplicate = props.modelValue.some(
    (candidate) => candidate.toLocaleLowerCase() === value.toLocaleLowerCase(),
  )
  if (!duplicate) emit('update:modelValue', [...props.modelValue, value])
  draft.value = ''
}

function removeValue(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, itemIndex) => itemIndex !== index))
}

function removeLastWhenEmpty(event: KeyboardEvent) {
  if (draft.value || props.modelValue.length === 0) return
  event.preventDefault()
  emit('update:modelValue', props.modelValue.slice(0, -1))
}
</script>
