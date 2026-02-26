<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span class="flex-1 min-w-0">Feasibility & Risks</span>
        <span class="flex-shrink-0">
          <InfoTooltip
            content="<strong>What goes here:</strong> Technical feasibility assessment and risk identification at project and task levels.<br/><br/><strong>Project-level:</strong> Simple, generic defaults that apply to all tasks (TRL, overall risk, effort estimate).<br/><br/><strong>Task-level:</strong> Optional detailed feasibility assessments and risk registers for individual tasks. Use these when tasks differ significantly from project defaults or require specific technologies (e.g., LLMs, RAG, MCP). Tasks that are deterministic and don't require LLMs can be marked accordingly."
            position="top"
          />
        </span>
      </h2>
      <p class="section-description">
        Assess technical feasibility and identify risks at project and task levels. Project-level provides simple defaults; task-level allows detailed overrides and per-task risk assessment.
      </p>
      <p class="mt-3 text-sm text-gray-600 mb-2">
        This canvas balances expected benefits (Tasks & Benefits) with technical feasibility, developer effort, and identified risks. Together they form a realistic picture of what can be achieved and what could go wrong.
      </p>
      <ul class="text-sm text-gray-600 mb-4 list-disc ml-6 space-y-1">
        <li><strong>Project-level feasibility</strong> sets realistic defaults for technical risk, effort, and maturity that apply across all tasks</li>
        <li><strong>Task-level feasibility</strong> allows fine-tuning when individual tasks differ significantly in complexity or technology requirements</li>
        <li><strong>Risk assessment</strong> per task captures what could go wrong, how likely and severe, and how to mitigate it</li>
        <li><strong>Align estimates</strong> between expected benefits, technical effort, and identified risks for realistic project planning</li>
      </ul>
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
              <span v-if="localData.effortEstimate?.value" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatEffort(localData.effortEstimate) }}
              </span>
            </div>
            <div v-if="!trlSummary && !localData.technicalRisk && !localData.effortEstimate?.value" class="text-xs text-gray-400 italic">
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="effort-estimate-value"
            label="Overall Effort Estimate"
            help-text="Estimated effort value for the project"
            tooltip="Estimate the effort required for implementation. Enter a numeric value and select the unit (weeks or person-hours). Be realistic - consider development, testing, and deployment."
          >
            <input
              id="effort-estimate-value"
              :value="localData.effortEstimate?.value ?? ''"
              type="number"
              min="0"
              step="0.1"
              class="form-input"
              placeholder="e.g., 12"
              @input="updateEffortValue(($event.target as HTMLInputElement).value)"
            />
          </FormField>
          <FormField
            id="effort-estimate-unit"
            label="Effort Unit"
            help-text="Unit for effort estimate"
            tooltip="Select whether effort is measured in weeks (calendar time) or person-hours (total work time)."
          >
            <select
              id="effort-estimate-unit"
              :value="localData.effortEstimate?.unit || 'weeks'"
              class="form-input"
              @change="updateEffortUnit(($event.target as HTMLSelectElement).value as 'weeks' | 'person-hours')"
            >
              <option value="weeks">Weeks</option>
              <option value="person-hours">Person-hours</option>
            </select>
          </FormField>
        </div>

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

        <!-- Done Button -->
        <div class="pt-4 border-t border-gray-200 mt-4">
          <button
            type="button"
            @click="cardExpanded.projectLevel = false"
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
              <span v-if="tasksWithFeasibility.length > 0 || tasksWithRisks.length > 0">
                <span v-if="tasksWithFeasibility.length > 0">
                  {{ tasksWithFeasibility.length }} {{ tasksWithFeasibility.length === 1 ? 'task' : 'tasks' }} with custom feasibility
                </span>
                <span v-if="tasksWithFeasibility.length > 0 && tasksWithRisks.length > 0"> &middot; </span>
                <span v-if="tasksWithRisks.length > 0">
                  {{ tasksWithRisks.length }} {{ tasksWithRisks.length === 1 ? 'task' : 'tasks' }} with risk assessment
                </span>
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

        <div class="space-y-6">
          <div
            v-for="requirement in requirements"
            :key="requirement.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ requirement.title || requirement.id }}</h4>
                <div v-if="requirement.description" class="text-sm text-gray-600 mt-1">
                  <p class="text-xs text-gray-500 mb-1 italic">From task description:</p>
                  <div class="markdown-content" v-html="formatDescription(requirement.description)"></div>
                </div>
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
                    @change="updateTaskFeasibility(requirement.id, { technicalRisk: (($event.target as HTMLSelectElement).value || undefined) as RequirementFeasibility['technicalRisk'] })"
                  >
                    <option value="">Use project default</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </FormField>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    :id="`task-${requirement.id}-effort-value`"
                    label="Effort Estimate"
                    help-text="Estimated effort value for this task (overrides project-level)"
                  >
                    <input
                      :id="`task-${requirement.id}-effort-value`"
                      :value="requirement.feasibility?.effortEstimate?.value ?? ''"
                      type="number"
                      min="0"
                      step="0.1"
                      class="form-input"
                      placeholder="e.g., 2"
                      @input="updateTaskEffortValue(requirement.id, ($event.target as HTMLInputElement).value)"
                    />
                  </FormField>
                  <FormField
                    :id="`task-${requirement.id}-effort-unit`"
                    label="Effort Unit"
                    help-text="Unit for effort estimate"
                  >
                    <select
                      :id="`task-${requirement.id}-effort-unit`"
                      :value="requirement.feasibility?.effortEstimate?.unit || 'weeks'"
                      class="form-input"
                      @change="updateTaskEffortUnit(requirement.id, ($event.target as HTMLSelectElement).value as 'weeks' | 'person-hours')"
                    >
                      <option value="weeks">Weeks</option>
                      <option value="person-hours">Person-hours</option>
                    </select>
                  </FormField>
                </div>
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
                  :id="`task-${requirement.id}-model-card-uri`"
                  label="Model Card URI"
                  help-text="Link to the model's model card documentation"
                  tooltip="A URI pointing to the model card for the selected model. Model cards describe a model's intended uses, limitations, training data, and evaluation results. Examples: Hugging Face model page, internal model registry link."
                >
                  <div class="flex items-center gap-2">
                    <input
                      :id="`task-${requirement.id}-model-card-uri`"
                      :value="requirement.feasibility?.modelCardUri || ''"
                      type="url"
                      class="form-input flex-1"
                      :disabled="requirement.feasibility?.modelSelection === 'none' || requirement.feasibility?.technologyApproach?.architecture === 'none'"
                      placeholder="https://huggingface.co/org/model"
                      @blur="updateTaskFeasibility(requirement.id, { modelCardUri: ($event.target as HTMLInputElement).value || undefined })"
                    />
                    <a
                      v-if="requirement.feasibility?.modelCardUri"
                      :href="requirement.feasibility.modelCardUri"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary-600 hover:text-primary-800 flex-shrink-0"
                      title="Open model card"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <p v-if="requirement.feasibility?.modelSelection === 'none' || requirement.feasibility?.technologyApproach?.architecture === 'none'" class="text-xs text-gray-500 mt-1">
                    Not applicable for deterministic tasks
                  </p>
                </FormField>

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
                  <FormField :id="`task-${requirement.id}-agent-framework`" label="Framework" help-text="Type a name and press Enter to add a chip, or separate multiple with commas" tooltip="Each agentic framework or pattern is stored as a separate chip. Type a single name and press Enter, or enter several at once separated by commas (e.g. ReAct, MCP).">
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
                        placeholder="Type a name and press Enter (e.g. ReAct)"
                        @keydown.enter.prevent="addAgenticFramework(requirement.id)"
                        @blur="addAgenticFramework(requirement.id)"
                      />
                    </div>
                  </FormField>
                  <FormField :id="`task-${requirement.id}-agent-tools`" label="Tools" help-text="Type a name and press Enter to add a chip, or separate multiple with commas" tooltip="Each tool available to the agent (MCP tools, custom tools, APIs) is stored as a separate chip. Type a single name and press Enter, or enter several at once separated by commas (e.g. file_search, browser).">
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
                        placeholder="Type a name and press Enter (e.g. file_search)"
                        @keydown.enter.prevent="addAgenticTool(requirement.id)"
                        @blur="addAgenticTool(requirement.id)"
                      />
                    </div>
                  </FormField>
                  <FormField :id="`task-${requirement.id}-agent-orchestration`" label="Orchestration" help-text="Type a name and press Enter to add a chip, or separate multiple with commas" tooltip="Each orchestration framework or library is stored as a separate chip. Type a single name and press Enter, or enter several at once separated by commas (e.g. LangGraph, AutoGPT).">
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
                        placeholder="Type a name and press Enter (e.g. LangGraph)"
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
                    help-text="Type a name and press Enter to add a chip, or separate multiple with commas"
                    tooltip="Each algorithm, model, or technology is stored as a separate chip. Type a single name and press Enter, or enter several at once separated by commas (e.g. BERT, OCR, rule-based)."
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
                        placeholder="Type a name and press Enter (e.g. BERT)"
                        @keydown.enter.prevent="addAlgorithm(requirement.id)"
                        @blur="addAlgorithm(requirement.id)"
                      />
                    </div>
                  </FormField>

                  <FormField
                    :id="`task-${requirement.id}-tools`"
                    label="Tools / Frameworks"
                    help-text="Type a name and press Enter to add a chip, or separate multiple with commas"
                    tooltip="Each tool, library, or framework is stored as a separate chip. Type a single name and press Enter, or enter several at once separated by commas (e.g. LangChain, OpenAI API)."
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
                        placeholder="Type a name and press Enter (e.g. LangChain)"
                        @keydown.enter.prevent="addTool(requirement.id)"
                        @blur="addTool(requirement.id)"
                      />
                    </div>
                  </FormField>
                </div>

                <!-- Risk Assessment -->
                <div class="border-t border-gray-200 pt-4 mt-4">
                  <div class="flex items-center justify-between mb-3">
                    <h5 class="text-sm font-medium text-gray-900 flex items-center gap-2">
                      Risk Assessment
                      <InfoTooltip
                        content="Identify risks for this task: what could go wrong, how likely and severe it is, and how to mitigate it. Risk categories: <strong>Technical</strong> (implementation challenges), <strong>Data</strong> (quality, availability, privacy), <strong>Compliance</strong> (regulatory, legal), <strong>Operational</strong> (reliability, availability), <strong>Ethical</strong> (bias, fairness), <strong>Adoption</strong> (user acceptance, workflow integration)."
                        position="top"
                      />
                    </h5>
                    <button
                      type="button"
                      @click="addRisk(requirement.id)"
                      class="btn-secondary text-xs"
                    >
                      + Add Risk
                    </button>
                  </div>

                  <div v-if="!requirement.feasibility?.risks?.length" class="text-sm text-gray-400 italic">
                    No risks identified yet
                  </div>

                  <div v-else class="space-y-3">
                    <div
                      v-for="(risk, riskIdx) in requirement.feasibility.risks"
                      :key="risk.id"
                      class="border border-gray-200 rounded-lg p-3 space-y-3"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FormField :id="`task-${requirement.id}-risk-${riskIdx}-title`" label="Title">
                            <input
                              :id="`task-${requirement.id}-risk-${riskIdx}-title`"
                              :value="risk.title"
                              type="text"
                              class="form-input"
                              placeholder="e.g., Model hallucination on edge cases"
                              @blur="updateRisk(requirement.id, riskIdx, { title: ($event.target as HTMLInputElement).value })"
                            />
                          </FormField>
                          <FormField :id="`task-${requirement.id}-risk-${riskIdx}-category`" label="Category">
                            <select
                              :id="`task-${requirement.id}-risk-${riskIdx}-category`"
                              :value="risk.riskCategory"
                              class="form-input"
                              @change="updateRisk(requirement.id, riskIdx, { riskCategory: ($event.target as HTMLSelectElement).value as Risk['riskCategory'] })"
                            >
                              <option value="technical">Technical</option>
                              <option value="data">Data</option>
                              <option value="compliance">Compliance</option>
                              <option value="operational">Operational</option>
                              <option value="ethical">Ethical</option>
                              <option value="adoption">Adoption</option>
                            </select>
                          </FormField>
                        </div>
                        <button
                          type="button"
                          @click="removeRisk(requirement.id, riskIdx)"
                          class="text-sm text-red-600 hover:text-red-800 mt-6"
                          aria-label="Remove risk"
                        >
                          Remove
                        </button>
                      </div>

                      <FormField :id="`task-${requirement.id}-risk-${riskIdx}-description`" label="Description">
                        <textarea
                          :id="`task-${requirement.id}-risk-${riskIdx}-description`"
                          :value="risk.description || ''"
                          rows="2"
                          class="form-input"
                          placeholder="Describe the risk in detail"
                          @blur="updateRisk(requirement.id, riskIdx, { description: ($event.target as HTMLTextAreaElement).value || undefined })"
                        />
                      </FormField>

                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField :id="`task-${requirement.id}-risk-${riskIdx}-likelihood`" label="Likelihood">
                          <select
                            :id="`task-${requirement.id}-risk-${riskIdx}-likelihood`"
                            :value="risk.likelihood"
                            class="form-input"
                            @change="updateRisk(requirement.id, riskIdx, { likelihood: ($event.target as HTMLSelectElement).value as Risk['likelihood'] })"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </FormField>
                        <FormField :id="`task-${requirement.id}-risk-${riskIdx}-impact`" label="Impact">
                          <select
                            :id="`task-${requirement.id}-risk-${riskIdx}-impact`"
                            :value="risk.impact"
                            class="form-input"
                            @change="updateRisk(requirement.id, riskIdx, { impact: ($event.target as HTMLSelectElement).value as Risk['impact'] })"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </FormField>
                        <FormField :id="`task-${requirement.id}-risk-${riskIdx}-status`" label="Status">
                          <select
                            :id="`task-${requirement.id}-risk-${riskIdx}-status`"
                            :value="risk.status"
                            class="form-input"
                            @change="updateRisk(requirement.id, riskIdx, { status: ($event.target as HTMLSelectElement).value as Risk['status'] })"
                          >
                            <option value="identified">Identified</option>
                            <option value="mitigated">Mitigated</option>
                            <option value="accepted">Accepted</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </FormField>
                      </div>

                      <FormField :id="`task-${requirement.id}-risk-${riskIdx}-mitigation`" label="Mitigation Strategy">
                        <textarea
                          :id="`task-${requirement.id}-risk-${riskIdx}-mitigation`"
                          :value="risk.mitigation || ''"
                          rows="2"
                          class="form-input"
                          placeholder="How will this risk be addressed?"
                          @blur="updateRisk(requirement.id, riskIdx, { mitigation: ($event.target as HTMLTextAreaElement).value || undefined })"
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Done Button -->
        <div class="pt-4 border-t border-gray-200 mt-4">
          <button
            type="button"
            @click="cardExpanded.taskLevel = false"
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

    <!-- Effort Summary -->
    <div v-if="tasksWithEffort.length > 0" class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.effortSummary"
        @click="cardExpanded.effortSummary = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Development Effort Summary</h3>
            </div>
            <div class="text-sm text-gray-600">
              <div class="flex items-center gap-4 mb-2 flex-wrap">
                <span class="font-medium">Total: {{ formatTotalEffort() }}</span>
                <span v-if="totalTimeSavedPersonHours > 0" class="font-medium text-green-700">
                  Time Benefits: {{ formatTimeSaved(totalTimeSavedPersonHours) }}/month
                </span>
                <span v-if="totalAmortizationMonths !== null" class="font-medium text-blue-700">
                  Until Amortization: {{ totalAmortizationMonths.toFixed(1) }} months
                </span>
                <span>{{ tasksWithEffort.length }} {{ tasksWithEffort.length === 1 ? 'task' : 'tasks' }} with effort estimates</span>
              </div>
              <!-- Effort and benefit bars for each task -->
              <div class="space-y-3 mt-3">
                <div
                  v-for="req in tasksWithEffort"
                  :key="req.id"
                  class="space-y-2"
                >
                  <!-- Title row with badges on the right -->
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-600 font-medium">{{ req.title || req.id }}</span>
                    <!-- Benefit type badges -->
                    <div v-if="getBenefitTypes(req).length > 0" class="flex flex-wrap gap-1">
                      <span
                        v-for="type in getBenefitTypes(req)"
                        :key="type"
                        :class="benefitTypeBadgeClass(type)"
                        class="px-2 py-0 rounded text-[10px] font-medium"
                      >
                        {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Effort bar -->
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-400 w-24 truncate">Effort</span>
                    <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                      <div
                        class="h-full bg-purple-500 transition-all absolute left-0 top-0"
                        :style="{ width: `${getEffortPercentage(req)}%` }"
                      />
                    </div>
                    <span class="text-xs text-gray-700 font-medium text-right whitespace-nowrap min-w-[100px]">{{ formatEffort(req.feasibility?.effortEstimate) }}</span>
                  </div>
                  
                  <!-- Time benefit bar -->
                  <div v-if="getTimeSavedPersonHours(req) > 0" class="flex items-center gap-3">
                    <span class="text-xs text-gray-400 w-24 truncate">Time Benefits</span>
                    <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                      <div
                        class="h-full bg-green-500 transition-all absolute left-0 top-0"
                        :style="{ width: `${getTimeSavedPercentage(req)}%` }"
                      />
                    </div>
                    <div class="flex items-center gap-2 min-w-[100px] justify-end">
                      <span class="text-xs text-green-700 font-medium text-right whitespace-nowrap">{{ formatTimeSaved(getTimeSavedPersonHours(req)) }}/mo</span>
                      <span v-if="getAmortizationMonths(req) !== null" class="text-xs text-blue-600 font-medium text-right whitespace-nowrap">
                        {{ getAmortizationMonths(req)!.toFixed(1) }}mo until amort
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
          <h3 class="text-sm font-semibold text-gray-900">Development Effort Summary</h3>
          <button
            @click="cardExpanded.effortSummary = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Effort Summary"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Total Effort</span>
                <span class="text-lg font-semibold text-gray-900">{{ formatTotalEffort() }}</span>
              </div>
              <div class="text-xs text-gray-600 mt-1">
                Sum of all task-level effort estimates
              </div>
            </div>
            <div v-if="totalTimeSavedPersonHours > 0" class="bg-green-50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Time Benefits</span>
                <span class="text-lg font-semibold text-green-700">{{ formatTimeSaved(totalTimeSavedPersonHours) }}/month</span>
              </div>
              <div class="text-xs text-gray-600 mt-1">
                Net time saved per month (other benefit types not shown)
              </div>
            </div>
            <div v-if="totalAmortizationMonths !== null" class="bg-blue-50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Amortization Period</span>
                <span class="text-lg font-semibold text-blue-700">{{ totalAmortizationMonths.toFixed(1) }} months</span>
              </div>
              <div class="text-xs text-gray-600 mt-1">
                Months until effort amortizes
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-900">Effort vs Time Benefits by Task</h4>
            <p class="text-xs text-gray-500 mb-3">
              Note: Only time benefits are shown here. Tasks may also have quality, risk, enablement, or cost benefits (see badges).
            </p>
            <div class="space-y-4">
              <div
                v-for="req in tasksWithEffort"
                :key="req.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex-1">
                    <span class="text-sm font-medium text-gray-900">{{ req.title || req.id }}</span>
                    <!-- Benefit type badges -->
                    <div v-if="getBenefitTypes(req).length > 0" class="flex flex-wrap gap-1.5 mt-2">
                      <span
                        v-for="type in getBenefitTypes(req)"
                        :key="type"
                        :class="benefitTypeBadgeClass(type)"
                        class="px-2 py-0 rounded text-xs font-medium"
                      >
                        {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Effort -->
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-600">Effort</span>
                    <span class="text-xs font-medium text-purple-700">{{ formatEffort(req.feasibility?.effortEstimate) }}</span>
                  </div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                      class="h-full bg-purple-500 transition-all absolute left-0 top-0"
                      :style="{ width: `${getEffortPercentage(req)}%` }"
                    />
                  </div>
                </div>
                
                <!-- Time Benefits -->
                <div v-if="getTimeSavedPersonHours(req) > 0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-600">Time Benefits (saved/month)</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-medium text-green-700">{{ formatTimeSaved(getTimeSavedPersonHours(req)) }}</span>
                      <span v-if="getAmortizationMonths(req) !== null" class="text-xs font-medium text-blue-600">
                        ({{ getAmortizationMonths(req)!.toFixed(1) }}mo until amortization)
                      </span>
                    </div>
                  </div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                      class="h-full bg-green-500 transition-all absolute left-0 top-0"
                      :style="{ width: `${getTimeSavedPercentage(req)}%` }"
                    />
                  </div>
                </div>
                <div v-else class="text-xs text-gray-400 italic">
                  No time benefits defined for this task
                </div>
              </div>
            </div>
          </div>

          <!-- Done Button -->
          <div class="pt-4 border-t border-gray-200 mt-4">
            <button
              type="button"
              @click="cardExpanded.effortSummary = false"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import FormField from '../FormField.vue'
import InfoTooltip from '../InfoTooltip.vue'
import type { DeveloperFeasibility, RequirementFeasibility, Benefit, Risk } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'
import type { Requirement } from '@/types/canvas'
import { markdownToHtml } from '@/utils/markdown'
import { getTimeSavedPerUnit, getOversightMinutes } from '@/utils/timeBenefits'

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
  effortSummary: false,
})

