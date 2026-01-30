<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span>Project Definition and Context</span>
        <InfoTooltip
          content="<strong>What goes here:</strong> Core project information including title, description, objectives, timeline, and value proposition. Start here - this section defines what you're building and why.<br/><br/><strong>Workflow tip:</strong> Fill out Project Title and Description first, then add tasks in 'Tasks &amp; Expectations' section. The value summary can be filled after you've defined tasks. Use version management to track changes over time."
          position="top"
        />
      </h2>
      <p class="section-description">
        What do you want to build? Define the core project information using <a href="https://schema.org/Project" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="Schema.org Project type specification">Schema.org Project</a> and <a href="https://schema.org/ResearchProject" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="Schema.org ResearchProject type specification">ResearchProject</a> types.
      </p>
    </div>

    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!isExpanded"
        @click="isExpanded = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-4">
            <!-- Project Info -->
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-900 truncate">
                  {{ localData.title || 'Untitled Project' }}
                </span>
                <span
                  v-if="localData.projectStage"
                  class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                >
                  {{ localData.projectStage }}
                </span>
                <span
                  v-if="localData.version"
                  class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 font-mono"
                >
                  v{{ localData.version }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span v-if="localData.startDate || localData.endDate" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span v-if="localData.startDate">{{ formatDate(localData.startDate) }}</span>
                  <span v-if="localData.startDate && localData.endDate"> - </span>
                  <span v-if="localData.endDate">{{ formatDate(localData.endDate) }}</span>
                </span>
                <span v-if="aggregatedValueDisplay" class="flex items-center gap-1 text-green-700 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="valueDriverIconPath" />
                  </svg>
                  {{ aggregatedValueDisplay }}
                </span>
              </div>
              <div v-if="localDomains.length > 0 || localKeywords.length > 0" class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span v-if="localDomains.length > 0">
                  <span class="font-medium">Domains:</span> {{ localDomains.map(d => d.value).join(', ') }}
                </span>
                <span v-if="localKeywords.length > 0">
                  <span class="font-medium">Keywords:</span> {{ localKeywords.map(k => k.value).join(', ') }}
                </span>
              </div>
            </div>

            <!-- Tasks Summary -->
            <div class="pt-4 border-t-2 border-gray-200">
              <div v-if="tasks.length === 0" class="text-xs text-gray-400 italic py-2">
                No tasks defined yet
              </div>
              <template v-else>
                <div class="flex items-center gap-2 mb-3">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Tasks ({{ tasks.length }})</span>
                </div>
                <div class="space-y-2.5">
                  <div
                    v-for="(task, taskIndex) in tasks"
                    :key="task.id"
                    class="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2 border border-gray-200"
                  >
                    <div class="flex items-center gap-2 mb-1.5">
                      <span class="font-medium text-gray-900 truncate flex-1 text-sm">
                        {{ task.description || `Task ${taskIndex + 1}` }}
                      </span>
                      <span
                        v-if="task.priority"
                        :class="{
                          'bg-gray-100 text-gray-700': task.priority === 'low',
                          'bg-blue-100 text-blue-700': task.priority === 'medium',
                          'bg-orange-100 text-orange-700': task.priority === 'high',
                          'bg-red-100 text-red-700': task.priority === 'critical',
                        }"
                        class="px-1.5 py-0.5 rounded text-xs font-medium"
                      >
                        {{ task.priority.charAt(0).toUpperCase() + task.priority.slice(1) }}
                      </span>
                      <span
                        v-if="task.status"
                        :class="{
                          'bg-gray-100 text-gray-700': task.status === 'planned',
                          'bg-blue-100 text-blue-700': task.status === 'in-progress',
                          'bg-green-100 text-green-700': task.status === 'completed',
                          'bg-red-100 text-red-700': task.status === 'cancelled',
                        }"
                        class="px-1.5 py-0.5 rounded text-xs font-medium"
                      >
                        {{ task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                      <span v-if="task.unitOfWork" class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {{ task.unitOfWork }}
                      </span>
                      <span v-if="getTaskTimeSaved(task)" class="flex items-center gap-1 text-green-700 font-medium">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ getTaskTimeSaved(task) }}
                      </span>
                      <span v-if="getTaskBenefitTypes(task).length > 0" class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ getTaskBenefitTypes(task).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <!-- Expanded View -->
      <div v-else class="p-4 space-y-3">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900">Project Details</h3>
          <button
            @click="isExpanded = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse project details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <FormField
          id="project-title"
          label="Project Title"
          help-text="The name or title of your agentic automation project"
          tooltip="The project title is used in RO-Crate metadata and should be clear and descriptive. It will appear in generated packages and help others understand what your automation project does. Example: 'Automated Document Classification System'."
          :error="errors.title"
          required
        >
          <input
            id="project-title"
            v-model="localData.title"
            type="text"
            class="form-input"
            required
            @blur="update"
          />
        </FormField>

        <FormField
          id="project-description"
          label="Description"
          help-text="A detailed description of the project and its objectives"
          tooltip="Provide a comprehensive description (2-4 paragraphs) covering: what the automation does, why it's needed, who will benefit, and how it works. This is the main narrative about your project and will be used in documentation and RO-Crate metadata."
          :error="errors.description"
          required
        >
          <textarea
            id="project-description"
            v-model="localData.description"
            rows="4"
            class="form-input"
            required
            @blur="update"
          />
        </FormField>

        <FormField
          id="project-objective"
          label="Objective"
          help-text="The main objective or goal of the project. Maps to <a href='https://schema.org/abstract' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Schema.org abstract property'>schema:abstract</a> (summary of the project)."
          tooltip="A concise summary (1-2 sentences) of the project's main goal. This differs from Description: Objective is a brief abstract/summary, while Description provides full details. Example: 'Automate document routing to reduce manual processing time by 60% while improving accuracy.'"
        >
          <textarea
            id="project-objective"
            v-model="localData.objective"
            rows="3"
            class="form-input"
            @blur="update"
          />
        </FormField>

        <FormField
          id="project-stage"
          label="Project Stage"
          help-text="Current stage of the project lifecycle. Stages align with <a href='https://www.w3.org/TR/prov-o/#Activity' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='PROV-O Activity type'>PROV-O Activities</a> and represent major phases: Design, Development, Validation, Deployment, Monitoring."
          tooltip="Select the current phase of your project: <strong>Design</strong> - Planning and requirements gathering; <strong>Development</strong> - Building the system; <strong>Validation</strong> - Testing and evaluation; <strong>Deployment</strong> - Rolling out to users; <strong>Monitoring</strong> - Ongoing operation and improvement. This helps track project progress and aligns with governance stages."
          required
        >
          <select
            id="project-stage"
            v-model="localData.projectStage"
            class="form-input"
            @change="update"
          >
            <option value="">Select stage</option>
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Validation">Validation</option>
            <option value="Deployment">Deployment</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </FormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="project-start-date"
            label="Start Date"
            help-text="Project start date"
            tooltip="The date when the project officially began. This helps establish a timeline and is used to calculate project duration. It also helps align with governance stage dates."
          >
            <input
              id="project-start-date"
              v-model="localData.startDate"
              type="date"
              class="form-input"
              @blur="update"
            />
          </FormField>

          <FormField
            id="project-end-date"
            label="End Date"
            help-text="Project end date"
            tooltip="The expected or actual completion date for the project. Leave blank if the project is ongoing. This helps track project timelines and is used in project documentation."
          >
            <input
              id="project-end-date"
              v-model="localData.endDate"
              type="date"
              class="form-input"
              :min="localData.startDate"
              @blur="update"
            />
          </FormField>
        </div>

        <FormField
          id="project-domains"
          label="Domains"
          help-text="Research domain(s) or field(s) of application. Add one domain per entry."
          tooltip="Specify the research domain(s) or field(s) where your automation applies. Examples: Biomedical, Computer Science, Finance, Healthcare. These improve discoverability of your project in repositories and help others find relevant automation solutions. Add multiple domains if your project spans multiple fields."
        >
          <MultiValueInput
            v-model="localDomains"
            label="domain"
            :create-default="() => ({ value: '' })"
          >
            <template #input="{ item, index, update }">
              <input
                :id="`domain-${index}`"
                :value="item.value"
                type="text"
                class="form-input"
                placeholder="e.g., Biomedical"
                @input="update({ ...item, value: ($event.target as HTMLInputElement).value })"
              />
            </template>
          </MultiValueInput>
        </FormField>

        <FormField
          id="project-keywords"
          label="Keywords"
          help-text="Keywords or tags for the project. Add one keyword per entry."
          tooltip="Add relevant keywords or tags that describe your project. Examples: AI, automation, NLP, document processing, workflow. Keywords improve searchability and help categorize your project. Use specific terms that others might search for."
        >
          <MultiValueInput
            v-model="localKeywords"
            label="keyword"
            :create-default="() => ({ value: '' })"
          >
            <template #input="{ item, index, update }">
              <input
                :id="`keyword-${index}`"
                :value="item.value"
                type="text"
                class="form-input"
                placeholder="e.g., AI"
                @input="update({ ...item, value: ($event.target as HTMLInputElement).value })"
              />
            </template>
          </MultiValueInput>
        </FormField>

        <FormField
          id="project-id"
          label="Project ID (URI/DOI)"
          help-text="Persistent identifier for the project (URI or DOI)"
          tooltip="A persistent identifier (PID) that uniquely identifies your project. Use a DOI if your project is published (e.g., https://doi.org/10.1234/example) or a URI if it's an internal project (e.g., https://example.org/projects/automation-2024). This enables stable references and linking across systems."
        >
          <input
            id="project-id"
            v-model="localData.projectId"
            type="url"
            class="form-input"
            placeholder="https://doi.org/10.1234/example"
            @blur="update"
          />
        </FormField>

        <div class="pt-6 border-t-2 border-gray-200 mt-8">
          <h3 class="subsection-header">Version Management</h3>
          <p class="text-sm text-gray-600 mb-4">
            Keep your ROcrate in sync with your implementation using semantic versioning. When you upload a previous version, make changes, and export again, it's recommended to increment the version to reflect the changes. See <a href="https://semver.org/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium">semantic versioning standards</a> for guidance.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="project-version"
              label="Version"
              help-text="Semantic version (e.g., 0.1.0). Format: MAJOR.MINOR.PATCH. See <a href='https://semver.org/' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline font-medium'>semantic versioning standards</a> for details."
              tooltip="Use semantic versioning (MAJOR.MINOR.PATCH) to track changes: <strong>MAJOR</strong> - Breaking changes (1.0.0); <strong>MINOR</strong> - New features, backward compatible (0.2.0); <strong>PATCH</strong> - Bug fixes (0.1.1). Increment the version when you modify an imported RO-Crate. Keep it synchronized with your implementation version - when you release v1.0.0 of your system, update the canvas to v1.0.0."
              :error="versionError"
            >
              <input
                id="project-version"
                v-model="localData.version"
                type="text"
                class="form-input"
                placeholder="0.1.0"
                pattern="^\d+\.\d+\.\d+(-[\w\-]+)?(\+[\w\-]+)?$"
                @blur="update"
              />
            </FormField>

            <FormField
              id="project-version-date"
              label="Version Date"
              help-text="Date when this version was downloaded or created. Automatically set to today's date when importing a ROcrate."
              tooltip="The date when this version was created or downloaded. This is automatically set when you import a RO-Crate. Use this to track when versions were released and to manage version history."
            >
              <input
                id="project-version-date"
                v-model="localData.versionDate"
                type="date"
                class="form-input"
                @blur="update"
              />
            </FormField>
          </div>
        </div>

        <div class="pt-6 border-t-2 border-gray-200 mt-8">
          <h3 class="subsection-header">Project Value Summary</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="project-headline-value"
              label="Headline Value"
              help-text="Short text summary of the project's value proposition"
              tooltip="A brief, human-readable summary of your project's value (1-2 sentences). This is different from detailed benefit metrics - it's a quick statement that captures the essence. Do NOT include numbers or units here - those go in Benefit Value and Benefit Unit fields and are combined automatically. Example: 'Saves time through automated document processing' or 'Reduces errors while improving compliance'."
            >
              <input
                id="project-headline-value"
                v-model="localData.headlineValue"
                type="text"
                class="form-input"
                placeholder="e.g., Saves time through automated data processing"
                @blur="update"
              />
            </FormField>

            <FormField
              id="project-primary-value-driver"
              label="Primary Value Driver"
              help-text="The main type of value this project delivers"
              tooltip="Select the primary type of value your project delivers: <strong>Time</strong> - Saves time through automation; <strong>Quality</strong> - Improves accuracy, consistency, or outcomes; <strong>Risk</strong> - Reduces errors, compliance issues, or operational risks; <strong>Enablement</strong> - Enables new capabilities or workflows that weren't possible before. This determines how Benefit Value and Unit fields are interpreted."
            >
              <select
                id="project-primary-value-driver"
                v-model="localData.primaryValueDriver"
                class="form-input"
                @change="update"
              >
                <option value="">Select value driver</option>
                <option value="time">Time</option>
                <option value="quality">Quality</option>
                <option value="risk">Risk</option>
                <option value="enablement">Enablement</option>
              </select>
            </FormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              id="project-aggregate-benefit-value"
              label="Benefit Value"
              :help-text="benefitValueHelpText"
              :tooltip="benefitValueTooltip"
            >
              <input
                id="project-aggregate-benefit-value"
                v-model.number="localData.aggregateBenefitValue"
                type="number"
                min="0"
                step="0.1"
                class="form-input"
                :placeholder="benefitValuePlaceholder"
                @blur="update"
              />
            </FormField>

            <FormField
              id="project-aggregate-benefit-unit"
              label="Benefit Unit"
              :help-text="benefitUnitHelpText"
              :tooltip="benefitUnitTooltip"
            >
              <input
                id="project-aggregate-benefit-unit"
                v-model="localData.aggregateBenefitUnit"
                type="text"
                class="form-input"
                :placeholder="benefitUnitPlaceholder"
                @blur="update"
              />
            </FormField>
          </div>

          <!-- Aggregate Benefits Section -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h4 class="text-sm font-semibold text-gray-900">Structured Aggregate Benefits</h4>
                <p class="text-xs text-gray-500 mt-0.5">Optional structured aggregates for analytics and reporting</p>
              </div>
              <button
                type="button"
                @click="addAggregateBenefit"
                class="btn-secondary text-xs"
              >
                Add Aggregate
              </button>
            </div>
            
            <div v-if="!localAggregateBenefits.length" class="text-xs text-gray-400 italic py-2">
              No structured aggregates. The scalar Benefit Value/Unit above serves as the primary headline metric.
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="(agg, index) in localAggregateBenefits"
                :key="index"
                class="border border-gray-200 rounded-md p-3 bg-gray-50"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs font-medium text-gray-700">Aggregate {{ index + 1 }}</span>
                  <button
                    type="button"
                    @click="removeAggregateBenefit(index)"
                    class="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label class="form-label text-xs">Benefit Type</label>
                    <select
                      v-model="agg.benefitType"
                      class="form-input text-xs py-1"
                      @change="updateAggregateBenefits"
                    >
                      <option value="time">Time</option>
                      <option value="quality">Quality</option>
                      <option value="risk">Risk</option>
                      <option value="enablement">Enablement</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="form-label text-xs">Metric ID</label>
                    <input
                      v-model="agg.metricId"
                      type="text"
                      class="form-input text-xs py-1"
                      placeholder="e.g., timeSavedTotal"
                      @blur="updateAggregateBenefits"
                    />
                  </div>
                  
                  <div>
                    <label class="form-label text-xs">Aggregation Basis</label>
                    <select
                      v-model="agg.aggregationBasis"
                      class="form-input text-xs py-1"
                      @change="updateAggregateBenefits"
                    >
                      <option value="perUnit">Per Unit</option>
                      <option value="perMonth">Per Month</option>
                      <option value="oneOff">One-off</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="form-label text-xs">Unit</label>
                    <input
                      v-model="agg.unit"
                      type="text"
                      class="form-input text-xs py-1"
                      placeholder="e.g., hours/month"
                      @blur="updateAggregateBenefits"
                    />
                  </div>
                  
                  <div>
                    <label class="form-label text-xs">Value</label>
                    <input
                      v-model="agg.value"
                      type="text"
                      class="form-input text-xs py-1"
                      placeholder="e.g., 40"
                      @blur="updateAggregateBenefits"
                    />
                  </div>
                  
                  <div>
                    <label class="form-label text-xs">Method</label>
                    <select
                      v-model="agg.method"
                      class="form-input text-xs py-1"
                      @change="updateAggregateBenefits"
                    >
                      <option value="computed">Computed</option>
                      <option value="manualOverride">Manual Override</option>
                    </select>
                  </div>
                </div>
                
                <div v-if="agg.method === 'manualOverride'" class="mt-2">
                  <label class="form-label text-xs">Rationale (required for manual override)</label>
                  <textarea
                    v-model="agg.rationale"
                    rows="2"
                    class="form-input text-xs py-1"
                    placeholder="Explain why this value was manually set"
                    @blur="updateAggregateBenefits"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import InfoTooltip from '../InfoTooltip.vue'
