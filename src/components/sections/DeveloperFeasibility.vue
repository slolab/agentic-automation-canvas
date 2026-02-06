<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span class="flex-1 min-w-0">Developer Feasibility</span>
        <span class="flex-shrink-0">
          <InfoTooltip
            content="<strong>What goes here:</strong> Technical feasibility assessment at project and task levels.<br/><br/><strong>Project-level:</strong> Simple, generic defaults that apply to all tasks (TRL, overall risk, effort estimate).<br/><br/><strong>Task-level:</strong> Optional detailed feasibility assessments for individual tasks. Use these when tasks differ significantly from project defaults or require specific technologies (e.g., LLMs, RAG, MCP). Tasks that are deterministic and don't require LLMs can be marked accordingly."
            position="top"
          />
        </span>
      </h2>
      <p class="section-description">
        Assess technical feasibility at project and task levels. Project-level provides simple defaults; task-level allows detailed overrides when needed.
      </p>
    </div>

    <!-- Project-Level Feasibility -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.projectLevel"
        @click="cardExpanded.projectLevel = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Project-Level Feasibility</h3>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span v-if="trlSummary" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ trlSummary }}
              </span>
              <span v-if="localData.technicalRisk" class="flex items-center gap-1">
                <span :class="riskBadgeClass" class="px-2 py-0.5 rounded text-xs font-medium">
                  {{ riskLabel }}
                </span>
              </span>
              <span v-if="localData.effortEstimate" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ localData.effortEstimate }}
              </span>
            </div>
            <div v-if="!trlSummary && !localData.technicalRisk && !localData.effortEstimate" class="text-xs text-gray-400 italic">
              No project-level feasibility information added yet
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <!-- Expanded View -->
      <div v-else class="p-4 space-y-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900">Project-Level Feasibility</h3>
          <button
            @click="cardExpanded.projectLevel = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Project-Level Feasibility"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Simple, generic defaults that apply to all tasks unless overridden at the task level.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="trl-current"
            label="Current TRL"
            help-text="Current <a href='https://en.wikipedia.org/wiki/Technology_readiness_level' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Technology Readiness Level (TRL) scale'>Technology Readiness Level (TRL)</a> (1-9). TRL measures the maturity of a technology, from basic research (1) to proven in operational environment (9)."
            tooltip="Technology Readiness Level (TRL) measures maturity from 1-9: <strong>1-3</strong> - Research (basic principles to proof of concept); <strong>4-6</strong> - Development (lab validation to demonstration); <strong>7-9</strong> - Deployment (prototype to operational). Select your current TRL to track progress. Example: If you have a working prototype, select TRL 7."
          >
            <select
              id="trl-current"
              v-model.number="localData.trlLevel.current"
              class="form-input"
              @change="update"
            >
              <option :value="undefined">Select TRL</option>
              <option v-for="level in trlLevels" :key="level.value" :value="level.value">
                {{ level.label }}
              </option>
            </select>
          </FormField>

          <FormField
            id="trl-target"
            label="Target TRL"
            help-text="Target <a href='https://en.wikipedia.org/wiki/Technology_readiness_level' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Technology Readiness Level (TRL) scale'>Technology Readiness Level (TRL)</a> (1-9). The TRL you aim to achieve by the end of the project."
            tooltip="The TRL you aim to achieve by project completion. This helps set goals and track progress. Typically, projects aim to advance 2-3 levels. Example: If you're at TRL 4 (lab validation) and want to reach TRL 7 (prototype demonstration), select TRL 7."
          >
            <select
              id="trl-target"
              v-model.number="localData.trlLevel.target"
              class="form-input"
              @change="update"
            >
              <option :value="undefined">Select TRL</option>
              <option v-for="level in trlLevels" :key="level.value" :value="level.value">
                {{ level.label }}
              </option>
            </select>
          </FormField>
        </div>

        <FormField
          id="technical-risk"
          label="Overall Technical Risk"
          help-text="Overall technical risk assessment for the project"
          tooltip="Assess overall technical risk: <strong>Low</strong> - Well-understood technology, minimal challenges; <strong>Medium</strong> - Some unknowns or moderate complexity; <strong>High</strong> - Significant technical challenges or unproven approaches; <strong>Critical</strong> - Very high risk, may fail. This helps prioritize risk mitigation."
        >
          <select
            id="technical-risk"
            v-model="localData.technicalRisk"
            class="form-input"
            @change="update"
          >
            <option :value="undefined">Select risk level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </FormField>

        <FormField
          id="effort-estimate"
          label="Overall Effort Estimate"
          help-text="Estimated effort or duration for the project"
          tooltip="Estimate the effort required for implementation. Can be in time (e.g., '6 months') or person-hours (e.g., '500 person-hours'). Be realistic - consider development, testing, and deployment. Example: '3 months development + 1 month testing' or '400 person-hours'."
        >
          <input
            id="effort-estimate"
            v-model="localData.effortEstimate"
            type="text"
            class="form-input"
            placeholder="e.g., 6 months, 500 person-hours"
            @blur="update"
          />
        </FormField>

        <FormField
          id="feasibility-notes"
          label="Project-Level Notes"
          help-text="Additional notes on project-level feasibility"
          tooltip="Add any additional notes about technical feasibility, challenges, dependencies, or considerations at the project level."
        >
          <textarea
            id="feasibility-notes"
            v-model="localData.feasibilityNotes"
            rows="3"
            class="form-input"
            placeholder="e.g., Overall project considerations, dependencies, or challenges"
            @blur="update"
          />
        </FormField>
      </div>
    </div>

    <!-- Task-Level Feasibility -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.taskLevel"
        @click="cardExpanded.taskLevel = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Task-Level Feasibility</h3>
            </div>
            <div class="text-sm text-gray-600">
              <span v-if="tasksWithFeasibility.length > 0">
                {{ tasksWithFeasibility.length }} {{ tasksWithFeasibility.length === 1 ? 'task' : 'tasks' }} with custom feasibility
              </span>
              <span v-else class="text-gray-400 italic">
                No task-level feasibility assessments yet. Click to add assessments for individual tasks.
              </span>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <!-- Expanded View -->
      <div v-else class="p-4 space-y-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900">Task-Level Feasibility</h3>
          <button
            @click="cardExpanded.taskLevel = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Task-Level Feasibility"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Optional detailed feasibility assessments for individual tasks. Use these when tasks differ significantly from project defaults or require specific technologies. Tasks that are deterministic and don't require LLMs can be marked accordingly.
        </p>

        <div class="space-y-6">
          <div
            v-for="requirement in requirements"
            :key="requirement.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="font-medium text-gray-900">{{ requirement.title || requirement.id }}</h4>
                <p v-if="requirement.description" class="text-sm text-gray-600 mt-1">{{ requirement.description }}</p>
              </div>
              <button
                v-if="requirement.feasibility"
                type="button"
                @click="removeTaskFeasibility(requirement.id)"
                class="text-sm text-red-600 hover:text-red-800"
                aria-label="Remove feasibility assessment"
              >
                Remove
              </button>
            </div>

            <div v-if="!requirement.feasibility" class="space-y-3">
              <p class="text-sm text-gray-500 italic">No custom feasibility assessment. Task uses project-level defaults.</p>
              <button
                type="button"
                @click="addTaskFeasibility(requirement.id)"
                class="btn-secondary text-sm"
              >
                Add Feasibility Assessment
              </button>
            </div>

            <div v-else class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  :id="`task-${requirement.id}-risk`"
                  label="Technical Risk"
                  help-text="Risk level for this task (overrides project-level)"
                >
                  <select
                    :id="`task-${requirement.id}-risk`"
                    :value="requirement.feasibility?.technicalRisk || ''"
                    class="form-input"
                    @change="updateTaskFeasibility(requirement.id, { technicalRisk: ($event.target as HTMLSelectElement).value || undefined })"
                  >
                    <option value="">Use project default</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </FormField>

                <FormField
                  :id="`task-${requirement.id}-effort`"
                  label="Effort Estimate"
                  help-text="Estimated effort for this task (overrides project-level)"
                >
                  <input
                    :id="`task-${requirement.id}-effort`"
                    :value="requirement.feasibility?.effortEstimate || ''"
                    type="text"
                    class="form-input"
                    placeholder="e.g., 2 weeks, 40h"
                    @blur="updateTaskFeasibility(requirement.id, { effortEstimate: ($event.target as HTMLInputElement).value || undefined })"
                  />
                </FormField>
              </div>

              <FormField
                :id="`task-${requirement.id}-notes`"
                label="Feasibility Notes"
                help-text="Task-specific feasibility notes"
              >
                <textarea
                  :id="`task-${requirement.id}-notes`"
                  :value="requirement.feasibility?.feasibilityNotes || ''"
                  rows="2"
                  class="form-input"
                  placeholder="e.g., Requires external API integration"
                  @blur="updateTaskFeasibility(requirement.id, { feasibilityNotes: ($event.target as HTMLTextAreaElement).value || undefined })"
                />
              </FormField>

              <!-- Technology Approach -->
              <div class="border-t border-gray-200 pt-4">
                <h5 class="text-sm font-medium text-gray-900 mb-3">Technology Approach</h5>
                <p class="text-xs text-gray-600 mb-3">
                  Specify the technology approach for this task. Select "None" if the task is deterministic and doesn't require LLMs or automation.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    :id="`task-${requirement.id}-model-selection`"
                    label="Model Type"
                    help-text="Type of model to be used (if applicable)"
                  >
                    <select
                      :id="`task-${requirement.id}-model-selection`"
                      :value="requirement.feasibility?.modelSelection || ''"
                      class="form-input"
                      @change="handleModelSelectionChange(requirement.id, ($event.target as HTMLSelectElement).value)"
                    >
                      <option value="">Not specified</option>
                      <option value="none">None (deterministic task)</option>
                      <option value="open-source">Open Source</option>
                      <option value="frontier-model">Frontier Model</option>
                      <option value="fine-tuned">Fine-tuned</option>
                      <option value="custom">Custom</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>

                  <FormField
                    :id="`task-${requirement.id}-model-name`"
                    label="Model Name"
                    help-text="Specific model name or identifier (e.g., 'claude-opus-4-5', 'Qwen2.5-72B-Instruct')"
                    tooltip="Enter the specific model name or version you're using. Include version numbers for tracking. Examples: 'claude-opus-4-5', 'Qwen2.5-72B-Instruct'. You can use services like the <a href='https://huggingface.co/open-llm-leaderboard' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline'>Hugging Face Open LLM Leaderboard</a> to identify and compare suitable models for your task."
                  >
                    <input
                      :id="`task-${requirement.id}-model-name`"
                      :value="requirement.feasibility?.modelName || ''"
                      type="text"
                      class="form-input"
                      :disabled="requirement.feasibility?.modelSelection === 'none' || requirement.feasibility?.technologyApproach?.architecture === 'none'"
                      placeholder="e.g., claude-opus-4-5, Qwen2.5-72B-Instruct"
                      @blur="updateTaskFeasibility(requirement.id, { modelName: ($event.target as HTMLInputElement).value || undefined })"
                    />
                    <p v-if="requirement.feasibility?.modelSelection === 'none' || requirement.feasibility?.technologyApproach?.architecture === 'none'" class="text-xs text-gray-500 mt-1">
                      Not applicable for deterministic tasks
                    </p>
                  </FormField>
                </div>

                <FormField
                  :id="`task-${requirement.id}-tech-approach`"
                  label="Technology Architecture"
                  help-text="Primary technology architecture approach"
                >
                  <select
                    :id="`task-${requirement.id}-tech-approach`"
                    :value="requirement.feasibility?.technologyApproach?.architecture || ''"
                    class="form-input"
                    @change="updateTaskTechApproach(requirement.id, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">Not specified</option>
                    <option value="none">None (deterministic, no LLM required)</option>
                    <option value="simple-prompting">Simple prompting</option>
                    <option value="rag">RAG (Retrieval-augmented generation)</option>
                    <option value="fine-tuning">Fine-tuning</option>
                    <option value="agents">Agents (ReAct, MCP, tools)</option>
                    <option value="other">Other</option>
                  </select>
                </FormField>

                <!-- RAG Details -->
                <div v-if="requirement.feasibility?.technologyApproach?.architecture === 'rag'" class="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                  <h6 class="text-sm font-medium text-gray-900">RAG Details</h6>
                  <FormField :id="`task-${requirement.id}-rag-retrieval`" label="Retrieval method" help-text="Method used to retrieve relevant documents or chunks from the knowledge base">
                    <input
                      :id="`task-${requirement.id}-rag-retrieval`"
                      :value="requirement.feasibility?.technologyApproach?.ragDetails?.retrievalMethod || ''"
                      type="text"
                      class="form-input"
                      placeholder="e.g., vector search, hybrid search, BM25"
                      @blur="updateTaskRagDetails(requirement.id, 'retrievalMethod', ($event.target as HTMLInputElement).value)"
                    />
                  </FormField>
                  <FormField :id="`task-${requirement.id}-rag-embedding`" label="Embedding model" help-text="Model used to generate embeddings for semantic search">
                    <input
                      :id="`task-${requirement.id}-rag-embedding`"
                      :value="requirement.feasibility?.technologyApproach?.ragDetails?.embeddingModel || ''"
                      type="text"
                      class="form-input"
                      placeholder="e.g., text-embedding-3-small, all-MiniLM-L6-v2"
                      @blur="updateTaskRagDetails(requirement.id, 'embeddingModel', ($event.target as HTMLInputElement).value)"
                    />
                  </FormField>
                  <FormField :id="`task-${requirement.id}-rag-chunking`" label="Chunking strategy" help-text="Strategy for splitting documents into chunks for retrieval">
                    <input
                      :id="`task-${requirement.id}-rag-chunking`"
                      :value="requirement.feasibility?.technologyApproach?.ragDetails?.chunkingStrategy || ''"
                      type="text"
                      class="form-input"
                      placeholder="e.g., semantic, fixed-size, sentence-based"
                      @blur="updateTaskRagDetails(requirement.id, 'chunkingStrategy', ($event.target as HTMLInputElement).value)"
                    />
                  </FormField>
                </div>

                <!-- Fine-tuning Details -->
                <div v-if="requirement.feasibility?.technologyApproach?.architecture === 'fine-tuning'" class="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                  <h6 class="text-sm font-medium text-gray-900">Fine-tuning Details</h6>
                  <FormField :id="`task-${requirement.id}-finetune-base-model`" label="Base Model" help-text="The base model that was fine-tuned">
                    <input
                      :id="`task-${requirement.id}-finetune-base-model`"
                      :value="requirement.feasibility?.technologyApproach?.fineTuningDetails?.baseModel || ''"
                      type="text"
                      class="form-input"
                      placeholder="e.g., Llama 3.1 8B, Mistral 7B"
                      @blur="updateTaskFineTuningDetails(requirement.id, 'baseModel', ($event.target as HTMLInputElement).value)"
                    />
                  </FormField>
                  <FormField :id="`task-${requirement.id}-finetune-approach`" label="Tuning Approach" help-text="Method used for fine-tuning the model">
                    <input
                      :id="`task-${requirement.id}-finetune-approach`"
                      :value="requirement.feasibility?.technologyApproach?.fineTuningDetails?.tuningApproach || ''"
                      type="text"
                      class="form-input"
                      placeholder="e.g., LoRA, QLoRA, full fine-tuning"
                      @blur="updateTaskFineTuningDetails(requirement.id, 'tuningApproach', ($event.target as HTMLInputElement).value)"
                    />
                  </FormField>
                  <FormField :id="`task-${requirement.id}-finetune-dataset`" label="Dataset" help-text="Dataset used for fine-tuning the model">
                    <input
                      :id="`task-${requirement.id}-finetune-dataset`"
                      :value="requirement.feasibility?.technologyApproach?.fineTuningDetails?.dataset || ''"
                      type="text"
                      class="form-input"
                      placeholder="e.g., custom domain dataset, instruction dataset"
                      @blur="updateTaskFineTuningDetails(requirement.id, 'dataset', ($event.target as HTMLInputElement).value)"
                    />
                  </FormField>
                </div>

                <!-- Agentic Details -->
                <div v-if="requirement.feasibility?.technologyApproach?.architecture === 'agents'" class="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                  <h6 class="text-sm font-medium text-gray-900">Agentic Details</h6>
                  <FormField :id="`task-${requirement.id}-agent-framework`" label="Framework" help-text="Agentic framework or pattern used for this task">
                    <div class="space-y-2">
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="framework in (requirement.feasibility?.technologyApproach?.agenticDetails?.framework || [])"
                          :key="framework"
                          class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm"
                        >
                          {{ framework }}
                          <button
                            type="button"
                            @click="removeAgenticFramework(requirement.id, framework)"
                            class="text-gray-500 hover:text-red-600"
                            aria-label="Remove framework"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      </div>
                      <input
                        :id="`task-${requirement.id}-agent-framework`"
                        v-model="agenticFrameworkInputs[requirement.id]"
                        type="text"
                        class="form-input"
                        placeholder="e.g., ReAct, MCP, Plan-and-Execute"
                        @keydown.enter.prevent="addAgenticFramework(requirement.id)"
                        @blur="addAgenticFramework(requirement.id)"
                      />
                    </div>
                  </FormField>
                  <FormField :id="`task-${requirement.id}-agent-tools`" label="Tools" help-text="Tools available to the agent (MCP tools, custom tools, APIs)">
                    <div class="space-y-2">
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="tool in (requirement.feasibility?.technologyApproach?.agenticDetails?.tools || [])"
                          :key="tool"
                          class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm"
                        >
                          {{ tool }}
                          <button
                            type="button"
                            @click="removeAgenticTool(requirement.id, tool)"
                            class="text-gray-500 hover:text-red-600"
                            aria-label="Remove tool"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      </div>
                      <input
                        :id="`task-${requirement.id}-agent-tools`"
                        v-model="agenticToolsInputs[requirement.id]"
                        type="text"
                        class="form-input"
                        placeholder="e.g., file_search, browser, database_query"
                        @keydown.enter.prevent="addAgenticTool(requirement.id)"
                        @blur="addAgenticTool(requirement.id)"
                      />
                    </div>
                  </FormField>
                  <FormField :id="`task-${requirement.id}-agent-orchestration`" label="Orchestration" help-text="Orchestration framework or library used to manage agent workflows">
                    <div class="space-y-2">
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="orchestration in (requirement.feasibility?.technologyApproach?.agenticDetails?.orchestration || [])"
                          :key="orchestration"
                          class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm"
                        >
                          {{ orchestration }}
                          <button
                            type="button"
                            @click="removeAgenticOrchestration(requirement.id, orchestration)"
                            class="text-gray-500 hover:text-red-600"
                            aria-label="Remove orchestration"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      </div>
                      <input
                        :id="`task-${requirement.id}-agent-orchestration`"
                        v-model="agenticOrchestrationInputs[requirement.id]"
                        type="text"
                        class="form-input"
                        placeholder="e.g., LangGraph, AutoGPT"
                        @keydown.enter.prevent="addAgenticOrchestration(requirement.id)"
                        @blur="addAgenticOrchestration(requirement.id)"
                      />
                    </div>
                  </FormField>
                </div>

                <!-- Algorithms and Tools -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    :id="`task-${requirement.id}-algorithms`"
                    label="Algorithms / Technologies"
                    help-text="Algorithms, models, or technologies used for this task"
                  >
                    <div class="space-y-2">
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="algorithm in (requirement.feasibility?.algorithms || [])"
                          :key="algorithm"
                          class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm"
                        >
                          {{ algorithm }}
                          <button
                            type="button"
                            @click="removeAlgorithm(requirement.id, algorithm)"
                            class="text-gray-500 hover:text-red-600"
                            aria-label="Remove algorithm"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      </div>
                      <input
                        :id="`task-${requirement.id}-algorithms`"
                        v-model="algorithmsInputs[requirement.id]"
                        type="text"
                        class="form-input"
                        placeholder="e.g., BERT, rule-based, OCR"
                        @keydown.enter.prevent="addAlgorithm(requirement.id)"
                        @blur="addAlgorithm(requirement.id)"
                      />
                    </div>
                  </FormField>

                  <FormField
                    :id="`task-${requirement.id}-tools`"
                    label="Tools / Frameworks"
                    help-text="Development tools, libraries, or frameworks used for this task"
                  >
                    <div class="space-y-2">
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="tool in (requirement.feasibility?.tools || [])"
                          :key="tool"
                          class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm"
                        >
                          {{ tool }}
                          <button
                            type="button"
                            @click="removeTool(requirement.id, tool)"
                            class="text-gray-500 hover:text-red-600"
                            aria-label="Remove tool"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      </div>
                      <input
                        :id="`task-${requirement.id}-tools`"
                        v-model="toolsInputs[requirement.id]"
                        type="text"
                        class="form-input"
                        placeholder="e.g., LangChain, OpenAI API"
                        @keydown.enter.prevent="addTool(requirement.id)"
                        @blur="addTool(requirement.id)"
                      />
                    </div>
                  </FormField>
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
import { ref, watch, computed } from 'vue'
import FormField from '../FormField.vue'
import InfoTooltip from '../InfoTooltip.vue'
import type { DeveloperFeasibility, RequirementFeasibility } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'
import type { Requirement } from '@/types/canvas'