const requirements = computed(() => canvasData.value.userExpectations?.requirements || [])

const tasksWithFeasibility = computed(() => {
  return requirements.value.filter((r) => r.feasibility && Object.keys(r.feasibility).length > 0)
})

const tasksWithRisks = computed(() => {
  return requirements.value.filter((r) => r.feasibility?.risks && r.feasibility.risks.length > 0)
})

const tasksWithEffort = computed(() => {
  return requirements.value.filter((r) => r.feasibility?.effortEstimate?.value !== undefined && r.feasibility.effortEstimate.value > 0)
})

// Calculate total effort (normalize to person-hours for aggregation)
const totalEffortPersonHours = computed(() => {
  return tasksWithEffort.value.reduce((total, req) => {
    const effort = req.feasibility?.effortEstimate
    if (!effort || effort.value === undefined) return total
    // Normalize to person-hours (assume 40 person-hours per week)
    if (effort.unit === 'weeks') {
      return total + (effort.value * 40)
    }
    return total + effort.value
  }, 0)
})

// Get maximum effort for percentage calculation
const maxEffortPersonHours = computed(() => {
  if (tasksWithEffort.value.length === 0) return 0
  const efforts = tasksWithEffort.value.map(req => {
    const effort = req.feasibility?.effortEstimate
    if (!effort || effort.value === undefined) return 0
    if (effort.unit === 'weeks') {
      return effort.value * 40
    }
    return effort.value
  })
  return Math.max(...efforts, 0)
})