import type { ProjectDefinition, Requirement, AggregateBenefit } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateProject, validateProject: validateProjectFn } = useCanvasData()

// Initialize localData with proper array references
const initLocalData = (): ProjectDefinition => {
  const project = canvasData.value.project
  return {
    title: project.title || '',
    description: project.description || '',
    objective: project.objective,
    projectStage: project.projectStage,
    startDate: project.startDate,
    endDate: project.endDate,
    projectId: project.projectId,
    headlineValue: project.headlineValue,
    aggregateBenefitValue: project.aggregateBenefitValue,
    aggregateBenefitUnit: project.aggregateBenefitUnit,
    primaryValueDriver: project.primaryValueDriver,
    version: project.version || canvasData.value.version || '0.1.0',
    versionDate: project.versionDate || canvasData.value.versionDate || new Date().toISOString().split('T')[0],
  }
}

const localData = ref<ProjectDefinition>(initLocalData())

// Get version error from validation if imported
const versionError = computed(() => {
  const validation = validateProjectFn()
  const versionErr = validation.find(e => e.field === 'project.version')
  return versionErr ? versionErr.message : undefined
})

// Convert domain/keywords arrays to objects for MultiValueInput
const initDomains = () => {
  const domains = canvasData.value.project.domain || []
  return domains.map((d: string) => ({ value: d }))
}

