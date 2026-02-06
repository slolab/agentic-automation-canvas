<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span class="flex-1 min-w-0">Developer Feasibility & Technical Assessment</span>
        <span class="flex-shrink-0">
          <InfoTooltip
            content="<strong>What goes here:</strong> Technical assessment including Technology Readiness Level (TRL), risks, technologies, model selection, baseline capability, and expected gains.<br/><br/><strong>TRL (Technology Readiness Level):</strong> Measures maturity from 1 (basic research) to 9 (operational). Track current and target TRL to measure progress.<br/><br/><strong>Baseline Assessment:</strong> Critical for understanding improvement potential. Assess how well the naive model performs without agentic capabilities - this shows headroom for improvement.<br/><br/><strong>Workflow tip:</strong> Fill TRL and risk first, then assess baseline capability. Expected gains should align with baseline limitations."
            position="top"
          />
        </span>
      </h2>
      <p class="section-description">
        Assess technical feasibility, Technology Readiness Level (TRL), risks, and required technologies.
      </p>
    </div>

    <!-- Card 1: Technical Readiness -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.technicalReadiness"
        @click="cardExpanded.technicalReadiness = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Technical Readiness</h3>
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
              No technical readiness information added yet
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
          <h3 class="text-sm font-semibold text-gray-900">Technical Readiness</h3>
          <button
            @click="cardExpanded.technicalReadiness = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Technical Readiness"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

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
          label="Technical Risk"
          help-text="Overall technical risk assessment"
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
          label="Effort Estimate"
          help-text="Estimated effort or duration"
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
          id="applies-to-requirements"
          label="Applies to Tasks"
          help-text="If set, this feasibility assessment applies only to the selected tasks. Leave empty to apply to all tasks."
          tooltip="Scope this global feasibility to specific tasks. When empty, it applies to all tasks. Use per-task Technical Feasibility in task details to override for individual tasks."
        >
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="reqId in (localData.appliesToRequirements || [])"
                :key="reqId"
                class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm"
              >
                {{ getRequirementTitle(reqId) || reqId }}
                <button
                  type="button"
                  @click="removeAppliesToRequirement(reqId)"
                  class="text-gray-500 hover:text-red-600"
                  aria-label="Remove"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <select
              id="applies-to-requirements"
              :value="''"
              class="form-input w-auto"
              @change="addAppliesToRequirement(($event.target as HTMLSelectElement).value)"
            >
              <option value="">Add task...</option>
              <option
                v-for="req in requirementsNotInAppliesTo"
                :key="req.id"
                :value="req.id"
              >
                {{ req.title || req.id }}
              </option>
            </select>
          </div>
        </FormField>
      </div>
    </div>

    <!-- Card 2: Technology Stack -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.technologyStack"
        @click="cardExpanded.technologyStack = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Technology Stack</h3>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span v-if="modelSummary" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {{ modelSummary }}
              </span>
              <span v-if="localAlgorithms.length > 0" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {{ localAlgorithms.length }} {{ localAlgorithms.length === 1 ? 'algorithm' : 'algorithms' }}
              </span>
              <span v-if="localTools.length > 0" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {{ localTools.length }} {{ localTools.length === 1 ? 'tool' : 'tools' }}
              </span>
            </div>
            <div v-if="!modelSummary && localAlgorithms.length === 0 && localTools.length === 0" class="text-xs text-gray-400 italic">
              No technology stack information added yet
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
          <h3 class="text-sm font-semibold text-gray-900">Technology Stack</h3>
          <button
            @click="cardExpanded.technologyStack = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Technology Stack"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="model-selection"
            label="Model Type"
            help-text="Type of base model to be used for the agentic system"
            tooltip="Select the type of base model: <strong>Open Source</strong> - Publicly available models (e.g., Llama, Mistral); <strong>Frontier Model</strong> - Latest commercial models (e.g., GPT-4, Claude); <strong>Fine-tuned</strong> - Base model customized for your domain; <strong>Custom</strong> - Custom-built model; <strong>Other</strong> - Different type. This helps understand model capabilities and costs."
          >
            <select
              id="model-selection"
              v-model="localData.modelSelection"
              class="form-input"
              @change="update"
            >
              <option :value="undefined">Select model type</option>
              <option value="open-source">Open Source</option>
              <option value="frontier-model">Frontier Model</option>
              <option value="fine-tuned">Fine-tuned</option>
              <option value="custom">Custom</option>
              <option value="other">Other</option>
            </select>
          </FormField>

          <FormField
            id="model-name"
            label="Model Name"
            help-text="Specific model name or identifier (e.g., 'GPT-5', 'Claude 4.5', 'Gemini 2.5', 'Llama 3.2')"
            tooltip="Enter the specific model name or version you're using. Include version numbers for tracking. Examples: 'GPT-4', 'Claude 3.5 Sonnet', 'Gemini 2.0', 'Llama 3.1 70B'. This helps track which model versions were used and enables reproducibility."
          >
            <input
              id="model-name"
              v-model="localData.modelName"
              type="text"
              class="form-input"
              placeholder="e.g., GPT-5, Claude 4.5, Gemini 2.5"
              @blur="update"
            />
          </FormField>
        </div>

        <div>
          <label class="form-label mb-2">
            Algorithms / Technologies
            <span class="text-xs text-gray-500 font-normal ml-2">
              List of algorithms, models, or technologies to be used. Add one per entry.
            </span>
          </label>
          <CollapsibleListField
            v-model:items="localAlgorithms"
            label="Algorithms / Technologies"
            placeholder="e.g., BERT"
          />
        </div>

        <div>
          <label class="form-label mb-2">
            Tools / Frameworks
            <span class="text-xs text-gray-500 font-normal ml-2">
              Development tools and frameworks. Add one per entry.
            </span>
          </label>
          <CollapsibleListField
            v-model:items="localTools"
            label="Tools / Frameworks"
            placeholder="e.g., Python"
          />
        </div>
      </div>
    </div>

    <!-- Card 2b: LLM Technology Approach -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.llmApproach"
        @click="cardExpanded.llmApproach = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">LLM Technology Approach</h3>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span v-if="llmArchitectureLabel" class="flex items-center gap-1">
                {{ llmArchitectureLabel }}
              </span>
              <div v-if="!llmArchitectureLabel" class="text-xs text-gray-400 italic">
                No LLM approach specified yet
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
          <h3 class="text-sm font-semibold text-gray-900">LLM Technology Approach</h3>
          <button
            @click="cardExpanded.llmApproach = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse LLM Technology Approach"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Specify the LLM architecture and technology (RAG, MCP, ReAct, etc.) used for this project.
        </p>

        <FormField
          id="llm-architecture"
          label="Architecture"
          help-text="Primary LLM architecture approach"
          tooltip="<strong>Simple prompting</strong> - Direct prompts, no retrieval; <strong>RAG</strong> - Retrieval-augmented generation; <strong>Fine-tuning</strong> - Custom model; <strong>Agents</strong> - Agentic (ReAct, MCP, tools); <strong>Other</strong> - Different approach"
        >
          <select
            id="llm-architecture"
            v-model="localData.llmApproach.architecture"
            class="form-input"
            @change="update"
          >
            <option :value="undefined">Select architecture</option>
            <option value="simple-prompting">Simple prompting</option>
            <option value="rag">RAG (Retrieval-augmented generation)</option>
            <option value="fine-tuning">Fine-tuning</option>
            <option value="agents">Agents (ReAct, MCP, tools)</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <div v-if="localData.llmApproach?.architecture === 'rag'" class="space-y-4 pl-4 border-l-2 border-gray-200">
          <h4 class="text-sm font-medium text-gray-900">RAG Details</h4>
          <FormField id="rag-retrieval" label="Retrieval method" help-text="e.g. vector search, hybrid search">
            <input id="rag-retrieval" v-model="localData.llmApproach.ragDetails.retrievalMethod" type="text" class="form-input" placeholder="e.g., vector search" @blur="update" />
          </FormField>
          <FormField id="rag-embedding" label="Embedding model">
            <input id="rag-embedding" v-model="localData.llmApproach.ragDetails.embeddingModel" type="text" class="form-input" placeholder="e.g., text-embedding-3-small" @blur="update" />
          </FormField>
          <FormField id="rag-chunking" label="Chunking strategy">
            <input id="rag-chunking" v-model="localData.llmApproach.ragDetails.chunkingStrategy" type="text" class="form-input" placeholder="e.g., semantic, fixed-size" @blur="update" />
          </FormField>
        </div>

        <div v-if="localData.llmApproach?.architecture === 'agents'" class="space-y-4 pl-4 border-l-2 border-gray-200">
          <h4 class="text-sm font-medium text-gray-900">Agentic Details</h4>
          <FormField id="agent-framework" label="Framework" help-text="e.g. ReAct, Plan-and-Execute">
            <input id="agent-framework" v-model="localData.llmApproach.agenticDetails.framework" type="text" class="form-input" placeholder="e.g., ReAct, MCP" @blur="update" />
          </FormField>
          <FormField id="agent-tools" label="Tools" help-text="MCP tools, custom tools (one per line)">
            <textarea id="agent-tools" v-model="agentToolsText" rows="2" class="form-input" placeholder="e.g., file_search, browser" @blur="updateAgentTools" />
          </FormField>
          <FormField id="agent-orchestration" label="Orchestration">
            <input id="agent-orchestration" v-model="localData.llmApproach.agenticDetails.orchestration" type="text" class="form-input" placeholder="e.g., LangGraph" @blur="update" />
          </FormField>
        </div>
      </div>
    </div>

    <!-- Card 3: Baseline Capability Assessment -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.baselineCapability"
        @click="cardExpanded.baselineCapability = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Baseline Capability Assessment</h3>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span v-if="baselinePerformanceLabel" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {{ baselinePerformanceLabel }}
              </span>
              <span v-if="localData.baselineCapability?.successRate !== undefined && localData.baselineCapability?.successRate !== null" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ localData.baselineCapability.successRate }}% success rate
              </span>
            </div>
            <div v-if="baselineLimitationsPreview" class="text-xs text-gray-500 mt-2">
              {{ baselineLimitationsPreview }}
            </div>
            <div v-if="!baselinePerformanceLabel && localData.baselineCapability?.successRate === undefined" class="text-xs text-gray-400 italic">
              No baseline assessment added yet
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
          <h3 class="text-sm font-semibold text-gray-900">Baseline Capability Assessment</h3>
          <button
            @click="cardExpanded.baselineCapability = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Baseline Capability Assessment"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Assess how well the naive model performs the task without any custom agentic system. This helps determine the headroom for improvement.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="baseline-task-performance"
            label="Task Performance (Naive Model)"
            help-text="How well does the naive model perform the task without custom system? This measures baseline capability before adding agentic features."
            tooltip="Assess how well the base model performs without any custom agentic system: <strong>Excellent</strong> - Handles task very well; <strong>Good</strong> - Handles adequately; <strong>Moderate</strong> - Works with limitations; <strong>Poor</strong> - Struggles significantly; <strong>Fails</strong> - Cannot perform. This baseline helps measure improvement from adding agentic capabilities."
          >
            <select
              id="baseline-task-performance"
              v-model="localData.baselineCapability.taskPerformance"
              class="form-input"
              @change="update"
            >
              <option :value="undefined">Select performance level</option>
              <option value="excellent">Excellent - Model handles task very well</option>
              <option value="good">Good - Model handles task adequately</option>
              <option value="moderate">Moderate - Model handles task with limitations</option>
              <option value="poor">Poor - Model struggles with the task</option>
              <option value="fails">Fails - Model cannot perform the task</option>
            </select>
          </FormField>

          <FormField
            id="baseline-success-rate"
            label="Success Rate (%)"
            help-text="Estimated success rate of naive model without custom system (0-100%)"
            tooltip="Enter the estimated success rate (0-100%) of the naive model without custom system. This quantifies baseline performance. Example: If the model correctly handles 75% of cases without customization, enter 75. This helps quantify the improvement potential."
          >
            <input
              id="baseline-success-rate"
              v-model.number="localData.baselineCapability.successRate"
              type="number"
              min="0"
              max="100"
              class="form-input"
              placeholder="e.g., 75"
              @blur="update"
            />
          </FormField>
        </div>

        <FormField
          id="baseline-limitations"
          label="Key Limitations"
          help-text="Describe the main limitations of the naive model that prevent it from performing the task well"
          tooltip="Describe the main limitations that prevent the naive model from performing well. Examples: 'Cannot handle custom domain terminology', 'Fails on edge cases', 'Lacks context awareness', 'Cannot access external data sources', 'No multi-step reasoning capability'. These limitations justify why agentic capabilities are needed."
        >
          <textarea
            id="baseline-limitations"
            v-model="localData.baselineCapability.limitations"
            rows="3"
            class="form-input"
            placeholder="e.g., Cannot handle custom domain terminology, fails on edge cases, lacks context awareness"
            @blur="update"
          />
        </FormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="requires-custom-instructions"
            label="Requires Custom Instructions"
            help-text="Whether the task requires extensive custom instructions or prompts to work"
            tooltip="Check if the task requires extensive custom instructions or prompts to work properly. If the naive model needs detailed, task-specific instructions to perform adequately, check this. This indicates that the task is not straightforward for the base model."
          >
            <label class="form-checkbox-field">
              <input
                id="requires-custom-instructions"
                v-model="localData.baselineCapability.requiresCustomInstructions"
                type="checkbox"
                class="form-checkbox-small"
                @change="update"
              />
              <span>Task requires extensive custom instructions</span>
            </label>
          </FormField>

          <FormField
            id="custom-instructions-complexity"
            label="Custom Instructions Complexity"
            help-text="If custom instructions are required, how complex are they?"
            tooltip="If custom instructions are required, assess their complexity: <strong>Low</strong> - Simple prompts suffice (e.g., 'Classify documents by type'); <strong>Medium</strong> - Structured prompts needed (e.g., multi-step instructions); <strong>High</strong> - Complex, multi-step instructions required (e.g., detailed workflows with conditional logic). Higher complexity suggests more benefit from agentic systems."
          >
            <select
              id="custom-instructions-complexity"
              v-model="localData.baselineCapability.customInstructionsComplexity"
              class="form-input"
              :disabled="!localData.baselineCapability.requiresCustomInstructions"
              @change="update"
            >
              <option :value="undefined">Select complexity</option>
              <option value="low">Low - Simple prompts suffice</option>
              <option value="medium">Medium - Structured prompts needed</option>
              <option value="high">High - Complex, multi-step instructions required</option>
            </select>
          </FormField>
        </div>
      </div>
    </div>

    <!-- Card 4: Expected Gains -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.expectedGains"
        @click="cardExpanded.expectedGains = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Expected Gains from Agentic System</h3>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span v-if="performanceImprovementLabel" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {{ performanceImprovementLabel }}
              </span>
              <span v-if="headroomLabel" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                {{ headroomLabel }}
              </span>
            </div>
            <div v-if="gainsJustificationPreview" class="text-xs text-gray-500 mt-2">
              {{ gainsJustificationPreview }}
            </div>
            <div v-if="!performanceImprovementLabel && !headroomLabel" class="text-xs text-gray-400 italic">
              No expected gains information added yet
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
          <h3 class="text-sm font-semibold text-gray-900">Expected Gains from Agentic System</h3>
          <button
            @click="cardExpanded.expectedGains = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Expected Gains"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Assess the expected improvement from implementing a custom agentic system compared to the baseline. High headroom indicates significant potential for improvement.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="performance-improvement"
            label="Expected Performance Improvement"
            help-text="How much improvement is expected from the agentic system compared to baseline?"
            tooltip="Assess expected improvement from adding agentic capabilities: <strong>Minimal</strong> - Small improvement (e.g., 5-10%); <strong>Moderate</strong> - Noticeable improvement (e.g., 20-30%); <strong>Significant</strong> - Major improvement (e.g., 50%+); <strong>Transformative</strong> - Game-changing (e.g., enables previously impossible tasks). This helps justify the investment in agentic capabilities."
          >
            <select
              id="performance-improvement"
              v-model="localData.expectedGains.performanceImprovement"
              class="form-input"
              @change="update"
            >
              <option :value="undefined">Select improvement level</option>
              <option value="minimal">Minimal - Small improvement expected</option>
              <option value="moderate">Moderate - Noticeable improvement expected</option>
              <option value="significant">Significant - Major improvement expected</option>
              <option value="transformative">Transformative - Game-changing improvement expected</option>
            </select>
          </FormField>

          <FormField
            id="headroom"
            label="Headroom for Improvement"
            help-text="The gap between baseline capability and potential. High headroom means there's much room for improvement."
            tooltip="Assess the gap between current baseline and potential: <strong>Low</strong> - Baseline is already good, limited room for improvement; <strong>Medium</strong> - Some room for improvement; <strong>High</strong> - Significant room for improvement. High headroom indicates the baseline is far from optimal, suggesting high potential value from agentic capabilities."
          >
            <select
              id="headroom"
              v-model="localData.expectedGains.headroom"
              class="form-input"
              @change="update"
            >
              <option :value="undefined">Select headroom level</option>
              <option value="low">Low - Baseline is already good, limited improvement possible</option>
              <option value="medium">Medium - Some room for improvement</option>
              <option value="high">High - Significant room for improvement</option>
            </select>
          </FormField>
        </div>

        <FormField
          id="gains-justification"
          label="Justification for Expected Gains"
          help-text="Explain why gains are expected and what enables them (e.g., tool use, autonomy, custom workflows, domain knowledge)"
          tooltip="Explain why you expect gains and what enables them. Examples: 'Tool use enables access to external data sources', 'Autonomy allows multi-step decision making', 'Custom workflows handle complex edge cases', 'Domain knowledge improves accuracy'. This justifies the expected improvement and helps others understand what makes the system agentic."
        >
          <textarea
            id="gains-justification"
            v-model="localData.expectedGains.justification"
            rows="3"
            class="form-input"
            placeholder="e.g., Adding tool use and autonomy will enable the model to handle complex multi-step workflows that it cannot do naively"
            @blur="update"
          />
        </FormField>
      </div>
    </div>

    <!-- Card 5: Implementation Requirements -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.implementationRequirements"
        @click="cardExpanded.implementationRequirements = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Implementation Requirements</h3>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span v-if="skillDifficultyLabel" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {{ skillDifficultyLabel }}
              </span>
              <span v-if="securityLevelLabel" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {{ securityLevelLabel }}
              </span>
              <span v-if="validationStatus" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ validationStatus }}
              </span>
            </div>
            <div v-if="!skillDifficultyLabel && !securityLevelLabel && !validationStatus" class="text-xs text-gray-400 italic">
              No implementation requirements added yet
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
          <h3 class="text-sm font-semibold text-gray-900">Implementation Difficulty & Requirements</h3>
          <button
            @click="cardExpanded.implementationRequirements = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Implementation Requirements"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Assess how difficult it is to add the necessary capabilities and what validation/monitoring is required.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="skill-addition-difficulty"
            label="Skill Addition Difficulty"
            help-text="How difficult is it to add the necessary skills (e.g., via AGENTS.md, tools, custom instructions)?"
            tooltip="Assess implementation difficulty: <strong>Very Easy</strong> - Simple configuration (e.g., AGENTS.md file); <strong>Easy</strong> - Straightforward implementation; <strong>Moderate</strong> - Requires some development; <strong>Difficult</strong> - Complex implementation; <strong>Very Difficult</strong> - Major development effort. Lower difficulty suggests faster implementation and lower risk."
          >
            <select
              id="skill-addition-difficulty"
              v-model="localData.implementationDifficulty.skillAdditionDifficulty"
              class="form-input"
              @change="update"
            >
              <option :value="undefined">Select difficulty</option>
              <option value="very-easy">Very Easy - Simple configuration (e.g., AGENTS.md)</option>
              <option value="easy">Easy - Straightforward implementation</option>
              <option value="moderate">Moderate - Requires some development</option>
              <option value="difficult">Difficult - Complex implementation needed</option>
              <option value="very-difficult">Very Difficult - Major development effort</option>
            </select>
          </FormField>

          <FormField
            id="security-level"
            label="Security Level"
            help-text="Security level of the task, which affects validation and monitoring requirements"
            tooltip="Assess security level: <strong>Low</strong> - Minimal security (e.g., internal tools); <strong>Medium</strong> - Standard security (e.g., business data); <strong>High</strong> - Enhanced security (e.g., sensitive data); <strong>Critical</strong> - Maximum security (e.g., financial, medical, compliance-critical). Higher security levels require more validation and monitoring."
          >
            <select
              id="security-level"
              v-model="localData.implementationDifficulty.securityLevel"
              class="form-input"
              @change="update"
            >
              <option :value="undefined">Select security level</option>
              <option value="low">Low - Minimal security requirements</option>
              <option value="medium">Medium - Standard security requirements</option>
              <option value="high">High - Enhanced security requirements</option>
              <option value="critical">Critical - Maximum security requirements</option>
            </select>
          </FormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="baseline-comparison-required"
            label="Baseline Comparison Required"
            help-text="Whether baseline comparison is necessary for validation"
            tooltip="Check if you need to compare automated results against baseline (manual) results for validation. This is typically required for high-stakes tasks or when measuring improvement. Baseline comparison helps validate that automation actually improves outcomes."
          >
            <label class="form-checkbox-field">
              <input
                id="baseline-comparison-required"
                v-model="localData.implementationDifficulty.baselineComparisonRequired"
                type="checkbox"
                class="form-checkbox-small"
                @change="update"
              />
              <span>Baseline comparison required for validation</span>
            </label>
          </FormField>

          <FormField
            id="validation-monitoring-required"
            label="Validation & Monitoring Required"
            help-text="Whether validation and monitoring are required (typically depends on security level)"
            tooltip="Check if ongoing validation and monitoring are required. This is typically needed for high-security tasks, compliance-critical applications, or when errors have significant impact. Validation ensures continued correctness; monitoring tracks performance over time."
          >
            <label class="form-checkbox-field">
              <input
                id="validation-monitoring-required"
                v-model="localData.implementationDifficulty.validationMonitoringRequired"
                type="checkbox"
                class="form-checkbox-small"
                @change="update"
              />
              <span>Validation and monitoring required</span>
            </label>
          </FormField>
        </div>
      </div>
    </div>

    <!-- Card 6: Agentic Architecture & Notes -->
    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!cardExpanded.agenticArchitecture"
        @click="cardExpanded.agenticArchitecture = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900">Agentic Architecture & Notes</h3>
            </div>
            <div class="space-y-2 text-sm text-gray-600">
              <div v-if="agenticExplanationPreview" class="flex items-start gap-1">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>{{ agenticExplanationPreview }}</span>
              </div>
              <div v-else class="text-xs text-gray-400 italic">
                Agentic explanation: Not specified
              </div>
              <div v-if="feasibilityNotesPreview" class="flex items-start gap-1">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{{ feasibilityNotesPreview }}</span>
              </div>
              <div v-else-if="!agenticExplanationPreview" class="text-xs text-gray-400 italic">
                Feasibility notes: No notes
              </div>
            </div>
            <div v-if="!agenticExplanationPreview && !feasibilityNotesPreview" class="text-xs text-gray-400 italic">
              No architecture or notes information added yet
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
          <h3 class="text-sm font-semibold text-gray-900">Agentic Architecture & Notes</h3>
          <button
            @click="cardExpanded.agenticArchitecture = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse Agentic Architecture & Notes"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Agentic Capabilities</h4>
          <FormField
            id="agentic-explanation"
            label="How Agentic Capabilities Are Added"
            help-text="Explain how agentic capabilities are added to the system. Note: LLMs are not inherently agentic - agentic behavior comes from how they are used, given autonomy, tool access, and structured workflows."
            tooltip="Explain how you add agentic capabilities. LLMs aren't inherently agentic - agentic behavior comes from: (1) <strong>Tool use</strong> - Access to APIs, databases, external tools; (2) <strong>Autonomy</strong> - Ability to make decisions and take actions; (3) <strong>Structured workflows</strong> - Multi-step processes with decision points; (4) <strong>Domain knowledge</strong> - Custom instructions, context, and knowledge bases. Describe your specific approach."
          >
            <textarea
              id="agentic-explanation"
              v-model="localData.agenticExplanation"
              rows="4"
              class="form-input"
              placeholder="e.g., Agentic capabilities are added through: (1) Tool use - giving the model access to APIs and external tools, (2) Autonomy - allowing the model to make decisions and take actions, (3) Structured workflows - defining multi-step processes, (4) Domain knowledge - providing custom instructions and context. The base LLM provides reasoning and language understanding, but the agentic behavior emerges from the system architecture."
              @blur="update"
            />
          </FormField>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Additional Notes</h4>
          <FormField
            id="feasibility-notes"
            label="Feasibility Notes"
            help-text="Additional notes on feasibility and technical considerations"
            tooltip="Add any additional notes about technical feasibility, challenges, dependencies, or considerations. This helps document technical context and risks. Examples: 'Requires API access to external system', 'Depends on model fine-tuning capabilities', 'May need custom tool development'."
          >
            <textarea
              id="feasibility-notes"
              v-model="localData.feasibilityNotes"
              rows="4"
              class="form-input"
              @blur="update"
            />
          </FormField>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import FormField from '../FormField.vue'