const { canvasData, updateDeveloperFeasibility, updateUserExpectations } = useCanvasData()

function updateRequirement(taskId: string, updatedRequirement: Requirement) {
  const requirements = canvasData.value.userExpectations?.requirements || []
  const index = requirements.findIndex((r) => r.id === taskId)
  if (index === -1) return
  
  const updatedRequirements = [...requirements]
  updatedRequirements[index] = updatedRequirement
  updateUserExpectations({ requirements: updatedRequirements })
}

// Card expansion state
const cardExpanded = ref({
  projectLevel: false,
  taskLevel: false,
})

const requirements = computed(() => canvasData.value.userExpectations?.requirements || [])

const tasksWithFeasibility = computed(() => {
  return requirements.value.filter((r) => r.feasibility && Object.keys(r.feasibility).length > 0)
})

// Input refs for chip-based fields
const agenticFrameworkInputs = ref<Record<string, string>>({})
const agenticToolsInputs = ref<Record<string, string>>({})
const agenticOrchestrationInputs = ref<Record<string, string>>({})
const algorithmsInputs = ref<Record<string, string>>({})
const toolsInputs = ref<Record<string, string>>({})

// Initialize localData for project-level feasibility
const initLocalData = (): DeveloperFeasibility => {
  const feasibility = canvasData.value.developerFeasibility
  return {
    trlLevel: feasibility?.trlLevel || {},
    technicalRisk: feasibility?.technicalRisk,
    effortEstimate: feasibility?.effortEstimate,
    feasibilityNotes: feasibility?.feasibilityNotes,
  }
}