const initKeywords = () => {
  const keywords = canvasData.value.project.keywords || []
  return keywords.map((k: string) => ({ value: k }))
}

const localDomains = ref<Array<{ value: string }>>(initDomains())
const localKeywords = ref<Array<{ value: string }>>(initKeywords())

// Initialize aggregate benefits
const initAggregateBenefits = (): AggregateBenefit[] => {
  return canvasData.value.project.aggregateBenefits || []
}
const localAggregateBenefits = ref<AggregateBenefit[]>(initAggregateBenefits())

// State flags for update coordination (declared early for use in functions)
let isLocalUpdate = false
let isSyncingFromCanvas = false

// Aggregate benefits management
function addAggregateBenefit() {
  localAggregateBenefits.value.push({
    benefitType: 'time',
    metricId: '',
    aggregationBasis: 'perMonth',
    unit: '',
    value: 0,
    method: 'computed',
  })
  updateAggregateBenefits()
}

function removeAggregateBenefit(index: number) {
  localAggregateBenefits.value.splice(index, 1)
  updateAggregateBenefits()
}

async function updateAggregateBenefits() {
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  // Convert values to appropriate types
  const benefits = localAggregateBenefits.value.map(agg => ({
    ...agg,
    value: isNaN(Number(agg.value)) ? agg.value : Number(agg.value)
  }))
  updateProject({
    aggregateBenefits: benefits.length > 0 ? benefits : undefined,
  })
  await nextTick()
  isLocalUpdate = false
}

