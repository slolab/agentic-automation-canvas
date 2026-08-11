/**
 * Composable for managing canvas form data state
 */

import { ref, computed, watch } from 'vue'
import type { CanvasData, Milestone } from '@/types/canvas'
import type { Diagnostic } from '@/diagnostics'
import { logDiagnostics } from '@/diagnostics'
import { decodePointer } from '@/json'
import {
  clearPersistedBenefitDisplay,
  readPersistedBenefitDisplay,
  savePersistedBenefitDisplay,
} from '@/persistence/benefitDisplay'
import {
  clearPersistedCanvas,
  readPersistedCanvas,
  savePersistedCanvas,
} from '@/persistence/canvas'
import { recoverCanvasToCurrent } from '@/schema/recovery'
import { validateCurrentCanvas } from '@/schema/validation'
import type { BenefitDisplayState } from '@/types/benefitDisplay'
import { getTimeSavedPerUnit, getOversightMinutes } from '@/utils/timeBenefits'
import { isBenefitOfType } from '@/utils/benefits'
import { collectDataAccessFlags } from '@/utils/dataAccessWarnings'
import { todayIsoDate } from '@/utils/date'
import type { FocusFieldRequest } from '@/utils/fieldNavigation'
import {
  patchFirstStageMilestone as patchFirstStageMilestoneData,
  patchFirstStage as patchFirstStageData,
  patchPrimaryRequirement as patchPrimaryRequirementData,
  firstStageTeamNames,
  replacePrimaryUnclassifiedBenefits as replacePrimaryUnclassifiedBenefitsData,
  retainedClassifiedBenefitIndexes,
  setFirstStageTeam,
} from '@/utils/simplifiedCanvas'
import type {
  PrimaryRequirementPatch,
  FirstStagePatch,
  UnclassifiedBenefitField,
} from '@/utils/simplifiedCanvas'

// Initialize with default structure
const canvasData = ref<CanvasData>({
  project: {
    title: '',
    description: '',
    projectStage: '',
  },
  version: '0.1.0',
  versionDate: todayIsoDate(),
})

// App-only: version at last import, for "increment version" reminder (not in schema)
const lastImportedVersion = ref<string | null>(null)

// App-only: true after first user edit since last import; reminder only shown when true
const hasChangedSinceImport = ref(false)

// App-only: non-blocking findings from the most recent load or import.
const lastDiagnostics = ref<Diagnostic[]>([])

// App-only: benefit display groups for dashboard (not in schema; stored in benefit-display.json in crate)
const benefitDisplay = ref<BenefitDisplayState>({ displayGroups: [] })

// App-only: when set, CanvasForm navigates to the requested detailed section or simplified canvas.
const requestedSection = ref<string | null>(null)

// App-only: when set, collapsible components expand and focus the specified field
const focusFieldRequest = ref<FocusFieldRequest | null>(null)
const requestSection = (section: string) => {
  requestedSection.value = section
}

// Incremented on import so UserExpectations can remount and pick up fresh data
const dataVersion = ref(0)

interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

function schemaPathToField(path: string): string {
  const segments = decodePointer(path)
  if (segments.length === 0) return 'canvas'

  const fullPath = segments.reduce((field, segment) => {
    if (/^\d+$/.test(segment)) return `${field}[${segment}]`
    return field ? `${field}.${segment}` : segment
  }, '')

  if (fullPath.startsWith('userExpectations.requirements[')) {
    return fullPath.slice('userExpectations.'.length)
  }
  if (fullPath.startsWith('dataAccess.datasets[')) {
    return fullPath.slice('dataAccess.'.length)
  }
  return fullPath || 'canvas'
}

function currentSchemaErrors(): ValidationError[] {
  return validateCurrentCanvas(canvasData.value).diagnostics.map((diagnostic) => ({
    field: schemaPathToField(diagnostic.path),
    message: diagnostic.message,
    severity: 'error',
  }))
}