import CollapsibleListField from '../CollapsibleListField.vue'
import InfoTooltip from '../InfoTooltip.vue'
import type { DeveloperFeasibility } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateDeveloperFeasibility } = useCanvasData()

// Card expansion state - all cards start collapsed
const cardExpanded = ref({
  technicalReadiness: false,
  technologyStack: false,
  llmApproach: false,
  baselineCapability: false,
  expectedGains: false,
  implementationRequirements: false,
  agenticArchitecture: false,
})

const requirements = computed(() => canvasData.value.userExpectations?.requirements || [])

// Initialize localData with proper array references
const initLocalData = (): DeveloperFeasibility => {
  const feasibility = canvasData.value.developerFeasibility
  return {
    appliesToRequirements: feasibility?.appliesToRequirements,
    trlLevel: feasibility?.trlLevel || {},
    technicalRisk: feasibility?.technicalRisk,
    effortEstimate: feasibility?.effortEstimate,
    feasibilityNotes: feasibility?.feasibilityNotes,
    modelSelection: feasibility?.modelSelection,
    modelName: feasibility?.modelName,
    baselineCapability: feasibility?.baselineCapability || {},
    expectedGains: feasibility?.expectedGains || {},
    implementationDifficulty: feasibility?.implementationDifficulty || {},
    agenticExplanation: feasibility?.agenticExplanation,
    llmApproach: feasibility?.llmApproach || {},
  }
}

