/**
 * Bot assistant composable
 * MVP: Lightweight placeholder with contextual help (no API calls)
 * Future: Full AI integration with configurable API endpoint
 */

import { ref } from 'vue'

export interface BotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface BotConfig {
  apiEndpoint?: string
  apiKey?: string
  provider?: 'ollama' | 'openai' | 'anthropic' | 'custom'
}

const messages = ref<BotMessage[]>([])
const isOpen = ref(false)
const isLoading = ref(false)
const config = ref<BotConfig>({
  provider: 'ollama',
  apiEndpoint: 'http://localhost:11434/api/chat',
})

// Contextual help text based on section/field
const contextualHelp: Record<string, Record<string, string>> = {
  project: {
    title: 'The project title should be clear and descriptive. It will be used in the generated RO-Crate metadata.',
    description: 'Provide a comprehensive description of your agentic automation project, including its main objectives and scope.',
    objective: 'Describe the specific goals and expected outcomes of the project.',
    startDate: 'The project start date helps establish a timeline for governance stages.',
    domain: 'Specify the research domain(s) or field(s) of application (e.g., Biomedical, Computer Science).',
    keywords: 'Add relevant keywords or tags to improve discoverability of your project metadata.',
  },
  'user-expectations': {
    requirements: 'Capture user requirements as PROV-O Plan elements. Each requirement can include a user story in the format: "As a [user], I want [feature] so that [benefit]".',
    stakeholders: 'Identify key stakeholders and their values. This supports Value Sensitive Design principles.',
  },
  'developer-feasibility': {
    trlLevel: 'Technology Readiness Level (TRL) ranges from 1 (basic principles) to 9 (proven in operational environment).',
    technicalRisk: 'Assess the overall technical risk: Low (minimal impact), Medium (moderate challenges), High (significant challenges), Critical (severe impact).',
    algorithms: 'List the algorithms, models, or technologies to be used. Consider using standard ontology terms (e.g., EDAM for bioinformatics).',
  },
  governance: {
    stages: 'Define governance stages as PROV-O Activities. Each stage can have associated agents (persons, organizations, or software), milestones, and compliance standards.',
    agents: 'Agents can be persons, organizations, or software systems responsible for a stage.',
    complianceStandards: 'Specify regulatory or compliance standards (e.g., GDPR, HIPAA, GxP for biomedical projects).',
  },
  'data-access': {
    datasets: 'Describe datasets using DCAT vocabulary. Include format, license, access rights, and DUO terms for data use restrictions.',
    duoTerms: 'DUO (Data Use Ontology) terms specify machine-readable data use permissions. Common terms include: DUO:0000006 (Health/Medical/Biomedical Research Only), DUO:0000012 (No Commercial Use).',
    accessRights: 'Access rights classification: Open (publicly accessible), Restricted (requires approval), Confidential (limited access), Highly Restricted (very limited access).',
  },
  outcomes: {
    deliverables: 'Document project deliverables using FRAPO deliverable class. Include type, description, date, and PID if available.',
    publications: 'List publications using schema.org ScholarlyArticle type. Include DOI, authors, and publication date.',
    evaluations: 'Record evaluation results with metrics and outcomes. These link to governance stages via PROV-O wasGeneratedBy.',
  },
}

export function useBotAssistant() {
  const sendMessage = async (content: string, context?: { section?: string; field?: string }) => {
    const userMessage: BotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    messages.value.push(userMessage)

    // MVP: Return contextual help based on current section/field
    // Future: Make API call to LLM
    isLoading.value = true

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let response = ''

    if (context?.section && context?.field && contextualHelp[context.section]?.[context.field]) {
      response = contextualHelp[context.section][context.field]
    } else if (context?.section && contextualHelp[context.section]) {
      const sectionHelp = Object.values(contextualHelp[context.section]).join('\n\n')
      response = `Here's some guidance for the ${context.section} section:\n\n${sectionHelp}`
    } else {
      response = 'I can help you fill out the Agentic Automation Canvas. What would you like to know? You can ask about specific fields or sections, or request guidance on standards compliance.'
    }

    const assistantMessage: BotMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }

    messages.value.push(assistantMessage)
    isLoading.value = false
  }

  const clearMessages = () => {
    messages.value = []
  }

  const updateConfig = (newConfig: Partial<BotConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    messages,
    isOpen,
    isLoading,
    config,
    sendMessage,
    clearMessages,
    updateConfig,
  }
}