function getEffortPercentage(req: Requirement): number {
  if (maxEffortPersonHours.value === 0) return 0
  const effort = req.feasibility?.effortEstimate
  if (!effort || effort.value === undefined) return 0
  const effortHours = effort.unit === 'weeks' ? effort.value * 40 : effort.value
  return Math.round((effortHours / maxEffortPersonHours.value) * 100)
}

function formatTotalEffort(): string {
  const totalHours = totalEffortPersonHours.value
  if (totalHours === 0) return '0 person-hours'
  
  // Show in weeks if >= 40 hours, otherwise person-hours
  if (totalHours >= 40) {
    const weeks = Math.round((totalHours / 40) * 10) / 10
    return `${weeks} weeks (${totalHours} person-hours)`
  }
  return `${totalHours} person-hours`
}

// Get time benefit from a requirement
function getTimeBenefit(req: Requirement): Benefit | undefined {
  return (req.benefits || []).find(b => b.benefitType === 'time')
}

// Calculate time saved per month for a requirement (in person-hours)
function getTimeSavedPersonHours(req: Requirement): number {
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return 0
  
  const savedPerUnit = getTimeSavedPerUnit(timeBenefit, req)
  const volume = req.volumePerMonth || 0
  const grossTimeSaved = savedPerUnit * volume
  const oversightTime = getOversightMinutes(timeBenefit, volume)
  const netTimeSaved = Math.max(0, grossTimeSaved - oversightTime)
  
  // Convert minutes to person-hours
  return netTimeSaved / 60
}