const localData = ref<DeveloperFeasibility>(initLocalData())

// Ensure nested objects always exist for v-model binding
if (!localData.value.baselineCapability) {
  localData.value.baselineCapability = {}
}
if (!localData.value.expectedGains) {
  localData.value.expectedGains = {}
}
if (!localData.value.implementationDifficulty) {
  localData.value.implementationDifficulty = {}
}
if (!localData.value.llmApproach) {
  localData.value.llmApproach = {}
}
if (!localData.value.llmApproach.ragDetails) {
  localData.value.llmApproach.ragDetails = {}
}
if (!localData.value.llmApproach.agenticDetails) {
  localData.value.llmApproach.agenticDetails = {}
}

const requirementsNotInAppliesTo = computed(() => {
  const applies = localData.value.appliesToRequirements || []
  return requirements.value.filter((r) => !applies.includes(r.id))
})

function getRequirementTitle(id: string): string {
  const req = requirements.value.find((r) => r.id === id)
  return req?.title || req?.description || id
}

function addAppliesToRequirement(id: string) {
  if (!id) return
  const applies = [...(localData.value.appliesToRequirements || [])]
  if (applies.includes(id)) return
  localData.value.appliesToRequirements = [...applies, id]
  update()
}

function removeAppliesToRequirement(id: string) {
  const applies = (localData.value.appliesToRequirements || []).filter((r) => r !== id)
  localData.value.appliesToRequirements = applies.length > 0 ? applies : undefined
  update()
}

