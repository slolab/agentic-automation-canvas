# Core Concepts

This section describes the fundamental concepts and entities in the Agentic Automation Canvas.

## Canvas

A **canvas** is the complete data structure that captures all information about an agentic automation project. It consists of multiple sections:

- Project definition
- User expectations (requirements and stakeholders)
- Developer feasibility assessment
- Governance structure
- Data access information
- Outcomes (deliverables, publications, evaluations)

The canvas serves as both a human-readable planning document and a machine-readable specification that can be validated, transformed, and exported as an RO-Crate.

## Task

A **task** represents a specific unit of work that the agentic system will perform. Tasks are captured as **requirements** in the user expectations section. Each requirement includes:

- Title and description
- User story
- Priority and status
- Volume (units per month)
- Time unit standardization (minutes or hours)
- Baseline performance metrics
- Expected benefits (time, quality, risk, enablement, cost)
- Associated stakeholders (per-task, referenced by Person ID)

Tasks are the fundamental building blocks for understanding what the agentic system will do and measuring its impact.

## Contract

The **contract** between users and developers is captured through:

- **User Expectations**: What users need and expect from the system (requirements, benefits, per-task stakeholders)
- **Developer Feasibility**: Technical assessment at project and task levels
  - **Project-level**: Simple, generic defaults (TRL, overall risk, effort estimate) that apply to all tasks
  - **Task-level**: Optional detailed feasibility assessments for individual tasks that override project defaults

This contract ensures alignment between what users want and what developers can deliver, including:

- Benefit metrics and expected improvements (time, quality, risk, enablement, cost)
- Human oversight requirements (for time benefits)
- Technical risk levels (project-level and per-task)
- Technology Readiness Levels (TRL)
- Model selection and baseline capabilities (per-task)
- Implementation difficulty assessments (per-task)

## Evaluation

**Evaluation** captures how the agentic system's performance will be measured and validated. This includes:

- Evaluation plans in the outcomes section
- Metrics for measuring success
- Comparison against baseline performance
- Validation and monitoring requirements

Evaluations ensure that the system meets its intended goals and that actual gains can be compared against initial expectations.

## Provenance

**Provenance** tracks the origin, history, and governance of the agentic automation project. This includes:

- **Governance Stages**: Phases of development (planning, prototype, deployment) with associated agents and milestones
- **Agents**: People, organizations, or software systems involved in the project
- **Activities**: Governance activities and their relationships
- **Data Provenance**: Sources and access rights for datasets used

Provenance information is essential for understanding who is responsible for what, when activities occurred, and how the project evolved over time.

## Person Identity

All persons involved in the project are managed in a centralized `persons` array. Each person has:

- Unique identifier
- Name and optional affiliation
- Functional roles (from controlled vocabulary)
- Optional local titles and ORCID

Persons are referenced by ID throughout the canvas (as stakeholders, agents, creators), ensuring consistent identity management and enabling role aggregation across projects.

## Benefit Metrics

**Benefit metrics** quantify the expected improvements from the agentic automation system. Benefits are categorized into five types:

- **Time**: Reduction in time spent on tasks
- **Quality**: Improvement in output quality or error rates
- **Risk**: Reduction in risks or incidents
- **Enablement**: New capabilities or functionalities enabled
- **Cost**: Reduction in operational, development, or infrastructure costs

Each benefit includes baseline and expected values, confidence levels, and assumptions. Time benefits may include human oversight values (per unit or per month) which are subtracted from gross time savings. Benefits can be aggregated at the project level to provide overall impact metrics.

## Governance Stages

**Governance stages** represent phases of the project lifecycle (e.g., planning, prototype, deployment). Each stage includes:

- Start and end dates
- Agents (people, organizations, or software) responsible
- Milestones to be achieved
- Compliance standards to meet

Stages ensure proper oversight and accountability throughout the project lifecycle.

## Data Access

**Data access** information captures metadata about datasets used by the agentic system, including:

- Dataset titles, descriptions, and formats
- Access rights and sensitivity levels
- DUO (Data Use Ontology) terms for restrictions
- Personal data indicators
- Persistent identifiers (PIDs)

This information is critical for data protection strategy and compliance with data governance requirements.
