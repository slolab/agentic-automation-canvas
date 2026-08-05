export const V2_FORMAT = 'aac-v2' as const
export const V2_FRAMEWORK_VERSION = '2.0-draft.5'

export interface V2PromptDefinition {
  id: string
  question: string
  guidance: string
  perspective: 'user' | 'developer' | 'shared'
}

export interface V2BlockInsight {
  title: string
  body: string
  bullets?: readonly string[]
}

export interface V2BlockDefinition {
  id: string
  number: number
  title: string
  tooltip: string
  info: {
    lead: string
    sections: readonly V2BlockInsight[]
  }
  prompts: readonly V2PromptDefinition[]
}

export const V2_BLOCKS = [
  {
    id: 'work_today',
    number: 1,
    title: 'Work today',
    tooltip: 'A recent case exposes the real users, hidden work, and evidence the project must beat.',
    info: {
      lead: 'Begin with a real case, not a generic workflow. The output is a named user, a bounded problem, and a baseline grounded in evidence.',
      sections: [
        {
          title: 'Follow the work, not the process diagram',
          body: 'Trace the most recent case from trigger to result. Include tools, data, handoffs, waiting, review, rework, exceptions, and informal workarounds—the details a clean process description normally hides.',
        },
        {
          title: 'Force a boundary',
          body: 'Name the exact failure or burden to address and the first part of the workflow in scope. Explicit exclusions prevent one project from quietly becoming several.',
          bullets: [
            'Name a real user rather than “researchers” or “the lab.”',
            'Separate the costly problem from the proposed technology.',
            'Record what will deliberately remain outside this investigation.',
          ],
        },
        {
          title: 'Do not manufacture a baseline',
          body: 'Ask for frequency, volume, and cost per case, including review and rework. If the evidence does not exist, define who will measure what and over which cases.',
        },
      ],
    },
    prompts: [
      {
        id: 'project_description',
        question: 'What is this project about?',
        guidance: 'Describe the work or service, the concrete problem, and the part this project will address in 2–3 sentences.',
        perspective: 'user',
      },
      {
        id: 'current_people',
        question: 'Who actually does this work today?',
        guidance: 'Name the first person or team, who receives the result, and who contributes or approves.',
        perspective: 'user',
      },
      {
        id: 'recent_case',
        question: 'What happened in the most recent real case?',
        guidance: 'Trace the trigger, inputs, people, tools, data, handoffs, review, rework, and output.',
        perspective: 'user',
      },
      {
        id: 'problem_baseline',
        question: 'How large is the problem?',
        guidance: 'Give frequency, volume, and cost per case; cite the source or name how the baseline will be measured.',
        perspective: 'shared',
      },
    ],
  },
  {
    id: 'change',
    number: 2,
    title: 'Change',
    tooltip: 'A useful change rewrites the same real case without smuggling in a preferred solution.',
    info: {
      lead: 'Describe the future work before discussing technology. The output is an observable change with a reason to act and clear non-negotiables.',
      sections: [
        {
          title: 'Rewrite the same case',
          body: 'Return to the recent case from section one. Identify which steps, decisions, handoffs, delays, or outputs should be different and who would experience the difference.',
        },
        {
          title: 'Establish a reason to act',
          body: 'A persistent inconvenience is not automatically a project. Name the consequence, opportunity, deadline, policy change, or strategic commitment that makes this work worth prioritizing now.',
        },
        {
          title: 'Protect what matters',
          body: 'State what must not be lost while the workflow changes. This includes scientific quality, safety, accountability, user autonomy, traceability, and decisions that must remain human.',
        },
      ],
    },
    prompts: [
      {
        id: 'desired_change',
        question: 'What should happen differently in the next real case?',
        guidance: 'Describe which steps, decisions, handoffs, or outputs should change, for whom—without proposing a solution.',
        perspective: 'user',
      },
      {
        id: 'change_priority',
        question: 'Why is this change important enough to act on now?',
        guidance: 'Name the consequence, opportunity, sponsor, strategic commitment, or deadline that makes this work a priority.',
        perspective: 'shared',
      },
      {
        id: 'change_tradeoffs',
        question: 'What trade-offs are acceptable, and what must not be sacrificed?',
        guidance: 'Decide which quality, safety, accountability, autonomy, traceability, or human responsibility is non-negotiable.',
        perspective: 'shared',
      },
    ],
  },
  {
    id: 'solutions',
    number: 3,
    title: 'Solutions',
    tooltip: 'Past attempts and new enabling conditions reveal whether an agent is a reasoned choice or a wish.',
    info: {
      lead: 'Make user expectations and expert knowledge visible before selecting an approach. Agentic AI is one candidate, not the premise of the project.',
      sections: [
        {
          title: 'Interrogate prior attempts',
          body: 'For every tool, workaround, pilot, or abandoned project, record what was tried, what was observed, and why it was kept, changed, or stopped. Failure evidence is often more useful than a feature list.',
        },
        {
          title: 'Separate change from optimism',
          body: 'Ask what is genuinely different now: new data, models, infrastructure, access, policy, skills, or budget. Distinguish verified enabling conditions from assumptions.',
        },
        {
          title: 'Challenge the preferred answer',
          body: 'Compare process changes, human services, existing products, scripts, conventional ML, and agentic systems. Recommend the smallest credible tests and rule out approaches with explicit reasons.',
          bullets: [
            'Stable rules usually favor deterministic automation.',
            'Existing products deserve a real trial before custom development.',
            'Agents must demonstrate value beyond orchestration and generated prose.',
          ],
        },
      ],
    },
    prompts: [
      {
        id: 'prior_attempts',
        question: 'What have you already tried, and what happened?',
        guidance: 'For each attempt, record the result or observation and why it was kept, changed, or stopped.',
        perspective: 'user',
      },
      {
        id: 'why_now',
        question: 'Why do you believe a better solution is possible now?',
        guidance: 'Name what changed in data, technology, access, skills, policy, infrastructure, or budget—and what evidence supports it.',
        perspective: 'user',
      },
      {
        id: 'desired_agent_approaches',
        question: 'Which AI or agentic approaches do you want to try, and what do you expect each to improve?',
        guidance: 'Expose the proposed approaches and assumptions before deciding whether they are appropriate.',
        perspective: 'user',
      },
      {
        id: 'available_solutions',
        question: 'What solutions already exist, and which are actually credible here?',
        guidance: 'Compare process changes, services, tools, scripts, conventional ML, and agents; recommend the smallest credible tests.',
        perspective: 'developer',
      },
    ],
  },
  {
    id: 'development_reality',
    number: 4,
    title: 'Development reality',
    tooltip: 'Data access, legal basis, execution environment, and committed owners usually decide feasibility.',
    info: {
      lead: 'Treat biomedical and public-sector constraints as design inputs. A compelling prototype is irrelevant if it cannot lawfully access representative data or be operated by the committed team.',
      sections: [
        {
          title: 'Inspect the real data',
          body: 'Development samples and production data may differ in size, quality, sensitivity, and access. Record owners, locations, formats, volumes, legal basis, personal data, retention rules, and whether a representative sample is available.',
        },
        {
          title: 'Trace the approval and execution chain',
          body: 'Identify where the system would run, what it connects to, how identities and credentials work, and which security, GDPR, procurement, licensing, or governance approvals are required.',
        },
        {
          title: 'Demand real commitment',
          body: 'Name the people who will build, review, operate, and maintain the capability. Record time, budget, and the post-pilot owner; interest without committed capacity is a constraint, not a plan.',
        },
      ],
    },
    prompts: [
      {
        id: 'data_reality',
        question: 'What data would be used in development and in real operation?',
        guidance: 'Name owners, locations, size, format, quality, sensitivity, personal data, legal basis, and whether a representative sample is accessible.',
        perspective: 'user',
      },
      {
        id: 'execution_reality',
        question: 'Where would it run, and what must it connect to?',
        guidance: 'Name compute, networks, systems, identities, credentials, licenses, procurement, and operational dependencies.',
        perspective: 'user',
      },
      {
        id: 'blocking_constraints',
        question: 'Which technical, legal, security, or organizational constraint could block this?',
        guidance: 'State the constraint, current evidence or approval status, and who can resolve or confirm it.',
        perspective: 'user',
      },
      {
        id: 'delivery_commitment',
        question: 'Who will build, review, operate, and maintain it—and what time is actually committed?',
        guidance: 'Name people, responsibilities, time or budget, decision authority, and who owns the capability after a pilot.',
        perspective: 'user',
      },
    ],
  },
  {
    id: 'value_and_evidence',
    number: 5,
    title: 'Value and evidence',
    tooltip: 'Benefits require changed work; metrics need baselines, targets, owners, guardrails, and review costs.',
    info: {
      lead: 'Connect the desired change to the organizational conditions that produce value, then define evidence strong enough to continue, redirect, or stop.',
      sections: [
        {
          title: 'Trace how value appears',
          body: 'Use the chain: capability → enabling changes → changed work → benefit. Name the accountable person at the links that depend on adoption, training, access, process ownership, or support.',
        },
        {
          title: 'Make metrics decision-grade',
          body: 'Use a small set of metrics with definitions, baselines, targets, data sources, owners, and review dates. Include early progress signals and outcome measures rather than a single headline number.',
        },
        {
          title: 'Subtract the hidden cost',
          body: 'Pair benefit metrics with quality and safety guardrails. Any time or cost saving must subtract operation, human review, correction, exception handling, and ongoing maintenance.',
        },
      ],
    },
    prompts: [
      {
        id: 'enabling_changes',
        question: 'What must change around the technology before the benefit can appear—and who owns each change?',
        guidance: 'Name changed practices, training, access, process, support, accountable people, and what happens if any are missing.',
        perspective: 'shared',
      },
      {
        id: 'scientific_value',
        question: 'What scientific value should this create?',
        guidance: 'Name the scientific insight, capability, quality, reproducibility, or reliability this should improve—not only time or convenience.',
        perspective: 'shared',
      },
      {
        id: 'progress_metrics',
        question: 'Which metrics will track progress and decide whether the change is valuable?',
        guidance: 'Define 2–4 metrics with baseline, target, source, owner, and review date; include guardrails, net review effort, and a threshold to stop or reshape the MVP.',
        perspective: 'shared',
      },
    ],
  },
  {
    id: 'mvp',
    number: 6,
    title: 'MVP',
    tooltip: 'The MVP section turns discovery into a bounded build, user stories, and a concrete collaboration setup.',
    info: {
      lead: 'This is the shared working agreement for the first MVP. Users and developers should leave knowing the scope, expected user outcomes, and how they will build and test together.',
      sections: [
        {
          title: 'Choose one bounded slice',
          body: 'Name the first user, trigger, input, start and end of the workflow, expected output, and explicit exclusions. Do not hide several user groups or workflows inside one MVP.',
        },
        {
          title: 'Write testable user stories',
          body: 'Describe what the named user must be able to achieve and why. Tie stories to the human boundary and metrics already agreed; avoid architecture and feature inventories.',
        },
        {
          title: 'Make collaboration concrete',
          body: 'Agree where code, test data, documentation, issues, and feedback will live. Name access owners, test users, testing cadence, review responsibilities, and how decisions and handovers will happen.',
        },
      ],
    },
    prompts: [
      {
        id: 'mvp_scope',
        question: 'Which named user and workflow slice will the first MVP cover?',
        guidance: 'State the trigger, input, start and end, expected output, and what is explicitly outside scope.',
        perspective: 'shared',
      },
      {
        id: 'mvp_user_stories',
        question: 'What must that user be able to achieve in the MVP?',
        guidance: 'Write 2–4 user stories as “As…, I can…, so that…” and connect them to the agreed metrics and human boundary.',
        perspective: 'user',
      },
      {
        id: 'mvp_collaboration',
        question: 'How will users and developers work together during the MVP?',
        guidance: 'Agree the shared GitHub repository, test-data storage and access, environments, who tests what and when, and how issues, feedback, and decisions are recorded.',
        perspective: 'shared',
      },
      {
        id: 'prebuild_resolutions',
        question: 'What must be resolved before a first build or test can start?',
        guidance: 'Name each unresolved question or blocker, who can answer it, and the next concrete check or decision.',
        perspective: 'shared',
      },
    ],
  },
] as const satisfies readonly V2BlockDefinition[]

export type V2Block = (typeof V2_BLOCKS)[number]
export type V2Prompt = V2Block['prompts'][number]
export type V2PromptId = V2Prompt['id']

export const V2_PROMPTS = V2_BLOCKS.reduce<V2Prompt[]>((prompts, block) => {
  prompts.push(...(block.prompts as readonly V2Prompt[]))
  return prompts
}, [])