// Convert algorithms/tools arrays to objects for MultiValueInput
const initAlgorithms = () => {
  const algorithms = canvasData.value.developerFeasibility?.algorithms || []
  return algorithms.map((a: string) => ({ value: a }))
}

const initTools = () => {
  const tools = canvasData.value.developerFeasibility?.tools || []
  return tools.map((t: string) => ({ value: t }))
}

const localAlgorithms = ref<Array<{ value: string }>>(initAlgorithms())
const localTools = ref<Array<{ value: string }>>(initTools())

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

// TRL Summary
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

// Risk Badge
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

// Model Summary
const modelSummary = computed(() => {
  const type = localData.value.modelSelection
  const name = localData.value.modelName
  if (type && name) {
    const typeLabel = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return `${typeLabel}: ${name}`
  } else if (type) {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  } else if (name) {
    return name
  }
  return null
})

// LLM Architecture Label
const llmArchitectureLabel = computed(() => {
  const arch = localData.value.llmApproach?.architecture
  if (!arch) return null
  const labels: Record<string, string> = {
    'simple-prompting': 'Simple prompting',
    rag: 'RAG',
    'fine-tuning': 'Fine-tuning',
    agents: 'Agents (ReAct, MCP)',
    other: 'Other',
  }
  return labels[arch] || arch
})