// Get tasks for display in collapsed view
const tasks = computed(() => canvasData.value.userExpectations?.requirements || [])

// Collapsible state - start collapsed to show the nice overview, expand if project is completely empty
const isExpanded = ref(false) // Always start collapsed to show the overview

// Format date for display
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Format task time saved for display
function getTaskTimeSaved(task: Requirement): string | null {
  // Find time benefit from benefits array
  const timeBenefit = (task.benefits || []).find(b => b.benefitType === 'time')
  if (!timeBenefit) return null
  
  const expected = timeBenefit.expected
  const likely = expected.type === 'threePoint' ? expected.likely : 
                 expected.type === 'numeric' ? expected.value : 0
  const volume = task.volumePerMonth
  
  if (likely && volume) {
    const totalMinutes = likely * volume
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = Math.round(totalMinutes % 60)
      return mins > 0 ? `${hours}h ${mins}m/month` : `${hours}h/month`
    }
    return `${Math.round(totalMinutes)}m/month`
  }
  return null
}

// Get benefit types for a task
function getTaskBenefitTypes(task: Requirement): string[] {
  const types = new Set((task.benefits || []).map(b => b.benefitType))
  return Array.from(types)
}


// Dynamic benefit field configuration based on primary value driver
const benefitValueHelpText = computed(() => {
  switch (localData.value.primaryValueDriver) {
    case 'time':
      return 'Numeric value for time benefit (e.g., 40)'
    case 'quality':
      return 'Numeric value for quality improvement (e.g., 25 for 25%)'
    case 'risk':
      return 'Numeric value for risk reduction (e.g., 10)'
    case 'enablement':
      return 'Numeric value for enablement (e.g., 5)'
    default:
      return 'Enter the numeric value for the benefit metric'
  }
})

