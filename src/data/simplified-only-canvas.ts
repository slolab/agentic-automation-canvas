/**
 * A canvas answered exclusively through the simplified landing page: every
 * simplified prompt is filled and nothing else is, including the two generated
 * schema parents (a requirement whose title repeats its id, and a `Planning`
 * stage).
 *
 * It exists to test casting a simplified canvas into the full one — open it in
 * the Advanced view and every detailed section shows only what the simplified
 * questions can express. Used by scripts/build-simplified-rocrate.ts to write
 * tools/simplified-only.rocrate.zip for manual import (not the example the app
 * loads from "Show Example").
 */

import type { CanvasData } from '@/types/canvas'

const REQUIREMENT_ID = 'requirement-simplified-only'

export const simplifiedOnlyCanvas: CanvasData = {
  project: {
    title: 'Referral triage support',
    description:
      'Incoming clinical referrals are read in the order they arrive, so urgent cases are often noticed days after they land. Staff re-read the same letters repeatedly to decide what is urgent.',
    problemFrequency: 'weekly',
    problemExamples: [
      'Last Tuesday an urgent referral for a suspected relapse sat unread for three days because it arrived behind forty routine letters.',
      'In June a duplicate referral was triaged twice by two people on the same afternoon.',
    ],
    objective:
      'Urgent referrals are surfaced on the day they arrive, with the wording that makes them urgent visible to the person triaging.',
    headlineValue:
      'The waiting list review starts next quarter and the current triage backlog would make its numbers meaningless.',
    // Written by the exporter, not asked for in the simplified canvas.
    version: '0.1.0',
    versionDate: '2026-08-12',
  },
  version: '0.1.0',
  versionDate: '2026-08-12',
  userExpectations: {
    requirements: [
      {
        id: REQUIREMENT_ID,
        title: REQUIREMENT_ID,
        targetPopulation: 'Clinical staff triaging incoming referrals',
        benefits: [
          { benefitType: 'unclassified', description: 'Less time spent re-reading the same letters' },
          { benefitType: 'unclassified', description: 'Fewer urgent referrals noticed late' },
          { benefitType: 'unclassified', metricLabel: 'Days between arrival and triage decision' },
          { benefitType: 'unclassified', metricLabel: 'Urgent cases the clinician agrees were flagged correctly' },
        ],
        feasibility: {
          technologyApproach: {
            approaches: ['unstructured-content-processing', 'intelligent-search', 'other'],
            customApproaches: ['Clinical urgency triage against local referral guidance'],
          },
        },
      },
    ],
  },
  developerFeasibility: {
    feasibilityNotes:
      'A keyword filter was tried in 2025. It missed urgent wording that did not use the expected terms and was switched off after two months.',
    solutionsToResearch:
      'Whether the referral management system already offers a triage flag, and what the regional trusts use.',
    constraintFlags: [
      'large-data',
      'personal-data',
      'external-system-integration',
      'regulated-or-high-impact',
      'other',
      'Sign-off needed from the local data protection office',
    ],
  },
  dataAccess: {
    // Created by selecting the large-data and personal-data constraints.
    datasets: [{ id: 'dataset-simplified-only', title: '', containsPersonalData: true }],
  },
  governance: {
    buildTeamStatus: 'possible',
    maintenanceOwnerStatus: 'none',
    stages: [
      {
        id: 'stage-simplified-only',
        name: 'Planning',
        startDate: '2026-09-01',
        endDate: '2026-12-01',
        milestones: [
          {
            description:
              'Shadow-run triage on one clinic’s referrals for four weeks without changing how they are handled.',
            kpi:
              'The triaging clinician agrees with the flagged urgent cases for four consecutive weeks, with every disagreement recorded.',
          },
        ],
      },
    ],
  },
}