// Agent tools as newline-separated text (for textarea) - ref synced from localData
const agentToolsText = ref('')
function syncAgentToolsFromData() {
  agentToolsText.value = (localData.value.llmApproach?.agenticDetails?.tools ?? []).join('\n')
}
function updateAgentTools() {
  if (!localData.value.llmApproach) localData.value.llmApproach = {}
  if (!localData.value.llmApproach.agenticDetails) localData.value.llmApproach.agenticDetails = {}
  localData.value.llmApproach.agenticDetails.tools = agentToolsText.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  update()
}

// Sync agentToolsText when localData.llmApproach changes (init + watch from canvas)
watch(() => localData.value.llmApproach?.agenticDetails?.tools, () => syncAgentToolsFromData(), { immediate: true })

// Baseline Performance Label
const baselinePerformanceLabel = computed(() => {
  const perf = localData.value.baselineCapability?.taskPerformance
  if (!perf) return null
  const labels: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Good',
    moderate: 'Moderate',
    poor: 'Poor',
    fails: 'Fails',
  }
  return labels[perf] || perf
})

// Baseline Limitations Preview
const baselineLimitationsPreview = computed(() => {
  const limitations = localData.value.baselineCapability?.limitations
  if (!limitations) return null
  if (limitations.length <= 100) return limitations
  return limitations.substring(0, 100) + '...'
})