const localData = ref<DeveloperFeasibility>(initLocalData())

// Ensure nested objects always exist
if (!localData.value.trlLevel) {
  localData.value.trlLevel = {}
}

const trlLevels = [
  { value: 1, label: 'TRL 1 - Basic principles observed' },
  { value: 2, label: 'TRL 2 - Technology concept formulated' },
  { value: 3, label: 'TRL 3 - Experimental proof of concept' },
  { value: 4, label: 'TRL 4 - Technology validated in lab' },
  { value: 5, label: 'TRL 5 - Technology validated in relevant environment' },
  { value: 6, label: 'TRL 6 - Technology demonstrated in relevant environment' },
  { value: 7, label: 'TRL 7 - System prototype demonstration in operational environment' },
  { value: 8, label: 'TRL 8 - System complete and qualified' },
  { value: 9, label: 'TRL 9 - Actual system proven in operational environment' },
]

// Computed properties for summary displays
const trlSummary = computed(() => {
  const current = localData.value.trlLevel?.current
  const target = localData.value.trlLevel?.target
  if (current && target) {
    return `TRL ${current} → ${target}`
  } else if (current) {
    return `TRL ${current}`
  } else if (target) {
    return `Target: TRL ${target}`
  }
  return null
})

const riskLabel = computed(() => {
  const risk = localData.value.technicalRisk
  if (!risk) return null
  return risk.charAt(0).toUpperCase() + risk.slice(1)
})