const benefitValuePlaceholder = computed(() => {
  switch (localData.value.primaryValueDriver) {
    case 'time':
      return 'e.g., 40'
    case 'quality':
      return 'e.g., 25'
    case 'risk':
      return 'e.g., 10'
    case 'enablement':
      return 'e.g., 5'
    default:
      return 'Enter value'
  }
})

const benefitUnitHelpText = computed(() => {
  switch (localData.value.primaryValueDriver) {
    case 'time':
      return 'Unit or description for time benefit (e.g., hours/month, days/week, minutes per task)'
    case 'quality':
      return 'Unit or description for quality improvement (e.g., % error reduction, % accuracy improvement)'
    case 'risk':
      return 'Unit or description for risk reduction (e.g., incidents prevented/month, % compliance improvement)'
    case 'enablement':
      return 'Unit or description for enablement (e.g., new capabilities enabled, users empowered)'
    default:
      return 'Enter the unit or description for the benefit metric'
  }
})

const benefitUnitPlaceholder = computed(() => {
  switch (localData.value.primaryValueDriver) {
    case 'time':
      return 'e.g., hours/month'
    case 'quality':
      return 'e.g., % error reduction'
    case 'risk':
      return 'e.g., incidents prevented/month'
    case 'enablement':
      return 'e.g., new capabilities enabled'
    default:
      return 'Enter unit'
  }
})