// Performance Improvement Label
const performanceImprovementLabel = computed(() => {
  const improvement = localData.value.expectedGains?.performanceImprovement
  if (!improvement) return null
  const labels: Record<string, string> = {
    minimal: 'Minimal improvement',
    moderate: 'Moderate improvement',
    significant: 'Significant improvement',
    transformative: 'Transformative improvement',
  }
  return labels[improvement] || improvement
})

// Headroom Label
const headroomLabel = computed(() => {
  const headroom = localData.value.expectedGains?.headroom
  if (!headroom) return null
  const labels: Record<string, string> = {
    low: 'Low headroom',
    medium: 'Medium headroom',
    high: 'High headroom',
  }
  return labels[headroom] || headroom
})

// Gains Justification Preview
const gainsJustificationPreview = computed(() => {
  const justification = localData.value.expectedGains?.justification
  if (!justification) return null
  if (justification.length <= 100) return justification
  return justification.substring(0, 100) + '...'
})

// Skill Difficulty Label
const skillDifficultyLabel = computed(() => {
  const difficulty = localData.value.implementationDifficulty?.skillAdditionDifficulty
  if (!difficulty) return null
  const labels: Record<string, string> = {
    'very-easy': 'Very Easy',
    'easy': 'Easy',
    'moderate': 'Moderate',
    'difficult': 'Difficult',
    'very-difficult': 'Very Difficult',
  }
  return labels[difficulty] || difficulty
})