const riskBadgeClass = computed(() => {
  const risk = localData.value.technicalRisk
  switch (risk) {
    case 'low':
      return 'bg-green-100 text-green-700'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700'
    case 'high':
      return 'bg-orange-100 text-orange-700'
    case 'critical':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
})

let isLocalUpdate = false

watch(
  () => canvasData.value.developerFeasibility,
  (newFeasibility) => {
    if (!isLocalUpdate) {
      if (newFeasibility && Object.keys(newFeasibility).length > 0) {
        localData.value = {
          trlLevel: newFeasibility.trlLevel || {},
          technicalRisk: newFeasibility.technicalRisk,
          effortEstimate: newFeasibility.effortEstimate,
          feasibilityNotes: newFeasibility.feasibilityNotes,
        }
        if (!localData.value.trlLevel) {
          localData.value.trlLevel = {}
        }
      } else {
        localData.value = { trlLevel: {} }
      }
    }
  },
  { deep: true, immediate: true }
)

const update = () => {
  isLocalUpdate = true
  updateDeveloperFeasibility(localData.value)
  setTimeout(() => {
    isLocalUpdate = false
  }, 0)
}

// Task-level feasibility helpers
function addTaskFeasibility(taskId: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return
  updateRequirement(taskId, {
    ...requirement,
    feasibility: {},
  })
}

function removeTaskFeasibility(taskId: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return
  const { feasibility, ...rest } = requirement
  updateRequirement(taskId, rest)
}

function updateTaskFeasibility(taskId: string, partial: Partial<RequirementFeasibility>) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const next: Record<string, unknown> = { ...requirement.feasibility, ...partial }
  const cleaned = Object.fromEntries(
    Object.entries(next).filter(([, v]) => {
      if (v === undefined || v === null) return false
      if (typeof v === 'string' && v.trim() === '') return false
      if (Array.isArray(v) && v.length === 0) return false
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        return Object.keys(v as object).length > 0
      }
      return true
    })
  ) as RequirementFeasibility

  updateRequirement(taskId, {
    ...requirement,
    feasibility: Object.keys(cleaned).length > 0 ? cleaned : undefined,
  })
}

