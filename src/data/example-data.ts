/**
 * Example dataset for Agentic Automation Canvas
 * Generic, understandable example that demonstrates all features
 */

import type { CanvasData } from '@/types/canvas'
import type { BenefitDisplayState } from '@/types/benefitDisplay'

export const exampleData: CanvasData = {
  // Centralized Person management
  persons: [
    {
      id: 'person-0',
      name: 'Sarah Johnson',
      affiliation: 'Operations Department',
      functionRoles: ['end-user', 'project-manager'],
    },
    {
      id: 'person-1',
      name: 'Michael Chen',
      orcid: 'https://orcid.org/0000-0000-0000-0001',
      affiliation: 'IT Department',
      functionRoles: ['technical-lead', 'developer'],
    },
    {
      id: 'person-2',
      name: 'Emma Rodriguez',
      affiliation: 'Compliance Department',
      functionRoles: ['compliance-officer', 'data-manager'],
    },
  ],
  project: {
    title: 'Automated Document Processing System',
    description: 'A system that automatically processes, categorizes, and routes incoming documents to reduce manual handling time and improve accuracy. The system uses AI to extract key information, classify document types, and route them to appropriate team members.',
    objective: 'Reduce document processing time by 60% and eliminate manual data entry errors',
    projectStage: 'Development',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    domain: ['Business Process Automation', 'Document Management'],
    keywords: ['automation', 'document processing', 'AI', 'workflow'],
    projectId: 'https://example.org/projects/doc-processing-2024',
    headlineValue: 'Saves time through automated document processing',
    primaryValueDriver: 'time',
    roughEstimateValue: 40,
    roughEstimateUnit: 'hours/month',
    version: '1.2.8',
    versionDate: '2024-06-15',
  },
  version: '1.2.8',
  versionDate: '2024-06-15',
  userExpectations: {
    requirements: [
      {
        id: 'req-1',
        title: 'Extract key information from documents',
        description: `Automatically extract structured information (names, dates, amounts, categories) from diverse incoming documents (invoices, forms, reports) using agentic AI systems. This task demonstrates a complex, high-value automation opportunity where LLMs excel at handling format variability.

**Rationale**: Document extraction is a prime candidate for agentic automation because it requires:
- Handling diverse document formats and layouts
- Understanding context to extract relevant fields
- Validating extracted data against schemas
- Adapting to edge cases through reasoning

**Best Practices Demonstrated**:
- Using per-unit aggregation for time benefits (8 min → 2 min per document)
- Tracking multiple benefit types: time savings, quality improvements (error rate reduction), and risk mitigation (compliance incidents)
- Setting realistic oversight expectations (1 min/unit for human review of extracted data)
- High user confidence but medium developer confidence reflects uncertainty in production performance

**References**: For agentic document processing approaches, see frameworks like ReAct (Yao et al., 2022) and MCP (Model Context Protocol) for tool-augmented extraction.`,
        userStory: 'As a data entry clerk, I want documents to be automatically processed so that I can focus on exception handling instead of routine data entry',
        priority: 'high',
        status: 'in-progress',
        unitOfWork: 'one document',
        unitCategory: 'item',
        volumePerMonth: 500,
        stakeholders: ['person-0'],
        feasibility: {
          technicalRisk: 'high',
          effortEstimate: { value: 9, unit: 'weeks' },
          feasibilityNotes: 'Extraction requires extensive agentic capabilities to handle diverse document formats and extract structured information. Needs robust error handling and validation.',
          modelSelection: 'frontier-model',
          modelName: 'gpt-4o',
          modelCardUri: 'https://platform.openai.com/docs/models/gpt-4o',
          technologyApproach: {
            architecture: 'agents',
            agenticDetails: {
              framework: ['ReAct', 'MCP'],
              tools: ['document_parser', 'schema_validator', 'external_api', 'database_query'],
              orchestration: ['LangGraph'],
            },
          },
          algorithms: ['OCR (Optical Character Recognition)', 'Natural Language Processing', 'Named Entity Recognition'],
          tools: ['Python', 'LangChain', 'OpenAI API', 'Document Processing API'],
        },
        benefits: [
          {
            benefitType: 'time',
            metricId: 'processingTime',
            metricLabel: 'Processing time',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perUnit',
            benefitUnit: 'minutes',
            baseline: { type: 'numeric', value: 8 },
            expected: { type: 'numeric', value: 2 },
            oversightMinutesPerUnit: 1,
            confidenceUser: 'high',
            confidenceDev: 'medium',
            assumptions: 'Documents are mostly standardized formats (80% invoices, 15% forms, 5% custom). Complex documents may require more oversight. Extraction accuracy validated through spot-checking 10% of documents. Human oversight focuses on verifying extracted amounts and dates for financial accuracy.',
          },
          {
            benefitType: 'quality',
            metricId: 'errorRate',
            metricLabel: 'Error Rate',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perUnit',
            benefitUnit: '%',
            baseline: { type: 'numeric', value: 5 },
            expected: { type: 'numeric', value: 1 },
            confidenceUser: 'high',
            confidenceDev: 'medium',
            assumptions: 'Assumes validation pipeline catches 95% of errors through schema validation and range checks. Remaining 5% errors are primarily edge cases (handwritten text, unusual formats) that require human review.',
          },
          {
            benefitType: 'risk',
            metricId: 'complianceIncidents',
            metricLabel: 'Compliance Incidents',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perMonth',
            benefitUnit: 'incidents/month',
            baseline: { type: 'numeric', value: 3 },
            expected: { type: 'numeric', value: 0.5 },
            confidenceUser: 'medium',
            confidenceDev: 'medium',
            assumptions: 'Automated processing ensures consistent handling per policy, reducing human error in compliance-sensitive documents. Baseline of 3 incidents/month reflects occasional policy misinterpretation by staff. Expected 0.5 incidents/month accounts for system errors requiring escalation.',
          },
        ],
      },
      {
        id: 'req-2',
        title: 'Categorize documents by type',
        description: `Automatically categorize documents into predefined types (invoice, contract, report, etc.) based on structured data extracted in the previous step. This task demonstrates a deterministic automation that doesn't require LLMs.

**Rationale**: This is a deterministic task because:
- Input is structured (from req-1 extraction output)
- Categories are well-defined and finite
- Classification rules can be expressed as logical conditions
- No ambiguity or reasoning required

**Best Practices Demonstrated**:
- Showing that not all automation requires LLMs (modelSelection: 'none')
- Demonstrating task dependencies (dependsOn: ['req-1'])
- Using deterministic approaches when possible reduces cost and complexity
- Zero oversight needed for deterministic tasks (oversightMinutesPerUnit: 0)
- Including cost benefits from eliminating external contractor

**Design Pattern**: This follows the "extract-then-classify" pattern where an upstream agentic task (extraction) produces structured output that enables downstream deterministic processing.`,
        userStory: 'As a team lead, I want documents automatically categorized so that routing decisions are consistent and faster',
        priority: 'high',
        status: 'planned',
        unitOfWork: 'one document',
        unitCategory: 'item',
        volumePerMonth: 500,
        dependsOn: ['req-1'],
        stakeholders: ['person-1', 'person-2'],
        feasibility: {
          technicalRisk: 'low',
          effortEstimate: { value: 80, unit: 'person-hours' },
          feasibilityNotes: 'Deterministic task based on structured schema output from extraction. Uses rule-based classification matching extracted fields to predefined document type patterns. No LLM required.',
          modelSelection: 'none',
          technologyApproach: {
            architecture: 'none',
          },
          algorithms: ['Rule-based classification', 'Pattern matching'],
          tools: ['Python', 'JSON Schema validator'],
        },
        benefits: [
          {
            benefitType: 'time',
            metricId: 'processingTime',
            metricLabel: 'Processing time',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perUnit',
            benefitUnit: 'minutes',
            baseline: { type: 'numeric', value: 3 },
            expected: { type: 'numeric', value: 1 },
            oversightMinutesPerUnit: 0,
            confidenceUser: 'medium',
            confidenceDev: 'medium',
            assumptions: 'Document types are well-defined (invoice, contract, report, form, other) and distinguishable via extracted fields (document_type, amount, parties, date_range). Classification rules: invoices have amount > 0 and vendor field; contracts have parties array with length >= 2; reports have report_date and no amount.',
          },
          {
            benefitType: 'quality',
            metricId: 'reworkRate',
            metricLabel: 'Rework Rate',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perUnit',
            benefitUnit: '%',
            baseline: { type: 'numeric', value: 8 },
            expected: { type: 'numeric', value: 2 },
            confidenceUser: 'medium',
            confidenceDev: 'medium',
          },
          {
            benefitType: 'cost',
            metricId: 'operationalCost',
            metricLabel: 'Operational cost',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perMonth',
            benefitUnit: 'USD',
            baseline: { type: 'numeric', value: 2500 },
            expected: { type: 'numeric', value: 0 },
            confidenceUser: 'high',
            confidenceDev: 'high',
            assumptions: 'Previously done by external contractor at a flat monthly fee of $2,500. With automation, no external contractor needed. This represents a direct cost savings that is independent of volume, hence perMonth aggregation.',
          },
        ],
      },
      {
        id: 'req-3',
        title: 'Route documents to team members',
        description: `Automatically route categorized documents to the appropriate team member based on document type, content, and team member expertise/workload. This task demonstrates lightweight agentic automation that leverages existing infrastructure.

**Rationale**: While this could be deterministic, using an agentic approach provides:
- Flexibility to handle routing exceptions
- Ability to consider team member workload and availability
- Natural language reasoning for edge cases
- Integration with team directory and scheduling systems

**Best Practices Demonstrated**:
- Reusing existing model infrastructure (gpt-4o already in pipeline) even when not strictly necessary
- Minimal oversight (0.3 min/unit) for periodic quality checks rather than per-document review
- Enablement benefit showing new capability (automated routing) vs. just time savings
- Lower technical risk due to simpler decision-making compared to extraction

**Architecture Note**: Uses MCP (Model Context Protocol) to access routing rules and team directory, enabling the agent to make informed routing decisions without extensive prompt engineering.`,
        userStory: 'As a manager, I want documents automatically routed to the right person so that processing time is minimized',
        priority: 'medium',
        status: 'planned',
        unitOfWork: 'one routing decision',
        unitCategory: 'item',
        volumePerMonth: 500,
        dependsOn: ['req-2'],
        stakeholders: ['person-0', 'person-1', 'person-2'],
        feasibility: {
          technicalRisk: 'low',
          effortEstimate: { value: 3.5, unit: 'weeks' },
          feasibilityNotes: 'Simple agentic routing based on document category and extracted metadata. Uses lightweight agent framework for decision-making. A smaller model like GLM-5 is sufficient for this classification task.',
          modelSelection: 'frontier-model',
          modelName: 'GLM-5',
          modelCardUri: 'https://huggingface.co/zai-org/GLM-5',
          technologyApproach: {
            architecture: 'agents',
            agenticDetails: {
              framework: ['MCP'],
              tools: ['routing_rules', 'team_directory'],
            },
          },
          algorithms: ['Decision tree', 'Rule-based routing'],
          tools: ['Python', 'MCP framework', 'OpenAI API'],
        },
        benefits: [
          {
            benefitType: 'time',
            metricId: 'processingTime',
            metricLabel: 'Processing time',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perUnit',
            benefitUnit: 'minutes',
            baseline: { type: 'numeric', value: 2 },
            expected: { type: 'numeric', value: 0.5 },
            oversightMinutesPerUnit: 0.3,
            confidenceUser: 'high',
            confidenceDev: 'high',
            assumptions: 'Routing rules are clear and can be automated: invoices → accounting team, contracts → legal team, reports → analytics team. Edge cases (ambiguous documents) default to team lead for manual assignment. Oversight of 0.3 min/unit represents monthly review of routing accuracy (500 docs × 0.3 min = 150 min/month = 2.5 hours/month for quality assurance).',
          },
          {
            benefitType: 'enablement',
            metricId: 'newCapability',
            metricLabel: 'New Capability',
            direction: 'boolIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'oneOff',
            benefitUnit: 'capability',
            baseline: { type: 'binary', bool: false },
            expected: { type: 'binary', bool: true },
            confidenceUser: 'high',
            confidenceDev: 'high',
            assumptions: 'Enables automated routing that was not possible before',
          },
        ],
      },
      {
        id: 'req-4',
        title: 'Automated security and compliance validation',
        description: `Automatically validate documents for security risks and compliance violations before processing. This safety feature scans documents for sensitive data exposure, policy violations, and potential security threats.

**Rationale**: This is a critical safety feature that:
- Prevents processing of documents containing sensitive information that shouldn't be handled
- Detects potential security threats (malicious content, data exfiltration attempts)
- Ensures compliance with data protection regulations before processing
- Reduces organizational risk even if it doesn't save time

**Best Practices Demonstrated**:
- Risk reduction as primary value driver (no time savings)
- Safety features may add processing time but reduce organizational risk
- Quality benefits from catching issues early
- Essential for production deployment of document processing systems

**Design Pattern**: This follows the "safety-first" pattern where validation gates are placed before processing to prevent downstream issues.`,
        userStory: 'As a compliance officer, I want documents automatically validated for security and compliance risks so that we prevent processing of problematic documents',
        priority: 'high',
        status: 'planned',
        unitOfWork: 'one document validation',
        unitCategory: 'item',
        volumePerMonth: 500,
        dependsOn: ['req-1'],
        stakeholders: ['person-2'],
        feasibility: {
          technicalRisk: 'low',
          effortEstimate: { value: 4, unit: 'weeks' },
          feasibilityNotes: 'Rule-based validation combined with pattern matching for known security and compliance issues. Can leverage existing compliance rule sets. May add slight processing overhead but critical for production safety.',
          modelSelection: 'none',
          technologyApproach: {
            architecture: 'none',
          },
          algorithms: ['Pattern matching', 'Rule-based validation', 'Keyword detection'],
          tools: ['Python', 'Regular expressions', 'Compliance rule engine'],
        },
        benefits: [
          {
            benefitType: 'risk',
            metricId: 'securityIncidents',
            metricLabel: 'Security Incidents',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perMonth',
            benefitUnit: 'incidents/month',
            baseline: { type: 'numeric', value: 2 },
            expected: { type: 'numeric', value: 0.2 },
            confidenceUser: 'high',
            confidenceDev: 'high',
            assumptions: 'Automated validation catches documents with exposed credentials, PII in wrong contexts, or suspicious patterns before they enter the processing pipeline. Baseline of 2 incidents/month reflects occasional manual oversight failures. Expected 0.2 incidents/month accounts for novel attack patterns that bypass initial validation.',
          },
          {
            benefitType: 'risk',
            metricId: 'complianceViolations',
            metricLabel: 'Compliance Violations',
            direction: 'decreaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perMonth',
            benefitUnit: 'violations/month',
            baseline: { type: 'numeric', value: 1.5 },
            expected: { type: 'numeric', value: 0.1 },
            confidenceUser: 'high',
            confidenceDev: 'high',
            assumptions: 'Automated checks ensure documents meet GDPR, data retention, and access control requirements before processing. Baseline reflects occasional manual errors in compliance checks. Expected reduction to 0.1 violations/month through automated policy enforcement.',
          },
          {
            benefitType: 'quality',
            metricId: 'earlyDetectionRate',
            metricLabel: 'Early Issue Detection',
            direction: 'increaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perUnit',
            benefitUnit: '%',
            baseline: { type: 'numeric', value: 60 },
            expected: { type: 'numeric', value: 95 },
            confidenceUser: 'high',
            confidenceDev: 'high',
            assumptions: 'Automated validation catches issues before they propagate through the system. Baseline of 60% reflects manual review catching most issues but missing some. Expected 95% detection rate through comprehensive automated checks.',
          },
        ],
      },
    ],
  },
  developerFeasibility: {
    trlLevel: {
      current: 4,
      target: 7,
    },
    technicalRisk: 'medium',
    effortEstimate: { value: 20, unit: 'weeks' },
    feasibilityNotes: 'Core technologies are mature. Main challenge is handling edge cases and ensuring accuracy for diverse document formats. Different tasks require different approaches - extraction needs extensive agentic capabilities, while categorization can be deterministic.',
  },
  governance: {
    stages: [
      {
        id: 'stage-1',
        name: 'Design',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        agents: [
          {
            personId: 'person-1', // References Michael Chen from persons array
            role: 'Technical Lead',
            type: 'person',
            roleContext: 'Design phase technical oversight',
          },
          {
            personId: 'person-0', // References Sarah Johnson from persons array
            role: 'Business Analyst',
            type: 'person',
            roleContext: 'Design phase requirements gathering',
          },
          {
            personId: 'person-2', // References Emma Rodriguez from persons array
            role: 'Compliance Officer',
            type: 'person',
            roleContext: 'Design phase compliance review',
          },
        ],
        milestones: [
          {
            description: 'Complete system architecture design',
            kpi: 'Architecture document approved',
          },
          {
            description: 'Define document processing requirements',
            kpi: 'Requirements document signed off',
          },
        ],
        complianceStandards: ['GDPR', 'Data Protection'],
      },
      {
        id: 'stage-2',
        name: 'Development',
        startDate: '2024-02-16',
        endDate: '2024-05-15',
        agents: [
          {
            personId: 'person-1', // References Michael Chen from persons array
            role: 'Technical Lead',
            type: 'person',
            roleContext: 'Development phase technical leadership',
          },
          {
            name: 'Development Team',
            role: 'Developers',
            type: 'organization',
          },
        ],
        milestones: [
          {
            description: 'Core processing engine completed',
            kpi: '80% accuracy on test documents',
          },
          {
            description: 'Integration with existing systems',
            kpi: 'API endpoints functional',
          },
        ],
        complianceStandards: ['GDPR'],
      },
      {
        id: 'stage-3',
        name: 'Validation',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
        agents: [
          {
            personId: 'person-0', // References Sarah Johnson from persons array
            role: 'Quality Assurance',
            type: 'person',
            roleContext: 'Validation phase quality control',
          },
          {
            personId: 'person-2', // References Emma Rodriguez from persons array
            role: 'Compliance Officer',
            type: 'person',
            roleContext: 'Validation phase compliance verification',
          },
        ],
        milestones: [
          {
            description: 'User acceptance testing completed',
            kpi: '95% user satisfaction',
          },
        ],
        complianceStandards: ['GDPR', 'Data Protection'],
      },
      {
        id: 'stage-4',
        name: 'Deployment',
        startDate: '2024-06-16',
        endDate: '2024-06-30',
        agents: [
          {
            personId: 'person-1', // References Michael Chen from persons array
            role: 'Technical Lead',
            type: 'person',
            roleContext: 'Deployment phase technical oversight',
          },
        ],
        milestones: [
          {
            description: 'System deployed to production',
            kpi: 'Zero downtime deployment',
          },
        ],
        complianceStandards: ['GDPR'],
      },
    ],
  },
  dataAccess: {
    datasets: [
      {
        id: 'dataset-1',
        title: 'Incoming Documents Archive',
        description: 'Historical archive of processed documents used for training and validation',
        format: 'PDF',
        license: 'https://creativecommons.org/licenses/by/4.0/',
        accessRights: 'restricted',
        pid: 'https://example.org/datasets/doc-archive-2024',
        datasetSheetUri: 'https://huggingface.co/datasets/Voxel51/high-quality-invoice-images-for-ocr',
        containsPersonalData: true,
      },
      {
        id: 'dataset-2',
        title: 'Document Processing Logs',
        description: 'System logs containing processing metadata and performance metrics',
        format: 'JSON',
        accessRights: 'confidential',
        containsPersonalData: false,
      },
    ],
  },
  outcomes: {
    deliverables: [
      {
        id: 'deliverable-1',
        title: 'Document Processing System',
        type: 'SoftwareApplication',
        description: 'Complete automated document processing system with AI capabilities',
        date: '2024-06-30',
      },
      {
        id: 'deliverable-2',
        title: 'User Documentation',
        type: 'Document',
        description: 'Comprehensive user guide and training materials',
        date: '2024-06-25',
      },
    ],
    publications: [
      {
        id: 'pub-1',
        title: 'Automated Document Processing: A Case Study',
        doi: 'https://doi.org/10.1234/example.2024.001',
        authors: ['Michael Chen', 'Sarah Johnson'],
        date: '2024-07-15',
      },
    ],
    evaluations: [
      {
        id: 'eval-1',
        type: 'Performance Evaluation',
        date: '2024-06-20',
        results: 'System achieved 92% accuracy and reduced processing time by 65%',
        metrics: {
          accuracy: 0.92,
          timeReduction: 0.65,
          userSatisfaction: 0.95,
        },
      },
    ],
  },
}

/** Default display groups for the example: time, quality, quality, risk, enablement, cost (1–6). */
export const exampleBenefitDisplay: BenefitDisplayState = {
  displayGroupCount: 5,
  displayGroups: [
    {
      id: 1,
      benefitType: 'time',
      metricId: 'processingTime',
      benefitRefs: [
        { requirementId: 'req-1', benefitIndex: 0 },
        { requirementId: 'req-2', benefitIndex: 0 },
        { requirementId: 'req-3', benefitIndex: 0 },
      ],
    },
    {
      id: 2,
      benefitType: 'quality',
      metricId: 'errorRate',
      benefitRefs: [{ requirementId: 'req-1', benefitIndex: 1 }],
    },
    {
      id: 3,
      benefitType: 'risk',
      metricId: 'securityIncidents',
      benefitRefs: [{ requirementId: 'req-4', benefitIndex: 0 }],
    },
    {
      id: 4,
      benefitType: 'enablement',
      metricId: 'newCapability',
      benefitRefs: [{ requirementId: 'req-3', benefitIndex: 1 }],
    },
    {
      id: 5,
      benefitType: 'cost',
      metricId: 'operationalCost',
      benefitRefs: [{ requirementId: 'req-2', benefitIndex: 2 }],
    },
  ],
}
