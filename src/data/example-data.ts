/**
 * Example dataset for Agentic Automation Canvas
 * Generic, understandable example that demonstrates all features
 */

import type { CanvasData } from '@/types/canvas'

export const exampleData: CanvasData = {
  // Centralized Person management
  persons: [
    {
      id: 'person-0',
      name: 'Sarah Johnson',
      affiliation: 'Operations Department',
    },
    {
      id: 'person-1',
      name: 'Michael Chen',
      orcid: 'https://orcid.org/0000-0000-0000-0001',
      affiliation: 'IT Department',
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
    aggregateBenefitValue: 40,
    aggregateBenefitUnit: 'hours/month',
    primaryValueDriver: 'time',
    aggregateBenefits: [
      {
        benefitType: 'time',
        metricId: 'processingTime',
        aggregationBasis: 'perUnit',
        unit: 'minutes',
        value: '8 → 2',
        method: 'computed',
      },
      {
        benefitType: 'quality',
        metricId: 'errorRateReduction',
        aggregationBasis: 'perMonth',
        unit: '% reduction',
        value: 80,
        method: 'computed',
      },
      {
        benefitType: 'risk',
        metricId: 'complianceIncidentsReduction',
        aggregationBasis: 'perMonth',
        unit: 'incidents prevented/month',
        value: 2.5,
        method: 'computed',
      },
    ],
    version: '1.2.8',
    versionDate: '2024-06-15',
  },
  version: '1.2.8',
  versionDate: '2024-06-15',
  isImported: false, // Example data is not imported, it's loaded as example
  userExpectations: {
    requirements: [
      {
        id: 'req-1',
        description: 'Automatically extract key information from incoming documents',
        userStory: 'As a data entry clerk, I want documents to be automatically processed so that I can focus on exception handling instead of routine data entry',
        priority: 'high',
        status: 'in-progress',
        unitOfWork: 'one document',
        unitCategory: 'document',
        volumePerMonth: 500,
        humanOversightMinutesPerUnit: 1,
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
            confidenceUser: 'high',
            confidenceDev: 'medium',
            assumptions: 'Documents are mostly standardized formats. Complex documents may require more oversight.',
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
            assumptions: 'Assumes validation pipeline catches 95% of errors',
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
            assumptions: 'Automated processing ensures consistent handling per policy, reducing human error in compliance-sensitive documents',
          },
        ],
      },
      {
        id: 'req-2',
        description: 'Automatically categorize documents by type',
        userStory: 'As a team lead, I want documents automatically categorized so that routing decisions are consistent and faster',
        priority: 'high',
        status: 'planned',
        unitOfWork: 'one document',
        unitCategory: 'document',
        volumePerMonth: 500,
        humanOversightMinutesPerUnit: 0.5,
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
            confidenceUser: 'medium',
            confidenceDev: 'medium',
            assumptions: 'Document types are well-defined and distinguishable',
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
        ],
      },
      {
        id: 'req-3',
        description: 'Route documents to appropriate team members',
        userStory: 'As a manager, I want documents automatically routed to the right person so that processing time is minimized',
        priority: 'medium',
        status: 'planned',
        unitOfWork: 'one routing decision',
        unitCategory: 'case',
        volumePerMonth: 500,
        humanOversightMinutesPerUnit: 0.3,
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
            confidenceUser: 'high',
            confidenceDev: 'high',
            assumptions: 'Routing rules are clear and can be automated',
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
    ],
    stakeholders: [
      {
        personId: 'person-0', // References Sarah Johnson from persons array
        role: 'Data Entry Manager',
        values: ['time savings', 'accuracy'],
      },
      {
        personId: 'person-1', // References Michael Chen from persons array
        role: 'IT Lead',
        values: ['system reliability', 'maintainability'],
      },
    ],
  },
  developerFeasibility: {
    trlLevel: {
      current: 4,
      target: 7,
    },
    technicalRisk: 'medium',
    algorithms: ['OCR (Optical Character Recognition)', 'Natural Language Processing', 'Document Classification'],
    tools: ['Python', 'TensorFlow', 'Document Processing API'],
    effortEstimate: '4-6 months',
    feasibilityNotes: 'Core technologies are mature. Main challenge is handling edge cases and ensuring accuracy for diverse document formats.',
    modelSelection: 'frontier-model',
    modelName: 'GPT-4',
    baselineCapability: {
      taskPerformance: 'moderate',
      successRate: 65,
      limitations: 'Naive GPT-4 can extract text and basic information but struggles with: (1) Custom domain terminology specific to our business, (2) Complex multi-step workflows requiring context across multiple documents, (3) Edge cases with unusual document formats, (4) Maintaining consistency across related documents',
      requiresCustomInstructions: true,
      customInstructionsComplexity: 'high',
    },
    expectedGains: {
      performanceImprovement: 'significant',
      headroom: 'high',
      justification: 'By adding agentic capabilities (tool use for document APIs, structured workflows, domain-specific instructions, and autonomy to handle multi-step processes), we expect to improve success rate from 65% to 90%+. The system will be able to handle complex workflows that require context awareness and decision-making that naive models cannot perform.',
    },
    implementationDifficulty: {
      skillAdditionDifficulty: 'moderate',
      baselineComparisonRequired: true,
      validationMonitoringRequired: true,
      securityLevel: 'medium',
    },
    agenticExplanation: 'Agentic capabilities are added through: (1) Tool use - giving the model access to document processing APIs, database queries, and external validation services, (2) Autonomy - allowing the model to make routing decisions and handle exceptions autonomously, (3) Structured workflows - defining multi-step document processing pipelines with checkpoints, (4) Domain knowledge - providing custom instructions with business-specific terminology and rules. The base GPT-4 provides reasoning and language understanding, but the agentic behavior emerges from the system architecture that enables autonomous decision-making and tool interaction.',
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