function handleModelSelectionChange(taskId: string, value: string) {
  const modelSelection = value || undefined
  const updates: Partial<RequirementFeasibility> = { modelSelection }
  
  // Clear model name if task becomes deterministic
  if (modelSelection === 'none') {
    updates.modelName = undefined
  }
  
  updateTaskFeasibility(taskId, updates)
}

function updateTaskTechApproach(taskId: string, architecture: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const valid = ['none', 'simple-prompting', 'rag', 'fine-tuning', 'agents', 'other'] as const
  const arch = (architecture && valid.includes(architecture as typeof valid[number]) ? architecture : undefined) as typeof valid[number] | undefined

  const updates: Partial<RequirementFeasibility> = {
    technologyApproach: arch
      ? {
          ...requirement.feasibility?.technologyApproach,
          architecture: arch,
        }
      : undefined,
  }
  
  // Clear model name if task becomes deterministic
  if (arch === 'none') {
    updates.modelName = undefined
    updates.modelSelection = 'none'
  }

  updateTaskFeasibility(taskId, updates)
}

function updateTaskRagDetails(taskId: string, field: 'retrievalMethod' | 'embeddingModel' | 'chunkingStrategy', value: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const ragDetails = {
    ...requirement.feasibility?.technologyApproach?.ragDetails,
    [field]: value || undefined,
  }

  const techApproach = {
    ...requirement.feasibility?.technologyApproach,
    architecture: requirement.feasibility?.technologyApproach?.architecture || 'rag',
    ragDetails: Object.keys(ragDetails).length > 0 ? ragDetails : undefined,
  }

  updateTaskFeasibility(taskId, { technologyApproach: techApproach })
}