const benefitValueTooltip = computed(() => {
  switch (localData.value.primaryValueDriver) {
    case 'time':
      return 'Enter the numeric value for time saved. This represents the total time benefit across all tasks. Example: If you save 40 hours per month total, enter 40.'
    case 'quality':
      return 'Enter the numeric value for quality improvement, typically as a percentage. Example: If error rate decreases by 25%, enter 25. This represents overall quality gains.'
    case 'risk':
      return 'Enter the numeric value for risk reduction. This could be incidents prevented, compliance improvements, or other risk metrics. Example: If you prevent 10 incidents per month, enter 10.'
    case 'enablement':
      return 'Enter the numeric value for enablement. This represents new capabilities or users empowered. Example: If you enable 5 new workflow types, enter 5.'
    default:
      return 'Enter the numeric value for the benefit metric. The meaning depends on your selected Primary Value Driver.'
  }
})

const benefitUnitTooltip = computed(() => {
  switch (localData.value.primaryValueDriver) {
    case 'time':
      return 'Specify the unit for time benefit. Examples: hours/month, days/week, minutes per task, hours per day. This helps others understand the scale and frequency of time savings.'
    case 'quality':
      return 'Specify the unit for quality improvement. Examples: % error reduction, % accuracy improvement, defects prevented per 1000 units. This clarifies how quality is measured.'
    case 'risk':
      return 'Specify the unit for risk reduction. Examples: incidents prevented/month, % compliance improvement, security vulnerabilities eliminated. This explains how risk reduction is quantified.'
    case 'enablement':
      return 'Specify the unit for enablement. Examples: new capabilities enabled, users empowered, workflows automated. This describes what new possibilities the project creates.'
    default:
      return 'Enter the unit or description for the benefit metric. This helps others understand how the benefit value should be interpreted.'
  }
})

