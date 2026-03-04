<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
    <!-- Collapsed View -->
    <button
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="w-full text-left p-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset min-h-[60px]"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-sm font-medium text-gray-900 truncate">
              {{ publication.title || 'Untitled Publication' }}
            </span>
            <span
              v-if="publication.date"
              class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {{ formatDate(publication.date) }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span v-if="publication.authors && publication.authors.length > 0" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ publication.authors.length }} author{{ publication.authors.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="publication.doi" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              DOI
            </span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Expanded View -->
    <div v-else class="p-4 space-y-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-900">Publication {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse publication"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`pub-title-${index}`"
        label="Title"
        tooltip="The title of the publication. Publications are represented using Schema.org ScholarlyArticle type and document papers, articles, or other publications related to your project."
        required
      >
        <input
          :id="`pub-title-${index}`"
          :value="publication.title"
          type="text"
          class="form-input"
          required
          @input="update({ ...publication, title: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`pub-doi-${index}`"
        label="DOI"
        help-text="Digital Object Identifier (DOI) as a full URL (e.g., https://doi.org/10.1234/example). Publications use <a href='https://schema.org/ScholarlyArticle' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Schema.org ScholarlyArticle type'>schema:ScholarlyArticle</a> type."
        tooltip="The DOI (Digital Object Identifier) of the publication as a full URL. Format: https://doi.org/10.1234/example. If the publication doesn't have a DOI yet, leave this blank. DOIs provide stable references to publications and enable proper citation tracking."
      >
        <div class="flex items-center gap-2">
          <input
            :id="`pub-doi-${index}`"
            :value="publication.doi || ''"
            type="url"
            class="form-input flex-1"
            placeholder="https://doi.org/10.1234/example"
            @input="update({ ...publication, doi: ($event.target as HTMLInputElement).value })"
          />
          <ExternalLinkIcon :url="publication.doi ?? ''" title="Open DOI" />
        </div>
      </FormField>

      <div>
        <label class="form-label mb-2 flex items-center gap-2">
          <span>Authors</span>
          <span class="text-xs text-gray-500 font-normal ml-2">
            (select persons or add organizations)
          </span>
        </label>
        <div
          v-for="(author, authorIndex) in (publication.authors || [])"
          :key="authorIndex"
          class="mb-2 p-2 bg-gray-50 rounded flex items-center justify-between"
        >
          <span class="text-sm">
            {{ author.type === 'person' ? getPersonName(author.personId) : author.name }}
            <span class="text-xs text-gray-500">({{ author.type }})</span>
          </span>
          <button
            type="button"
            @click="removeAuthor(authorIndex)"
            class="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          @click="showAddAuthor = true"
          class="btn-secondary text-sm"
        >
          Add Author
        </button>
        <div v-if="showAddAuthor" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
          <select
            v-model="newAuthor.type"
            class="form-input text-sm"
          >
            <option value="person">Person</option>
            <option value="organization">Organization</option>
          </select>
          <div v-if="newAuthor.type === 'person'">
            <select
              v-model="newAuthor.personId"
              class="form-input text-sm"
              :class="{ 'border-red-300': !newAuthor.personId }"
            >
              <option value="">Select a person...</option>
              <option
                v-for="person in availablePersons"
                :key="person.id"
                :value="person.id"
              >
                {{ person.name }} {{ person.affiliation ? `(${person.affiliation})` : '' }}
              </option>
            </select>
            <p v-if="!availablePersons.length" class="text-xs text-yellow-600 mt-1">
              No persons available. Please add persons in the "Persons" section first.
            </p>
          </div>
          <input
            v-else
            v-model="newAuthor.name"
            type="text"
            placeholder="Organization or consortium name"
            class="form-input text-sm"
          />
          <div class="flex gap-2">
            <button
              type="button"
              @click="addAuthor"
              class="btn-primary text-sm"
              :disabled="newAuthor.type === 'person' ? !newAuthor.personId : !newAuthor.name?.trim()"
            >
              Add
            </button>
            <button
              type="button"
              @click="showAddAuthor = false; resetNewAuthor()"
              class="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <FormField
        :id="`pub-date-${index}`"
        label="Publication Date"
        tooltip="The date when the publication was published or accepted. This helps track when research results were made available."
      >
        <input
          :id="`pub-date-${index}`"
          :value="publication.date || ''"
          type="date"
          class="form-input"
          @input="update({ ...publication, date: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <!-- Done Button -->
      <div class="pt-4 border-t border-gray-200 mt-4">
        <button
          type="button"
          @click="isExpanded = false"
          class="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
          Done (collapse)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormField from './FormField.vue'
import ExternalLinkIcon from './ExternalLinkIcon.vue'
import type { Publication, PublicationAuthor, Person } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

interface Props {
  publication: Publication
  index: number
  update: (item: Publication) => void
}

const props = defineProps<Props>()
const { canvasData } = useCanvasData()

const isExpanded = ref(!props.publication.title || props.publication.title.trim() === '')

const showAddAuthor = ref(false)
const newAuthor = ref<PublicationAuthor>({ type: 'person' })

const availablePersons = computed<Person[]>(() => {
  return canvasData.value.persons || []
})

function getPersonName(personId?: string): string {
  if (!personId) return 'Unassigned Person'
  const person = availablePersons.value.find(p => p.id === personId)
  return person?.name || 'Unknown Person'
}

function resetNewAuthor() {
  newAuthor.value = { type: 'person' }
}

function addAuthor() {
  if (newAuthor.value.type === 'person') {
    if (!newAuthor.value.personId) return
  } else {
    if (!newAuthor.value.name?.trim()) return
  }
  const updatedAuthors = [...(props.publication.authors || []), { ...newAuthor.value }]
  props.update({ ...props.publication, authors: updatedAuthors })
  resetNewAuthor()
  showAddAuthor.value = false
}

function removeAuthor(authorIndex: number) {
  const updatedAuthors = (props.publication.authors || []).filter((_, idx) => idx !== authorIndex)
  props.update({ ...props.publication, authors: updatedAuthors.length > 0 ? updatedAuthors : undefined })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