function updateTaskFineTuningDetails(taskId: string, field: 'baseModel' | 'tuningApproach' | 'dataset', value: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const fineTuningDetails = {
    ...requirement.feasibility?.technologyApproach?.fineTuningDetails,
    [field]: value || undefined,
  }

  const techApproach = {
    ...requirement.feasibility?.technologyApproach,
    architecture: requirement.feasibility?.technologyApproach?.architecture || 'fine-tuning',
    fineTuningDetails: Object.keys(fineTuningDetails).length > 0 ? fineTuningDetails : undefined,
  }

  updateTaskFeasibility(taskId, { technologyApproach: techApproach })
}

// Agentic framework (array - add multiple items)
function addAgenticFramework(taskId: string) {
  const value = agenticFrameworkInputs.value[taskId]?.trim()
  if (!value) return
  
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingFrameworks = requirement.feasibility?.technologyApproach?.agenticDetails?.framework || []
  if (existingFrameworks.includes(value)) return

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    framework: [...existingFrameworks, value],
  }

  const techApproach = {
    ...requirement.feasibility?.technologyApproach,
    architecture: requirement.feasibility?.technologyApproach?.architecture || 'agents',
    agenticDetails: agenticDetails,
  }

  updateTaskFeasibility(taskId, { technologyApproach: techApproach })
  agenticFrameworkInputs.value[taskId] = ''
}