// Display benefit metric in collapsed view
const displayBenefitMetric = computed(() => {
  const value = localData.value.aggregateBenefitValue
  const unit = localData.value.aggregateBenefitUnit
  
  if (value === undefined || value === null) {
    return ''
  }
  
  if (unit) {
    return `${value} ${unit}`
  }
  return String(value)
})

// Aggregated value display: headline value + benefit metric
const aggregatedValueDisplay = computed(() => {
  const headline = localData.value.headlineValue
  const benefit = displayBenefitMetric.value
  
  if (!headline && !benefit) return ''
  if (!headline) return benefit
  if (!benefit) return headline
  
  return `${headline}: ${benefit}`
})

// Icon path based on primary value driver
const valueDriverIconPath = computed(() => {
  const driver = localData.value.primaryValueDriver
  
  switch (driver) {
    case 'time':
      return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' // Clock icon
    case 'quality':
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' // Checkmark circle
    case 'risk':
      return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' // Shield icon
    case 'enablement':
      return 'M13 10V3L4 14h7v7l9-11h-7z' // Lightning bolt
    default:
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' // Default checkmark circle
  }
})

const errors = computed(() => {
  const errs: Record<string, string> = {}
  if (!localData.value.title?.trim()) {
    errs.title = 'Title is required'
  }
  if (!localData.value.description?.trim()) {
    errs.description = 'Description is required'
  }
  return errs
})

watch(
  () => canvasData.value.project,
  (newProject) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      localData.value = {
        title: newProject.title || '',
        description: newProject.description || '',
        objective: newProject.objective,
        projectStage: newProject.projectStage,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        projectId: newProject.projectId,
        headlineValue: newProject.headlineValue,
        aggregateBenefitValue: newProject.aggregateBenefitValue,
        aggregateBenefitUnit: newProject.aggregateBenefitUnit,
        primaryValueDriver: newProject.primaryValueDriver,
        version: newProject.version || canvasData.value.version || '0.1.0',
        versionDate: newProject.versionDate || canvasData.value.versionDate || new Date().toISOString().split('T')[0],
      }
      // Sync domain and keywords arrays
      localDomains.value = (newProject.domain || []).map((d: string) => ({ value: d }))
      localKeywords.value = (newProject.keywords || []).map((k: string) => ({ value: k }))
      // Sync aggregate benefits
      localAggregateBenefits.value = newProject.aggregateBenefits || []
      // Reset flag after syncing
      nextTick(() => {
        isSyncingFromCanvas = false
      })
    }
  },
  { deep: true, immediate: false }
)

// Watch for local changes to domain and keywords
watch(localDomains, async (newDomains) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateProject({
    domain: newDomains.map((d) => d.value).filter((v) => v.trim()),
    keywords: localKeywords.value.map((k) => k.value).filter((v) => v.trim()),
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

watch(localKeywords, async (newKeywords) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateProject({
    domain: localDomains.value.map((d) => d.value).filter((v) => v.trim()),
    keywords: newKeywords.map((k) => k.value).filter((v) => v.trim()),
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

const update = async () => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  // Update project with version fields
  const updateData: Partial<ProjectDefinition> = { ...localData.value }
  updateProject(updateData)
  
  // Also update root-level version fields for consistency
  if (updateData.version && canvasData.value.version !== updateData.version) {
    canvasData.value.version = updateData.version
  }
  if (updateData.versionDate && canvasData.value.versionDate !== updateData.versionDate) {
    canvasData.value.versionDate = updateData.versionDate
  }
  
  await nextTick()
  isLocalUpdate = false
}
</script>