// Security Level Label
const securityLevelLabel = computed(() => {
  const security = localData.value.implementationDifficulty?.securityLevel
  if (!security) return null
  return security.charAt(0).toUpperCase() + security.slice(1)
})

// Validation Status
const validationStatus = computed(() => {
  const baseline = localData.value.implementationDifficulty?.baselineComparisonRequired
  const validation = localData.value.implementationDifficulty?.validationMonitoringRequired
  const parts: string[] = []
  if (baseline) parts.push('Baseline comparison')
  if (validation) parts.push('Validation & monitoring')
  if (parts.length === 0) return null
  return parts.join(', ')
})

// Agentic Explanation Preview
const agenticExplanationPreview = computed(() => {
  const explanation = localData.value.agenticExplanation
  if (!explanation) return null
  if (explanation.length <= 150) return explanation
  return explanation.substring(0, 150) + '...'
})

// Feasibility Notes Preview
const feasibilityNotesPreview = computed(() => {
  const notes = localData.value.feasibilityNotes
  if (!notes) return null
  if (notes.length <= 150) return notes
  return notes.substring(0, 150) + '...'
})

let isLocalUpdate = false
let isSyncingFromCanvas = false

watch(
  () => canvasData.value.developerFeasibility,
  (newFeasibility) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      if (newFeasibility && Object.keys(newFeasibility).length > 0) {
        // Create new object with proper array references
        localData.value = {
          appliesToRequirements: newFeasibility.appliesToRequirements,
          trlLevel: newFeasibility.trlLevel || {},
          technicalRisk: newFeasibility.technicalRisk,
          effortEstimate: newFeasibility.effortEstimate,
          feasibilityNotes: newFeasibility.feasibilityNotes,
          modelSelection: newFeasibility.modelSelection,
          modelName: newFeasibility.modelName,
          baselineCapability: newFeasibility.baselineCapability || {},
          expectedGains: newFeasibility.expectedGains || {},
          implementationDifficulty: newFeasibility.implementationDifficulty || {},
          agenticExplanation: newFeasibility.agenticExplanation,
          llmApproach: newFeasibility.llmApproach || {},
        }
        // Ensure nested objects always exist
        if (!localData.value.baselineCapability) {
          localData.value.baselineCapability = {}
        }
        if (!localData.value.expectedGains) {
          localData.value.expectedGains = {}
        }
        if (!localData.value.implementationDifficulty) {
          localData.value.implementationDifficulty = {}
        }
        if (!localData.value.llmApproach) {
          localData.value.llmApproach = {}
        }
        if (!localData.value.llmApproach.ragDetails) {
          localData.value.llmApproach.ragDetails = {}
        }
        if (!localData.value.llmApproach.agenticDetails) {
          localData.value.llmApproach.agenticDetails = {}
        }
        syncAgentToolsFromData()
        // Sync algorithms and tools arrays
        localAlgorithms.value = (newFeasibility.algorithms || []).map((a: string) => ({ value: a }))
        localTools.value = (newFeasibility.tools || []).map((t: string) => ({ value: t }))
      } else {
        // Reset to empty state when cleared
        localData.value = { 
          trlLevel: {},
          baselineCapability: {},
          expectedGains: {},
          implementationDifficulty: {},
          llmApproach: {},
        }
        localAlgorithms.value = []
        localTools.value = []
      }
      // Reset flag after syncing
      nextTick(() => {
        isSyncingFromCanvas = false
      })
    }
  },
  { deep: true, immediate: false }
)

const update = async () => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateDeveloperFeasibility(localData.value)
  await nextTick()
  isLocalUpdate = false
}

// Watch for local changes to algorithms and tools
watch(localAlgorithms, async (newAlgorithms) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateDeveloperFeasibility({
    ...localData.value,
    algorithms: newAlgorithms.map((a) => a.value).filter((v) => v.trim()),
    tools: localTools.value.map((t) => t.value).filter((v) => v.trim()),
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

watch(localTools, async (newTools) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateDeveloperFeasibility({
    ...localData.value,
    algorithms: localAlgorithms.value.map((a) => a.value).filter((v) => v.trim()),
    tools: newTools.map((t) => t.value).filter((v) => v.trim()),
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })
</script>