function removeAgenticFramework(taskId: string, framework: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingFrameworks = requirement.feasibility?.technologyApproach?.agenticDetails?.framework || []
  const updatedFrameworks = existingFrameworks.filter((f) => f !== framework)

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    framework: updatedFrameworks.length > 0 ? updatedFrameworks : undefined,
  }

  const techApproach = {
    ...requirement.feasibility?.technologyApproach,
    agenticDetails: Object.keys(agenticDetails).length > 0 ? agenticDetails : undefined,
  }

  updateTaskFeasibility(taskId, { technologyApproach: techApproach })
}

// Agentic tools (array)
function addAgenticTool(taskId: string) {
  const value = agenticToolsInputs.value[taskId]?.trim()
  if (!value) return
  
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingTools = requirement.feasibility?.technologyApproach?.agenticDetails?.tools || []
  if (existingTools.includes(value)) return

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    tools: [...existingTools, value],
  }

  const techApproach = {
    ...requirement.feasibility?.technologyApproach,
    architecture: requirement.feasibility?.technologyApproach?.architecture || 'agents',
    agenticDetails: agenticDetails,
  }

  updateTaskFeasibility(taskId, { technologyApproach: techApproach })
  agenticToolsInputs.value[taskId] = ''
}

function removeAgenticTool(taskId: string, tool: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingTools = requirement.feasibility?.technologyApproach?.agenticDetails?.tools || []
  const updatedTools = existingTools.filter((t) => t !== tool)

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    tools: updatedTools.length > 0 ? updatedTools : undefined,
  }

  const techApproach = {
    ...requirement.feasibility?.technologyApproach,
    agenticDetails: Object.keys(agenticDetails).length > 0 ? agenticDetails : undefined,
  }

  updateTaskFeasibility(taskId, { technologyApproach: techApproach })
}

