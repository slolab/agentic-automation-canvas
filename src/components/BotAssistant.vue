<template>
  <!-- Floating button to open bot -->
  <button
    v-if="!isOpen"
    @click="isOpen = true"
    class="fixed bottom-6 right-6 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors z-50"
    aria-label="Open assistant"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  </button>

  <!-- Bot panel -->
  <div
    v-if="isOpen"
    class="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-600 text-white rounded-t-lg">
      <h3 class="text-lg font-semibold">Canvas Assistant</h3>
      <div class="flex items-center gap-2">
        <button
          @click="showSettings = !showSettings"
          class="p-1 hover:bg-primary-700 rounded"
          aria-label="Settings"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          @click="isOpen = false"
          class="p-1 hover:bg-primary-700 rounded"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Settings panel -->
    <div v-if="showSettings" class="p-4 border-b border-gray-200 bg-gray-50">
      <h4 class="text-sm font-medium text-gray-900 mb-2">API Configuration</h4>
      <div class="space-y-2 text-sm">
        <div>
          <label class="block text-gray-700 mb-1">Provider</label>
          <select
            v-model="config.provider"
            class="w-full rounded border-gray-300 text-sm"
            @change="updateConfig({ provider: ($event.target as HTMLSelectElement).value as any })"
          >
            <option value="ollama">Ollama (Local)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-700 mb-1">API Endpoint</label>
          <input
            v-model="config.apiEndpoint"
            type="text"
            class="w-full rounded border-gray-300 text-sm"
            placeholder="http://localhost:11434/api/chat"
            @blur="updateConfig({ apiEndpoint: ($event.target as HTMLInputElement).value })"
          />
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Note: API integration is not yet implemented. Currently using contextual help.
        </p>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="messages.length === 0" class="text-center text-gray-500 text-sm py-8">
        <p>Hello! I'm your Canvas Assistant.</p>
        <p class="mt-2">Ask me about form fields, standards, or get help filling out the canvas.</p>
      </div>
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[80%] rounded-lg p-3 text-sm',
            message.role === 'user'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-900'
          ]"
        >
          <p class="whitespace-pre-wrap">{{ message.content }}</p>
          <p class="text-xs mt-1 opacity-70">
            {{ message.timestamp.toLocaleTimeString() }}
          </p>
        </div>
      </div>
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="flex gap-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t border-gray-200">
      <form @submit.prevent="handleSend" class="flex gap-2">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Ask a question..."
          class="flex-1 rounded border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
          :disabled="isLoading"
        />
        <button
          type="submit"
          :disabled="!inputMessage.trim() || isLoading"
          class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
      <button
        v-if="messages.length > 0"
        @click="clearMessages"
        class="mt-2 text-xs text-gray-500 hover:text-gray-700"
      >
        Clear conversation
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBotAssistant } from '@/composables/useBotAssistant'

const { messages, isOpen, isLoading, config, sendMessage, clearMessages, updateConfig } = useBotAssistant()

const inputMessage = ref('')
const showSettings = ref(false)

const handleSend = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const message = inputMessage.value.trim()
  inputMessage.value = ''

  // Determine context from current section (could be enhanced)
  await sendMessage(message)
}
</script>
