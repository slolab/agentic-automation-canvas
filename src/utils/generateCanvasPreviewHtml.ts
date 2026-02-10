/**
 * Generate self-contained HTML preview of the canvas summary for RO-Crate export.
 * Matches the BMC-style layout from CanvasSummary.vue.
 */

import type { CanvasData } from '@/types/canvas'
import { isLink, parseUserStory, type CanvasSummaryData } from './canvasSummary'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isEmptyProject(p: CanvasSummaryData['project']): boolean {
  const noTitle = !p.title || p.title === 'Untitled Project'
  return noTitle && !p.description && !p.stage && !p.headlineValue && !p.primaryValueDriver && p.domain.length === 0
}

function isEmptyUserExpectations(u: CanvasSummaryData['userExpectations']): boolean {
  return u.taskCount === 0 && Object.keys(u.benefitTypeCounts).length === 0 && u.tasks.length === 0
}

function isEmptyDeveloperFeasibility(d: CanvasSummaryData['developerFeasibility']): boolean {
  return (
    d.trlCurrent === null &&
    d.trlTarget === null &&
    !d.technicalRisk &&
    !d.effortEstimate &&
    d.amortizationMonths === null &&
    !d.feasibilityNotes.trim() &&
    d.tasksWithDedicatedFeasibility.length === 0
  )
}

function isEmptyDataAccess(d: CanvasSummaryData['dataAccess']): boolean {
  return d.datasetCount === 0 && Object.keys(d.accessRightsSummary).length === 0 && d.sensitivitySummary.length === 0
}

function isEmptyOutcomes(o: CanvasSummaryData['outcomes']): boolean {
  return (
    o.deliverableCount === 0 &&
    o.publicationCount === 0 &&
    o.evaluationCount === 0 &&
    o.deliverables.length === 0 &&
    o.publications.length === 0 &&
    o.evaluations.length === 0
  )
}