// Calculate total time saved across all tasks with effort estimates
const totalTimeSavedPersonHours = computed(() => {
  return tasksWithEffort.value.reduce((total, req) => {
    return total + getTimeSavedPersonHours(req)
  }, 0)
})

// Get maximum time saved for normalization
const maxTimeSavedPersonHours = computed(() => {
  if (tasksWithEffort.value.length === 0) return 0
  const saved = tasksWithEffort.value.map(req => getTimeSavedPersonHours(req))
  return Math.max(...saved, 0)
})

// Format time saved for display
function formatTimeSaved(hours: number): string {
  if (hours === 0) return '0h'
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}m`
  }
  if (hours < 10) {
    return `${Math.round(hours * 10) / 10}h`
  }
  return `${Math.round(hours)}h`
}

// Get time saved percentage for bar display
function getTimeSavedPercentage(req: Requirement): number {
  if (maxTimeSavedPersonHours.value === 0) return 0
  const saved = getTimeSavedPersonHours(req)
  return Math.round((saved / maxTimeSavedPersonHours.value) * 100)
}

// Calculate amortization period (months until effort amortizes) for a task
function getAmortizationMonths(req: Requirement): number | null {
  const effort = req.feasibility?.effortEstimate
  if (!effort || effort.value === undefined || effort.value === 0) return null
  
  const effortHours = effort.unit === 'weeks' ? effort.value * 40 : effort.value
  const monthlyBenefitHours = getTimeSavedPersonHours(req)
  
  if (monthlyBenefitHours === 0) return null
  return effortHours / monthlyBenefitHours
}

// Calculate total amortization period
const totalAmortizationMonths = computed(() => {
  const totalEffort = totalEffortPersonHours.value
  const totalBenefit = totalTimeSavedPersonHours.value
  if (totalEffort === 0 || totalBenefit === 0) return null
  return totalEffort / totalBenefit
})

// Get unique benefit types for a requirement
function getBenefitTypes(req: Requirement): string[] {
  const types = new Set((req.benefits || []).map(b => b.benefitType))
  return Array.from(types)
}

// Badge class for benefit types
function benefitTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    'time': 'bg-green-100 text-green-700',
    'quality': 'bg-blue-100 text-blue-700',
    'risk': 'bg-orange-100 text-orange-700',
    'enablement': 'bg-purple-100 text-purple-700',
    'cost': 'bg-amber-100 text-amber-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

// Input refs for chip-based fields
const agenticFrameworkInputs = ref<Record<string, string>>({})
const agenticToolsInputs = ref<Record<string, string>>({})
const agenticOrchestrationInputs = ref<Record<string, string>>({})
const algorithmsInputs = ref<Record<string, string>>({})
const toolsInputs = ref<Record<string, string>>({})

// Migrate old string effortEstimate to structured format
function migrateEffortEstimate(effort: any): { value: number; unit: 'weeks' | 'person-hours' } | undefined {
  if (!effort) return undefined
  
  // Already in new format
  if (typeof effort === 'object' && effort.value !== undefined && effort.unit) {
    return effort
  }
  
  // Old string format - try to parse
  if (typeof effort === 'string') {
    const str = effort.trim().toLowerCase()
    
    // Handle ranges like "8-10 weeks" or "4-6 months" - take midpoint
    const rangeWeekMatch = str.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:week|wk)/i)
    if (rangeWeekMatch) {
      const min = parseFloat(rangeWeekMatch[1])
      const max = parseFloat(rangeWeekMatch[2])
      return { value: (min + max) / 2, unit: 'weeks' }
    }
    
    const rangeMonthMatch = str.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:month|mo)/i)
    if (rangeMonthMatch) {
      const min = parseFloat(rangeMonthMatch[1])
      const max = parseFloat(rangeMonthMatch[2])
      // Convert months to weeks (assume 4 weeks per month)
      return { value: ((min + max) / 2) * 4, unit: 'weeks' }
    }
    
    // Handle single values with months - convert to weeks
    const monthMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:month|mo)/i)
    if (monthMatch) {
      return { value: parseFloat(monthMatch[1]) * 4, unit: 'weeks' }
    }
    
    // Try to extract number and unit
    const weekMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:week|wk)/i)
    if (weekMatch) {
      return { value: parseFloat(weekMatch[1]), unit: 'weeks' }
    }
    const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:person-?hour|person-?hr|ph|hour|hr)/i)
    if (hourMatch) {
      return { value: parseFloat(hourMatch[1]), unit: 'person-hours' }
    }
    // Default: try to parse as number, assume weeks
    const numMatch = str.match(/(\d+(?:\.\d+)?)/)
    if (numMatch) {
      return { value: parseFloat(numMatch[1]), unit: 'weeks' }
    }
  }
  
  return undefined
}

// Initialize localData for project-level feasibility
const initLocalData = (): DeveloperFeasibility => {
  const feasibility = canvasData.value.developerFeasibility
  const effortEstimate = migrateEffortEstimate(feasibility?.effortEstimate)
  
  return {
    trlLevel: feasibility?.trlLevel || {},
    technicalRisk: feasibility?.technicalRisk,
    effortEstimate,
    feasibilityNotes: feasibility?.feasibilityNotes,
  }
}

const localData = ref<Required<Pick<DeveloperFeasibility, 'trlLevel'>> & DeveloperFeasibility>((() => {
  const d = initLocalData()
  return { ...d, trlLevel: d.trlLevel || {} }
})())

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
let isMigratingRequirements = false

watch(
  () => canvasData.value.developerFeasibility,
  (newFeasibility) => {
    if (!isLocalUpdate) {
      if (newFeasibility && Object.keys(newFeasibility).length > 0) {
        const migratedEffort = migrateEffortEstimate(newFeasibility.effortEstimate)
        localData.value = {
          trlLevel: newFeasibility.trlLevel || {},
          technicalRisk: newFeasibility.technicalRisk,
          effortEstimate: migratedEffort,
          feasibilityNotes: newFeasibility.feasibilityNotes,
        }
        if (!localData.value.trlLevel) {
          localData.value.trlLevel = {}
        }
        // If migration happened, update the canvas data
        if (migratedEffort !== newFeasibility.effortEstimate) {
          isLocalUpdate = true
          updateDeveloperFeasibility(localData.value)
          setTimeout(() => {
            isLocalUpdate = false
          }, 0)
        }
      } else {
        localData.value = { trlLevel: {} }
      }
    }
  },
  { deep: true, immediate: true }
)

// Watch requirements and migrate task-level effort estimates
watch(
  () => requirements.value,
  (newRequirements) => {
    // Prevent infinite loop
    if (isMigratingRequirements) return
    
    let needsMigration = false
    const migratedRequirements = newRequirements.map(req => {
      if (req.feasibility?.effortEstimate && typeof req.feasibility.effortEstimate === 'string') {
        needsMigration = true
        const migrated = migrateEffortEstimate(req.feasibility.effortEstimate)
        return {
          ...req,
          feasibility: {
            ...req.feasibility,
            effortEstimate: migrated
          }
        }
      }
      return req
    })
    
    if (needsMigration && migratedRequirements.length > 0) {
      isMigratingRequirements = true
      updateUserExpectations({ requirements: migratedRequirements })
      setTimeout(() => {
        isMigratingRequirements = false
      }, 0)
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

// Effort estimate helpers
function updateEffortValue(valueStr: string) {
  const value = valueStr === '' ? undefined : parseFloat(valueStr)
  if (value === undefined || isNaN(value)) {
    if (localData.value.effortEstimate) {
      localData.value.effortEstimate = {
        ...localData.value.effortEstimate,
        value: undefined as any
      }
      if (!localData.value.effortEstimate.value) {
        localData.value.effortEstimate = undefined
      }
    }
  } else {
    if (!localData.value.effortEstimate) {
      localData.value.effortEstimate = { value, unit: 'weeks' }
    } else {
      localData.value.effortEstimate.value = value
    }
  }
  update()
}

function updateEffortUnit(unit: 'weeks' | 'person-hours') {
  if (!localData.value.effortEstimate) {
    localData.value.effortEstimate = { value: 0, unit }
  } else {
    localData.value.effortEstimate.unit = unit
  }
  update()
}

function updateTaskEffortValue(taskId: string, valueStr: string) {
  const value = valueStr === '' ? undefined : parseFloat(valueStr)
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return
  
  let effortEstimate: { value: number; unit: 'weeks' | 'person-hours' } | undefined
  if (value === undefined || isNaN(value)) {
    effortEstimate = undefined
  } else {
    const currentUnit = requirement.feasibility?.effortEstimate?.unit || 'weeks'
    effortEstimate = { value, unit: currentUnit }
  }
  
  updateTaskFeasibility(taskId, { effortEstimate })
}

function updateTaskEffortUnit(taskId: string, unit: 'weeks' | 'person-hours') {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return
  
  const currentValue = requirement.feasibility?.effortEstimate?.value
  if (currentValue === undefined) {
    // If no value, create with 0 value
    updateTaskFeasibility(taskId, { effortEstimate: { value: 0, unit } })
  } else {
    updateTaskFeasibility(taskId, { 
      effortEstimate: { value: currentValue, unit } 
    })
  }
}

function formatEffort(effort?: { value: number; unit: 'weeks' | 'person-hours' }): string {
  if (!effort || effort.value === undefined) return ''
  const unitLabel = effort.unit === 'person-hours' ? 'person-hours' : 'weeks'
  return `${effort.value} ${unitLabel}`
}

// Format description with markdown
function formatDescription(description: string): string {
  return markdownToHtml(description)
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { feasibility: _feasibility, ...rest } = requirement
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
  const modelSelection = (value || undefined) as RequirementFeasibility['modelSelection']
  const updates: Partial<RequirementFeasibility> = { modelSelection }
  
  // Clear model name and model card URI if task becomes deterministic
  if (modelSelection === 'none') {
    updates.modelName = undefined
    updates.modelCardUri = undefined
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
  
  // Clear model name and model card URI if task becomes deterministic
  if (arch === 'none') {
    updates.modelName = undefined
    updates.modelCardUri = undefined
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
  const raw = agenticFrameworkInputs.value[taskId]
  if (!raw) return
  const values = raw.split(',').map(v => v.trim()).filter(Boolean)
  if (!values.length) return

  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingFrameworks = requirement.feasibility?.technologyApproach?.agenticDetails?.framework || []
  const newValues = values.filter(v => !existingFrameworks.includes(v))
  if (!newValues.length) { agenticFrameworkInputs.value[taskId] = ''; return }

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    framework: [...existingFrameworks, ...newValues],
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
  const raw = agenticToolsInputs.value[taskId]
  if (!raw) return
  const values = raw.split(',').map(v => v.trim()).filter(Boolean)
  if (!values.length) return

  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingTools = requirement.feasibility?.technologyApproach?.agenticDetails?.tools || []
  const newValues = values.filter(v => !existingTools.includes(v))
  if (!newValues.length) { agenticToolsInputs.value[taskId] = ''; return }

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    tools: [...existingTools, ...newValues],
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
  const raw = agenticOrchestrationInputs.value[taskId]
  if (!raw) return
  const values = raw.split(',').map(v => v.trim()).filter(Boolean)
  if (!values.length) return

  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingOrchestrations = requirement.feasibility?.technologyApproach?.agenticDetails?.orchestration || []
  const newValues = values.filter(v => !existingOrchestrations.includes(v))
  if (!newValues.length) { agenticOrchestrationInputs.value[taskId] = ''; return }

  const agenticDetails = {
    ...requirement.feasibility?.technologyApproach?.agenticDetails,
    orchestration: [...existingOrchestrations, ...newValues],
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
  const raw = algorithmsInputs.value[taskId]
  if (!raw) return
  const values = raw.split(',').map(v => v.trim()).filter(Boolean)
  if (!values.length) return

  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingAlgorithms = requirement.feasibility?.algorithms || []
  const newValues = values.filter(v => !existingAlgorithms.includes(v))
  if (newValues.length) {
    updateTaskFeasibility(taskId, { algorithms: [...existingAlgorithms, ...newValues] })
  }
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
  const raw = toolsInputs.value[taskId]
  if (!raw) return
  const values = raw.split(',').map(v => v.trim()).filter(Boolean)
  if (!values.length) return

  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingTools = requirement.feasibility?.tools || []
  const newValues = values.filter(v => !existingTools.includes(v))
  if (newValues.length) {
    updateTaskFeasibility(taskId, { tools: [...existingTools, ...newValues] })
  }
  toolsInputs.value[taskId] = ''
}

function removeTool(taskId: string, tool: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  const existingTools = requirement.feasibility?.tools || []
  const updatedTools = existingTools.filter((t) => t !== tool)

  updateTaskFeasibility(taskId, { tools: updatedTools.length > 0 ? updatedTools : undefined })
}

function addRisk(taskId: string) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement) return

  if (!requirement.feasibility) {
    addTaskFeasibility(taskId)
  }

  const existingRisks = requirement.feasibility?.risks || []
  const newRisk: Risk = {
    id: `risk-${Date.now()}`,
    riskCategory: 'technical',
    title: '',
    likelihood: 'medium',
    impact: 'medium',
    status: 'identified',
  }

  updateTaskFeasibility(taskId, { risks: [...existingRisks, newRisk] })
}

function removeRisk(taskId: string, riskIdx: number) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement?.feasibility?.risks) return

  const updated = [...requirement.feasibility.risks]
  updated.splice(riskIdx, 1)
  updateTaskFeasibility(taskId, { risks: updated.length > 0 ? updated : undefined })
}

function updateRisk(taskId: string, riskIdx: number, partial: Partial<Risk>) {
  const requirement = requirements.value.find((r) => r.id === taskId)
  if (!requirement?.feasibility?.risks) return

  const updated = [...requirement.feasibility.risks]
  updated[riskIdx] = { ...updated[riskIdx], ...partial }
  updateTaskFeasibility(taskId, { risks: updated })
}
</script>

<style scoped>
.markdown-content :deep(strong) {
  @apply font-semibold text-gray-900;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(ul) {
  @apply list-disc ml-6 space-y-1 mt-2 mb-2;
}

.markdown-content :deep(ol) {
  @apply list-decimal ml-6 space-y-1 mt-2 mb-2;
}

.markdown-content :deep(li) {
  @apply text-gray-600;
}

.markdown-content :deep(br) {
  @apply block;
  content: '';
  margin-top: 0.5rem;
}
</style>