// Agentic orchestration (array - add multiple items)
function addAgenticOrchestration(taskId: string) {
  const value = agenticOrchestrationInputs.value[taskId]?.trim()
  if (!value) return
  
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingOrchestrations = requirement.feasibility?.technologyApproach?.agenticDetails?.orchestration || []
  if (existingOrchestrations.includes(value)) return

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    orchestration: [...existingOrchestrations, value],
  }

  const techApproach = {
    ...requirement.feasibility?.technologyApproach,
    architecture: requirement.feasibility?.technologyApproach?.architecture || 'agents',
    agenticDetails: agenticDetails,
  }

  updateTaskFeasibility(taskId, { technologyApproach: techApproach })
  agenticOrchestrationInputs.value[taskId] = ''
}

function removeAgenticOrchestration(taskId: string, orchestration: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingOrchestrations = requirement.feasibility?.technologyApproach?.agenticDetails?.orchestration || []
  const updatedOrchestrations = existingOrchestrations.filter((o) => o !== orchestration)

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    orchestration: updatedOrchestrations.length > 0 ? updatedOrchestrations : undefined,
  }

  const techApproach = {
    ...requirement.feasibility?.technologyApproach,
    agenticDetails: Object.keys(agenticDetails).length > 0 ? agenticDetails : undefined,
  }

  updateTaskFeasibility(taskId, { technologyApproach: techApproach })
}

// Algorithms (array)
function addAlgorithm(taskId: string) {
  const value = algorithmsInputs.value[taskId]?.trim()
  if (!value) return
  
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingAlgorithms = requirement.feasibility?.algorithms || []
  if (existingAlgorithms.includes(value)) return

  updateTaskFeasibility(taskId, { algorithms: [...existingAlgorithms, value] })
  algorithmsInputs.value[taskId] = ''
}

function removeAlgorithm(taskId: string, algorithm: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingAlgorithms = requirement.feasibility?.algorithms || []
  const updatedAlgorithms = existingAlgorithms.filter((a) => a !== algorithm)

  updateTaskFeasibility(taskId, { algorithms: updatedAlgorithms.length > 0 ? updatedAlgorithms : undefined })
}

// Tools (array)
function addTool(taskId: string) {
  const value = toolsInputs.value[taskId]?.trim()
  if (!value) return
  
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingTools = requirement.feasibility?.tools || []
  if (existingTools.includes(value)) return

  updateTaskFeasibility(taskId, { tools: [...existingTools, value] })
  toolsInputs.value[taskId] = ''
}

function removeTool(taskId: string, tool: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingTools = requirement.feasibility?.tools || []
  const updatedTools = existingTools.filter((t) => t !== tool)

  updateTaskFeasibility(taskId, { tools: updatedTools.length > 0 ? updatedTools : undefined })
}
</script>