const loadFromStorage = () => {
  const result = readPersistedCanvas()
  if (result) {
    lastDiagnostics.value = result.diagnostics
    if (result.canvasData) {
      canvasData.value = result.canvasData
      // Ensure version fields are initialized if missing
      if (!canvasData.value.version && !canvasData.value.project.version) {
        canvasData.value.version = '0.1.0'
        canvasData.value.project.version = '0.1.0'
      }
      if (!canvasData.value.versionDate && !canvasData.value.project.versionDate) {
        canvasData.value.versionDate = todayIsoDate()
        canvasData.value.project.versionDate = todayIsoDate()
      }
    }
  }

  const storedBenefitDisplay = readPersistedBenefitDisplay()
  if (storedBenefitDisplay) benefitDisplay.value = storedBenefitDisplay
}

watch(canvasData, savePersistedCanvas, { deep: true })
watch(benefitDisplay, savePersistedBenefitDisplay, { deep: true })

// Initialize
loadFromStorage()

function mergeSection<T extends object>(current: T, updates: Partial<T>): T {
  return Object.assign({}, current, structuredClone(updates))
}

export function useCanvasData() {
  const updateProject = (updates: Partial<CanvasData['project']>) => {
    hasChangedSinceImport.value = true
    canvasData.value.project = mergeSection(canvasData.value.project, updates)
  }

  const updateUserExpectations = (
    updates: Partial<NonNullable<CanvasData['userExpectations']>>,
  ) => {
    hasChangedSinceImport.value = true
    canvasData.value.userExpectations = mergeSection(
      canvasData.value.userExpectations ?? {},
      updates,
    )
  }

  const updateDeveloperFeasibility = (
    updates: Partial<NonNullable<CanvasData['developerFeasibility']>>,
  ) => {
    hasChangedSinceImport.value = true
    canvasData.value.developerFeasibility = mergeSection(
      canvasData.value.developerFeasibility ?? {},
      updates,
    )
  }

  const updateGovernance = (
    updates: Partial<NonNullable<CanvasData['governance']>>,
  ) => {
    hasChangedSinceImport.value = true
    canvasData.value.governance = mergeSection(canvasData.value.governance ?? {}, updates)
  }

  const updateDataAccess = (
    updates: Partial<NonNullable<CanvasData['dataAccess']>>,
  ) => {
    hasChangedSinceImport.value = true
    canvasData.value.dataAccess = mergeSection(canvasData.value.dataAccess ?? {}, updates)
  }

  const updatePersons = (persons: CanvasData['persons']) => {
    hasChangedSinceImport.value = true
    canvasData.value.persons = persons ? structuredClone(persons) : undefined
  }

  const updateOutcomes = (
    updates: Partial<NonNullable<CanvasData['outcomes']>>,
  ) => {
    hasChangedSinceImport.value = true
    canvasData.value.outcomes = mergeSection(canvasData.value.outcomes ?? {}, updates)
  }

  const patchPrimaryRequirement = (updates: PrimaryRequirementPatch) => {
    hasChangedSinceImport.value = true
    canvasData.value.userExpectations = patchPrimaryRequirementData(
      canvasData.value.userExpectations,
      updates,
    )
  }

  const replacePrimaryUnclassifiedBenefits = (
    field: UnclassifiedBenefitField,
    values: readonly string[],
  ) => {
    hasChangedSinceImport.value = true
    const previousPrimary = canvasData.value.userExpectations?.requirements?.[0]
    const nextExpectations = replacePrimaryUnclassifiedBenefitsData(
      canvasData.value.userExpectations,
      field,
      values,
    )
    const nextPrimary = nextExpectations.requirements?.[0]

    if (previousPrimary && nextPrimary && previousPrimary.id === nextPrimary.id) {
      const indexMap = retainedClassifiedBenefitIndexes(
        previousPrimary.benefits,
        nextPrimary.benefits,
      )
      let referencesChanged = false
      const displayGroups = benefitDisplay.value.displayGroups.map((group) => ({
        ...group,
        benefitRefs: group.benefitRefs.map((reference) => {
          if (reference.requirementId !== previousPrimary.id) return reference
          const nextIndex = indexMap.get(reference.benefitIndex)
          if (nextIndex === undefined || nextIndex === reference.benefitIndex) return reference
          referencesChanged = true
          return { ...reference, benefitIndex: nextIndex }
        }),
      }))
      if (referencesChanged) {
        benefitDisplay.value = { ...benefitDisplay.value, displayGroups }
      }
    }

    canvasData.value.userExpectations = nextExpectations
  }

  const patchFirstStageMilestone = (updates: Partial<Milestone>) => {
    hasChangedSinceImport.value = true
    canvasData.value.governance = patchFirstStageMilestoneData(
      canvasData.value.governance,
      updates,
    )
  }

  const patchFirstStage = (updates: FirstStagePatch) => {
    hasChangedSinceImport.value = true
    canvasData.value.governance = patchFirstStageData(
      canvasData.value.governance,
      updates,
    )
  }

  const updateFirstStageTeam = (names: readonly string[]) => {
    hasChangedSinceImport.value = true
    const result = setFirstStageTeam(
      canvasData.value.persons,
      canvasData.value.governance,
      names,
    )
    canvasData.value.persons = result.persons
    canvasData.value.governance = result.governance
  }

  const simplifiedFirstStageTeamNames = computed(() => firstStageTeamNames(
    canvasData.value.persons,
    canvasData.value.governance,
  ))

  const clearData = () => {
    // Set to empty structure - use undefined to trigger watchers properly
    canvasData.value = {
      project: {
        title: '',
        description: '',
        projectStage: '',
      },
      userExpectations: undefined,
      developerFeasibility: undefined,
      governance: undefined,
      dataAccess: undefined,
      outcomes: undefined,
      version: '0.1.0',
      versionDate: todayIsoDate(),
    }
    lastImportedVersion.value = null
    hasChangedSinceImport.value = false
    lastDiagnostics.value = []
    benefitDisplay.value = { displayGroups: [] }
    clearPersistedCanvas()
    clearPersistedBenefitDisplay()
  }

  const exportData = (): string => {
    return JSON.stringify(canvasData.value, null, 2)
  }

  const importData = (json: string) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(json) as unknown
    } catch {
      throw new Error('Invalid JSON data')
    }

    const recovered = recoverCanvasToCurrent(parsed)
    canvasData.value = recovered.data
    lastDiagnostics.value = recovered.diagnostics
    dataVersion.value++
    logDiagnostics(recovered.diagnostics)
  }

  const importFromROCrate = (
    data: CanvasData,
    importedBenefitDisplay?: BenefitDisplayState,
    diagnostics: readonly Diagnostic[] = [],
  ) => {
    // Deep copy the data to ensure reactivity works properly
    const newData = structuredClone(data)
    // Clear existing data first to ensure watchers trigger
    canvasData.value = {
      project: {
        title: '',
        description: '',
        projectStage: '',
      },
    }
    // Sync version between project and root level
    if (newData.project?.version && !newData.version) {
      newData.version = newData.project.version
    } else if (newData.version && !newData.project?.version) {
      newData.project.version = newData.version
    }
    canvasData.value = newData
    lastDiagnostics.value = [...diagnostics]
    dataVersion.value++
    lastImportedVersion.value = newData.project?.version ?? newData.version ?? null
    hasChangedSinceImport.value = false
    if (importedBenefitDisplay) {
      benefitDisplay.value = importedBenefitDisplay
    } else {
      benefitDisplay.value = { displayGroups: [] }
    }
  }

  const clearDiagnostics = () => {
    lastDiagnostics.value = []
  }

  /** Surface findings from a boundary that failed before any data was loaded. */
  const reportDiagnostics = (diagnostics: readonly Diagnostic[]) => {
    lastDiagnostics.value = [...diagnostics]
  }

  // JSON Schema owns structural validation. These handwritten rules are
  // presentation and domain advisories that the structural contract cannot express.
  const projectAdvisories = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const project = canvasData.value.project

    if (project.description?.trim()) {
      // Check if description has at least one sentence (contains period, exclamation, or question mark)
      const sentencePattern = /[.!?]/
      if (!sentencePattern.test(project.description)) {
        errors.push({ field: 'project.description', message: 'Description should be at least one sentence', severity: 'warning' })
      }
    }

    // Version management: recommend incrementing version only after first change since import
    if (
      hasChangedSinceImport.value &&
      lastImportedVersion.value != null &&
      project.version &&
      project.version === lastImportedVersion.value
    ) {
      errors.push({
        field: 'project.version',
        message: 'It is recommended to increment the version when modifying an imported canvas. See https://semver.org/ for guidance.',
        severity: 'warning',
      })
    }

    return errors
  }

  const requirementAdvisories = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const requirements = canvasData.value.userExpectations?.requirements || []

    if (requirements.length === 0) {
      errors.push({ field: 'userExpectations.requirements', message: 'Consider adding at least one task', severity: 'warning' })
      return errors
    }

    requirements.forEach((req, index) => {
      const prefix = `requirements[${index}]`

      if (!req.unitOfWork || !req.unitOfWork.trim()) {
        errors.push({ field: `${prefix}.unitOfWork`, message: 'Unit of work is recommended', severity: 'warning' })
      }

      if (!req.unitCategory) {
        errors.push({ field: `${prefix}.unitCategory`, message: 'Unit category is recommended', severity: 'warning' })
      }

      if (req.volumePerMonth === undefined) {
        errors.push({ field: `${prefix}.volumePerMonth`, message: 'Volume per month is recommended', severity: 'warning' })
      }

      // Validate benefits array
      if (!req.benefits || req.benefits.length === 0) {
        errors.push({ field: `${prefix}.benefits`, message: 'At least one benefit is required', severity: 'warning' })
      } else {
        // Check for time benefit and validate net savings (baseline − expected − oversight)
        const timeBenefit = req.benefits.find(b => isBenefitOfType(b, 'time'))
        if (timeBenefit) {
          // Validate net savings
          const savedPerUnit = getTimeSavedPerUnit(timeBenefit, req)
          const volume = req.volumePerMonth || 0
          const grossTimeSaved = savedPerUnit * volume
          const oversightTime = getOversightMinutes(timeBenefit, volume)
          const netTimeSaved = grossTimeSaved - oversightTime
          if (netTimeSaved <= 0 && (timeBenefit.oversightMinutesPerUnit !== undefined || timeBenefit.oversightMinutesPerMonth !== undefined)) {
            errors.push({ field: `${prefix}.netTimeSaved`, message: 'Net time saved is ≤ 0 (oversight exceeds time saved)', severity: 'warning' })
          }
        }

      }
    })

    return errors
  }

  const datasetAdvisories = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const datasets = canvasData.value.dataAccess?.datasets || []

    datasets.forEach((dataset, index) => {
      const prefix = `datasets[${index}]`

      if (!dataset.accessRights || !dataset.accessRights.trim()) {
        errors.push({
          field: `${prefix}.accessRights`,
          message: dataset.containsPersonalData
            ? 'Access restriction text is recommended when a dataset contains personal data'
            : 'Access rights are recommended',
          severity: 'warning',
        })
      }
    })

    return errors
  }

  // Advisory compliance flags from task-level data access (warnings only; hints stay inline in the tab)
  const validateTaskDataAccess = (): ValidationError[] => {
    const requirements = canvasData.value.userExpectations?.requirements || []
    return collectDataAccessFlags(canvasData.value)
      .filter((flag) => flag.level === 'warning')
      .map((flag) => {
        const index = requirements.findIndex((r) => r.id === flag.taskId)
        return {
          field: `requirements[${index}].dataAccess`,
          message: flag.message,
          severity: 'warning' as const,
        }
      })
  }

  const validateProject = (): ValidationError[] => [
    ...currentSchemaErrors().filter(
      (error) => error.field === 'project' || error.field.startsWith('project.'),
    ),
    ...projectAdvisories(),
  ]

  const validateAll = (): {
    errors: ValidationError[]
    warnings: ValidationError[]
    isValid: boolean
  } => {
    const allErrors: ValidationError[] = []

    allErrors.push(...currentSchemaErrors())
    allErrors.push(...projectAdvisories())
    allErrors.push(...requirementAdvisories())
    allErrors.push(...datasetAdvisories())
    allErrors.push(...validateTaskDataAccess())

    const errors = allErrors.filter(e => e.severity === 'error')
    const warnings = allErrors.filter(e => e.severity === 'warning')

    return {
      errors,
      warnings,
      isValid: errors.length === 0,
    }
  }

  // Computed: detailed-canvas completion percentage (field-by-field)
  const completionPercentage = computed(() => {
    let completed = 0
    let total = 0
    const data = canvasData.value

    // Project fields (mandatory)
    total++
    if (data.project.title?.trim()) completed++

    total++
    if (data.project.description?.trim()) completed++

    total++
    if (data.project.projectStage?.trim()) completed++

    // Project fields (optional - only count if section exists)
    if (data.project.objective !== undefined) {
      total++
      if (data.project.objective?.trim()) completed++
    }
    if (data.project.startDate !== undefined) {
      total++
      if (data.project.startDate) completed++
    }
    if (data.project.endDate !== undefined) {
      total++
      if (data.project.endDate) completed++
    }
    if (data.project.domain !== undefined && data.project.domain.length > 0) {
      total += data.project.domain.length
      completed += data.project.domain.filter(d => d?.trim()).length
    }
    if (data.project.keywords !== undefined && data.project.keywords.length > 0) {
      total += data.project.keywords.length
      completed += data.project.keywords.filter(k => k?.trim()).length
    }
    if (data.project.projectId !== undefined) {
      total++
      if (data.project.projectId?.trim()) completed++
    }
    if (data.project.headlineValue !== undefined) {
      total++
      if (data.project.headlineValue?.trim()) completed++
    }
    // Check rough estimate fields (manual estimate when getting started)
    if (data.project.roughEstimateValue !== undefined || data.project.roughEstimateUnit !== undefined) {
      total++
      if (data.project.roughEstimateValue !== undefined && data.project.roughEstimateValue !== null) {
        completed++
      }
    }
    if (data.project.primaryValueDriver !== undefined) {
      total++
      if (data.project.primaryValueDriver) completed++
    }

    // Requirements (optional section - only count if exists)
    if (data.userExpectations?.requirements && data.userExpectations.requirements.length > 0) {
      data.userExpectations.requirements.forEach(req => {
        // Mandatory fields per requirement
        total++
        if (req.title?.trim()) completed++

        total++
        if (req.unitOfWork?.trim()) completed++

        total++
        if (req.unitCategory) completed++

        total++
        if (req.volumePerMonth !== undefined && req.volumePerMonth >= 1) completed++

        total++
        if (req.benefits && req.benefits.length > 0) completed++

        // Optional fields per requirement
        if (req.userStory !== undefined) {
          total++
          if (req.userStory?.trim()) completed++
        }
        if (req.priority !== undefined) {
          total++
          if (req.priority) completed++
        }
        if (req.status !== undefined) {
          total++
          if (req.status) completed++
        }
        // Oversight is now part of benefits, counted with benefits below
        // Count benefits as completed fields
        if (req.benefits && req.benefits.length > 0) {
          total += req.benefits.length
          completed += req.benefits.length
        }
      })
    }

    // Developer Feasibility (optional section)
    if (data.developerFeasibility) {
      if (data.developerFeasibility.trlLevel !== undefined) {
        total++
        if (data.developerFeasibility.trlLevel.current !== undefined) completed++
        if (data.developerFeasibility.trlLevel.target !== undefined) {
          total++
          if (data.developerFeasibility.trlLevel.target !== undefined) completed++
        }
      }
      if (data.developerFeasibility.technicalRisk !== undefined) {
        total++
        if (data.developerFeasibility.technicalRisk) completed++
      }
      if (data.developerFeasibility.effortEstimate !== undefined) {
        total++
        // Check if effort estimate has a valid value
        const effort = data.developerFeasibility.effortEstimate
        if (effort.value !== undefined && effort.value > 0) {
          completed++
        }
      }
      if (data.developerFeasibility.feasibilityNotes !== undefined) {
        total++
        if (data.developerFeasibility.feasibilityNotes?.trim()) completed++
      }
    }

    // Governance Stages (optional section)
    if (data.governance?.stages && data.governance.stages.length > 0) {
      data.governance.stages.forEach(stage => {
        total++
        if (stage.name?.trim()) completed++
        if (stage.startDate !== undefined) {
          total++
          if (stage.startDate) completed++
        }
        if (stage.endDate !== undefined) {
          total++
          if (stage.endDate) completed++
        }
        if (stage.agents !== undefined && stage.agents.length > 0) {
          stage.agents.forEach(agent => {
            total++
            // For person-type agents, check personId; for others, check name
            if (agent.type === 'person') {
              if (agent.personId?.trim()) {
                const person = data.persons?.find(p => p.id === agent.personId)
                if (person?.name?.trim()) completed++
              }
            } else {
              if (agent.name?.trim()) completed++
            }
            if (agent.role !== undefined) {
              total++
              if (agent.role?.trim()) completed++
            }
          })
        }
        if (stage.milestones !== undefined && stage.milestones.length > 0) {
          total += stage.milestones.length
          completed += stage.milestones.filter((m) => {
            const milestone = m as Milestone
            return !!(milestone.description?.trim() || milestone.kpi?.trim())
          }).length
        }
        if (stage.complianceStandards !== undefined && stage.complianceStandards.length > 0) {
          total += stage.complianceStandards.length
          completed += stage.complianceStandards.filter(c => typeof c === 'string' ? c.trim() : c?.framework?.trim()).length
        }
      })
    }

    // Datasets (optional section)
    if (data.dataAccess?.datasets && data.dataAccess.datasets.length > 0) {
      data.dataAccess.datasets.forEach(dataset => {
        total++
        if (dataset.title?.trim()) completed++
        total++
        if (dataset.accessRights?.trim()) completed++
        if (dataset.description !== undefined) {
          total++
          if (dataset.description?.trim()) completed++
        }
        if (dataset.format !== undefined) {
          total++
          if (dataset.format?.trim()) completed++
        }
        if (dataset.license !== undefined) {
          total++
          if (dataset.license?.trim()) completed++
        }
        if (dataset.pid !== undefined) {
          total++
          if (dataset.pid?.trim()) completed++
        }
        if (dataset.duoTerms !== undefined && dataset.duoTerms.length > 0) {
          total += dataset.duoTerms.length
          completed += dataset.duoTerms.filter(t => t?.trim()).length
        }
        if (dataset.containsPersonalData !== undefined) {
          total++
          completed++ // Boolean is always "filled"
        }
      })
    }

    // Outcomes (optional section)
    if (data.outcomes?.deliverables && data.outcomes.deliverables.length > 0) {
      data.outcomes.deliverables.forEach(deliverable => {
        total++
        if (deliverable.title?.trim()) completed++
        total++
        if (deliverable.type?.trim()) completed++
        if (deliverable.description !== undefined) {
          total++
          if (deliverable.description?.trim()) completed++
        }
        if (deliverable.date !== undefined) {
          total++
          if (deliverable.date) completed++
        }
        if (deliverable.pid !== undefined) {
          total++
          if (deliverable.pid?.trim()) completed++
        }
      })
    }

    if (data.outcomes?.publications && data.outcomes.publications.length > 0) {
      data.outcomes.publications.forEach(pub => {
        total++
        if (pub.title?.trim()) completed++
        if (pub.doi !== undefined) {
          total++
          if (pub.doi?.trim()) completed++
        }
        if (pub.authors !== undefined && pub.authors.length > 0) {
          total += pub.authors.length
          completed += pub.authors.filter(a => a.type === 'person' ? !!a.personId : !!a.name?.trim()).length
        }
        if (pub.date !== undefined) {
          total++
          if (pub.date) completed++
        }
      })
    }

    if (data.outcomes?.evaluations && data.outcomes.evaluations.length > 0) {
      data.outcomes.evaluations.forEach(evaluation => {
        total++
        if (evaluation.type?.trim()) completed++
        if (evaluation.date !== undefined) {
          total++
          if (evaluation.date) completed++
        }
        if (evaluation.results !== undefined) {
          total++
          if (evaluation.results?.trim()) completed++
        }
      })
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const validation = validateAll()

    return {
      percentage,
      isValid: validation.isValid,
      hasErrors: validation.errors.length > 0,
      hasWarnings: validation.warnings.length > 0,
    }
  })

  const markChangedSinceImport = () => {
    hasChangedSinceImport.value = true
  }

  return {
    canvasData,
    lastImportedVersion,
    lastDiagnostics,
    clearDiagnostics,
    reportDiagnostics,
    benefitDisplay,
    markChangedSinceImport,
    updateProject,
    updatePersons,
    updateUserExpectations,
    updateDeveloperFeasibility,
    updateGovernance,
    updateDataAccess,
    updateOutcomes,
    patchPrimaryRequirement,
    replacePrimaryUnclassifiedBenefits,
    patchFirstStageMilestone,
    patchFirstStage,
    updateFirstStageTeam,
    simplifiedFirstStageTeamNames,
    clearData,
    exportData,
    importData,
    importFromROCrate,
    completionPercentage,
    validateAll,
    validateProject,
    requestedSection,
    requestSection,
    focusFieldRequest,
    dataVersion,
  }
}