const BLOCK_ICONS: Record<string, string> = {
  project: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  governance: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18"/><path d="m8 7 4-4 4 4"/><path d="m8 17 4 4 4-4"/><path d="M3 12h6"/><path d="M15 12h6"/></svg>`,
  expectations: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  data: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  feasibility: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  outcomes: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>`,
}

function renderUserStory(userStory?: string): string {
  if (!userStory?.trim()) return ''
  const segments = parseUserStory(userStory)
  if (!segments) {
    return `<span class="user-story-content">${escapeHtml(userStory)}</span>`
  }
  return segments
    .map(
      (s) =>
        `<span class="${s.formulaic ? 'user-story-formulaic' : 'user-story-content'}">${escapeHtml(s.text)}</span>`
    )
    .join('')
}

export function generateCanvasPreviewHtml(
  canvasData: CanvasData,
  summary: CanvasSummaryData,
  version: string
): string {
  const today = new Date().toISOString().split('T')[0]
  const date =
    canvasData.project?.versionDate || canvasData.versionDate || canvasData.project?.startDate || today
  const feasibilityProgress =
    summary.userExpectations.taskCount > 0
      ? Math.round(
          (summary.developerFeasibility.tasksWithDedicatedFeasibility.length /
            summary.userExpectations.taskCount) *
            100
        )
      : 0

  const projectTitle = summary.project.title || '—'

  let projectContent = ''
  if (isEmptyProject(summary.project)) {
    projectContent = '<p class="italic text-gray-400">Not specified</p>'
  } else {
    projectContent = `
      <p class="font-semibold">${escapeHtml(summary.project.title)}</p>
      ${summary.project.description ? `<p class="text-gray-600">${escapeHtml(summary.project.description)}</p>` : ''}
      ${summary.project.stage ? `<p class="text-xs uppercase">${escapeHtml(summary.project.stage)}</p>` : ''}
      ${summary.project.headlineValue ? `<p class="font-medium">${escapeHtml(summary.project.headlineValue)}</p>` : ''}
      ${summary.project.primaryValueDriver ? `<p class="text-xs">Primary value: ${escapeHtml(summary.project.primaryValueDriver)}</p>` : ''}
      ${summary.project.domain.length ? `<div class="flex flex-wrap gap-1 text-xs">${summary.project.domain.map((d) => `<span class="text-gray-600">${escapeHtml(d)}</span>`).join('')}</div>` : ''}
    `
  }

  let governanceContent = ''
  if (!summary.governance.stages.length) {
    governanceContent = '<p class="italic text-gray-400">Not specified</p>'
  } else {
    governanceContent = summary.governance.stages
      .map(
        (s) =>
          `<div class="border-l-2 border-black pl-2 text-xs">
            <p class="font-medium">${escapeHtml(s.name)}</p>
            ${s.startDate || s.endDate ? `<p class="text-gray-500">${escapeHtml(s.startDate)} ${s.startDate && s.endDate ? '→' : ''} ${escapeHtml(s.endDate)}</p>` : ''}
            ${s.agentCount > 0 || s.milestoneCount > 0 ? `<p class="text-gray-500">${s.agentCount} agents, ${s.milestoneCount} milestones</p>` : ''}
          </div>`
      )
      .join('')
  }

  let expectationsContent = ''
  if (isEmptyUserExpectations(summary.userExpectations)) {
    expectationsContent = '<p class="italic text-gray-400">Not specified</p>'
  } else {
    const tasksHtml = summary.userExpectations.tasks
      .map(
        (t) => `
        <div class="border-l-2 border-gray-300 pl-2 py-0.5">
          <p class="font-medium text-gray-900">${escapeHtml(t.title)}</p>
          ${t.userStory ? `<p class="text-xs italic mt-0.5 user-story-text">${renderUserStory(t.userStory)}</p>` : ''}
        </div>`
      )
      .join('')
    const benefitsHtml =
      summary.userExpectations.totalTimeSavedHoursPerMonth > 0 ||
      Object.keys(summary.userExpectations.benefitTypeCounts).length
        ? `
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-2 mb-0.5">Benefits</p>
        ${summary.userExpectations.totalTimeSavedHoursPerMonth > 0 ? `<p class="font-medium">~${summary.userExpectations.totalTimeSavedHoursPerMonth} hrs/month saved</p>` : ''}
        ${
          Object.keys(summary.userExpectations.benefitTypeCounts).length
            ? `<div class="flex flex-wrap gap-1 text-xs">${Object.entries(summary.userExpectations.benefitTypeCounts)
                .map(
                  ([type, count]) =>
                    `<span class="px-1.5 py-0.5 border border-black text-gray-700 capitalize">${escapeHtml(type)} ${count}</span>`
                )
                .join('')}</div>`
            : ''
        }`
        : ''
    expectationsContent = `
      <p><strong>${summary.userExpectations.taskCount}</strong> tasks</p>
      ${tasksHtml}
      ${benefitsHtml}
    `
  }

  let dataAccessContent = ''
  if (isEmptyDataAccess(summary.dataAccess)) {
    dataAccessContent = '<p class="italic text-gray-400">Not specified</p>'
  } else {
    const accessRightsHtml = Object.keys(summary.dataAccess.accessRightsSummary).length
      ? Object.entries(summary.dataAccess.accessRightsSummary)
          .map(([ar, count]) => `<p>${escapeHtml(ar)}: ${count}</p>`)
          .join('')
      : ''
    const sensitivityHtml = summary.dataAccess.sensitivitySummary.length
      ? summary.dataAccess.sensitivitySummary.map((s) => `<span class="text-gray-600">${escapeHtml(s)}</span>`).join('')
      : ''
    dataAccessContent = `
      <p><strong>${summary.dataAccess.datasetCount}</strong> datasets</p>
      ${accessRightsHtml ? `<div class="text-xs">${accessRightsHtml}</div>` : ''}
      ${sensitivityHtml ? `<div class="flex flex-wrap gap-1 text-xs">${sensitivityHtml}</div>` : ''}
    `
  }

  let feasibilityContent = ''
  if (isEmptyDeveloperFeasibility(summary.developerFeasibility) && summary.userExpectations.taskCount === 0) {
    feasibilityContent = '<p class="italic text-gray-400">Not specified</p>'
  } else {
    let trlPart = ''
    if (
      summary.developerFeasibility.trlCurrent !== null ||
      summary.developerFeasibility.trlTarget !== null
    ) {
      const c = summary.developerFeasibility.trlCurrent
      const t = summary.developerFeasibility.trlTarget
      let trlVal = ''
      if (c !== null) {
        trlVal = `${c}${t !== null ? ` → ${t}` : ''}`
      } else if (t !== null) {
        trlVal = `target ${t}`
      }
      trlPart = `<div><span>TRL</span> <span>${trlVal}</span></div>`
    }
    const taskLevelHtml =
      summary.userExpectations.taskCount > 0
        ? `<div class="mt-2">
             <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Task-level feasibility: ${summary.developerFeasibility.tasksWithDedicatedFeasibility.length} of ${summary.userExpectations.taskCount} tasks</p>
             <div class="canvas-feasibility-bar"><div class="canvas-feasibility-fill" style="width:${feasibilityProgress}%"></div></div>
           </div>`
        : ''
    feasibilityContent = `
      ${trlPart}
      ${summary.developerFeasibility.technicalRisk ? `<p>Risk: <span class="capitalize">${escapeHtml(summary.developerFeasibility.technicalRisk)}</span></p>` : ''}
      ${summary.developerFeasibility.effortEstimate ? `<p>Effort: ${escapeHtml(summary.developerFeasibility.effortEstimate)}</p>` : ''}
      ${summary.developerFeasibility.amortizationMonths != null ? `<p class="text-xs">~${summary.developerFeasibility.amortizationMonths.toFixed(1)} mo until amortization</p>` : ''}
      ${summary.developerFeasibility.feasibilityNotes ? `<p>${escapeHtml(summary.developerFeasibility.feasibilityNotes)}</p>` : ''}
      ${taskLevelHtml}
    `
  }

  let outcomesContent = ''
  if (isEmptyOutcomes(summary.outcomes)) {
    outcomesContent = '<p class="italic text-gray-400">Not specified</p>'
  } else {
    const parts: string[] = []
    if (summary.outcomes.deliverables.length) {
      parts.push(`
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">${summary.outcomes.deliverableCount} ${summary.outcomes.deliverableCount === 1 ? 'deliverable' : 'deliverables'}</p>
        <ul class="list-none space-y-0.5 text-xs">
          ${summary.outcomes.deliverables
            .map((d) =>
              isLink(d.pid)
                ? `<li><a href="${escapeHtml(d.pid!)}" target="_blank" rel="noopener noreferrer" class="text-gray-700 hover:underline">${escapeHtml(d.title)}</a></li>`
                : `<li><span>${escapeHtml(d.title)}</span></li>`
            )
            .join('')}
        </ul>
      `)
    }
    if (summary.outcomes.publications.length) {
      parts.push(`
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">${summary.outcomes.publicationCount} ${summary.outcomes.publicationCount === 1 ? 'publication' : 'publications'}</p>
        <ul class="list-none space-y-0.5 text-xs">
          ${summary.outcomes.publications
            .map((p) =>
              isLink(p.doi)
                ? `<li><a href="${escapeHtml(p.doi!)}" target="_blank" rel="noopener noreferrer" class="text-gray-700 hover:underline">${escapeHtml(p.title)}</a></li>`
                : `<li><span>${escapeHtml(p.title)}</span></li>`
            )
            .join('')}
        </ul>
      `)
    }
    if (summary.outcomes.evaluations.length) {
      parts.push(`
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">${summary.outcomes.evaluationCount} ${summary.outcomes.evaluationCount === 1 ? 'evaluation' : 'evaluations'}</p>
        <ul class="list-none space-y-0.5 text-xs">
          ${summary.outcomes.evaluations
            .map((e) => `<li><span class="font-medium">${escapeHtml(e.type)}</span>${e.results ? ` <span class="text-gray-600">— ${escapeHtml(e.results)}</span>` : ''}</li>`)
            .join('')}
        </ul>
      `)
    }
    outcomesContent = parts.join('')
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas Summary - ${escapeHtml(summary.project.title || 'Agentic Automation Project')}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 1rem; color: #1f2937; }
    .canvas-bmc-wrapper { max-width: 1100px; margin: 0 auto; background: white; border: 4px solid black; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
    .canvas-bmc-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 2px solid black; }
    .canvas-bmc-grid { display: grid; grid-template-columns: repeat(3, 1fr); min-height: 320px; }
    @media (max-width: 767px) { .canvas-bmc-grid { grid-template-columns: 1fr; } .canvas-bmc-col { border-right: none !important; border-bottom: 2px solid black; } .canvas-bmc-col:last-child { border-bottom: none; } }
    .canvas-bmc-col { display: flex; flex-direction: column; border-right: 2px solid black; }
    .canvas-bmc-col:last-child { border-right: none; }
    .canvas-bmc-block { flex: 1; padding: 0.5rem 1rem 1rem; display: flex; flex-direction: column; }
    .canvas-bmc-block-title { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; padding-top: 0.125rem; padding-bottom: 0.35rem; border-bottom: 1px solid rgb(209 213 219); display: flex; align-items: center; gap: 0.5rem; justify-content: space-between; color: #111827; }
    .canvas-bmc-block-title .icon { color: #374151; margin-left: auto; }
    .canvas-bmc-content { font-size: 0.875rem; color: #1f2937; min-height: 4rem; }
    .canvas-bmc-content p { margin: 0.25rem 0; }
    .canvas-bmc-content .space-y-1\\.5 > * + * { margin-top: 0.375rem; }
    .canvas-bmc-content .space-y-2 > * + * { margin-top: 0.5rem; }
    .canvas-bmc-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.5rem 1.25rem; border-top: 2px solid black; font-size: 0.75rem; color: #6b7280; }
    .text-xl { font-size: 1.25rem; }
    .font-semibold { font-weight: 600; }
    .text-gray-900 { color: #111827; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-700 { color: #374151; }
    .text-gray-400 { color: #9ca3af; }
    .text-xs { font-size: 0.75rem; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .uppercase { text-transform: uppercase; }
    .capitalize { text-transform: capitalize; }
    .italic { font-style: italic; }
    .border-l-2 { border-left-width: 2px; }
    .border-black { border-color: black; }
    .pl-2 { padding-left: 0.5rem; }
    .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
    .px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
    .border { border-width: 1px; }
    .gap-1 { gap: 0.25rem; }
    .flex { display: flex; }
    .flex-wrap { flex-wrap: wrap; }
    .mt-0\\.5 { margin-top: 0.125rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mb-0\\.5 { margin-bottom: 0.125rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .list-none { list-style: none; padding: 0; margin: 0; }
    .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
    .user-story-formulaic { color: rgb(156 163 175); font-weight: 400; }
    .user-story-content { color: rgb(75 85 99); font-weight: 500; }
    .canvas-feasibility-bar { height: 0.625rem; background: #d1d5db; border: 1px solid #6b7280; border-radius: 0.125rem; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.15); }
    .canvas-feasibility-fill { height: 100%; background: linear-gradient(180deg, #374151 0%, #1f2937 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.1); }
    a { color: #374151; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media print { .canvas-bmc-wrapper { break-inside: avoid; page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="canvas-bmc-wrapper">
    <div class="canvas-bmc-header">
      <h3 class="text-xl font-semibold text-gray-900">The Agentic Automation Canvas</h3>
      <div class="text-xl">
        <span class="font-semibold text-gray-900">Design for:</span>
        <span class="text-gray-500" style="margin-left: 0.25rem;">${escapeHtml(projectTitle)}</span>
      </div>
    </div>
    <div class="canvas-bmc-grid">
      <div class="canvas-bmc-col">
        <div class="canvas-bmc-block" style="border-bottom: 2px solid black;">
          <h4 class="canvas-bmc-block-title">Project Definition <span class="icon">${BLOCK_ICONS.project}</span></h4>
          <div class="canvas-bmc-content">${projectContent}</div>
        </div>
        <div class="canvas-bmc-block">
          <h4 class="canvas-bmc-block-title">Governance <span class="icon">${BLOCK_ICONS.governance}</span></h4>
          <div class="canvas-bmc-content">${governanceContent}</div>
        </div>
      </div>
      <div class="canvas-bmc-col">
        <div class="canvas-bmc-block" style="flex: 2; border-bottom: 2px solid black;">
          <h4 class="canvas-bmc-block-title">User Expectations <span class="icon">${BLOCK_ICONS.expectations}</span></h4>
          <div class="canvas-bmc-content">${expectationsContent}</div>
        </div>
        <div class="canvas-bmc-block" style="flex: 1;">
          <h4 class="canvas-bmc-block-title">Data Access <span class="icon">${BLOCK_ICONS.data}</span></h4>
          <div class="canvas-bmc-content">${dataAccessContent}</div>
        </div>
      </div>
      <div class="canvas-bmc-col">
        <div class="canvas-bmc-block" style="border-bottom: 2px solid black;">
          <h4 class="canvas-bmc-block-title">Developer Feasibility <span class="icon">${BLOCK_ICONS.feasibility}</span></h4>
          <div class="canvas-bmc-content">${feasibilityContent}</div>
        </div>
        <div class="canvas-bmc-block">
          <h4 class="canvas-bmc-block-title">Outcomes <span class="icon">${BLOCK_ICONS.outcomes}</span></h4>
          <div class="canvas-bmc-content">${outcomesContent}</div>
        </div>
      </div>
    </div>
    <div class="canvas-bmc-footer">
      <span>Date: ${escapeHtml(date)} · Version: ${escapeHtml(version)}</span>
      <span>Generated by the Agentic Automation Canvas · <a href="https://aac.slolab.ai" target="_blank" rel="noopener noreferrer">https://aac.slolab.ai</a></span>
    </div>
  </div>
</body>
</html>`
}
