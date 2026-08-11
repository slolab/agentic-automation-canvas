<template>
  <div class="v2-shell">
    <header class="v2-header">
      <div class="v2-brand">
        <a class="v2-back" href="../" aria-label="Open the current AAC">
          <span class="v2-mark" aria-hidden="true">AAC</span>
        </a>
        <div class="v2-title-row">
          <h1>Agentic Automation Canvas</h1>
        </div>
      </div>

      <div class="v2-actions">
        <span class="v2-save-note">Saved in this browser</span>
        <button class="v2-button v2-button-quiet" type="button" @click="startFresh">
          Start fresh
        </button>
        <button class="v2-button v2-button-quiet" type="button" @click="openImport">
          Reopen
        </button>
        <button class="v2-button v2-button-primary" type="button" @click="exportCanvas">
          Export RO-Crate
        </button>
        <input
          ref="fileInput"
          class="v2-file-input"
          type="file"
          accept=".zip,application/zip"
          @change="importCanvas"
        />
      </div>
    </header>

    <section class="v2-context" aria-label="Session context">
      <label class="v2-project-label" for="v2-project-title">Working title</label>
      <input
        id="v2-project-title"
        class="v2-project-input"
        type="text"
        :value="canvas.projectTitle"
        placeholder="Name this project so the room can point to it"
        @input="updateProjectTitle"
      />
    </section>

    <p v-if="notice" class="v2-notice" role="status">{{ notice }}</p>

    <main class="v2-canvas" aria-label="AAC v2 project foundation">
      <section
        v-for="block in V2_BLOCKS"
        :key="block.id"
        class="v2-block"
        :class="`v2-block-${block.id}`"
      >
        <header class="v2-block-header">
          <span class="v2-block-number">{{ block.number }}</span>
          <h2>{{ block.title }}</h2>
          <V2InfoButton
            :label="`Open guidance for ${block.title}`"
            :tooltip="block.tooltip"
            @open="openBlockInfo(block, $event)"
          />
        </header>

        <div class="v2-prompts">
          <div v-for="prompt in block.prompts" :key="prompt.id" class="v2-prompt">
            <div class="v2-question-row">
              <label :for="`v2-${prompt.id}`">{{ prompt.question }}</label>
              <span
                v-if="prompt.perspective !== 'shared'"
                class="v2-perspective"
                :class="`v2-perspective-${prompt.perspective}`"
              >
                {{ perspectiveLabel(prompt.perspective) }}
              </span>
            </div>
            <textarea
              :id="`v2-${prompt.id}`"
              rows="2"
              :value="canvas.answers[prompt.id]"
              :placeholder="prompt.guidance"
              @input="updateAnswer(prompt.id, $event)"
            />
          </div>
        </div>
      </section>
    </main>

    <Teleport to="body">
      <Transition name="v2-panel">
        <div
          v-if="activeInfoBlock"
          class="v2-panel-backdrop"
          @click.self="closeBlockInfo"
        >
          <aside
            class="v2-info-panel"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`v2-panel-title-${activeInfoBlock.id}`"
          >
            <header class="v2-info-panel-header">
              <div>
                <span class="v2-info-panel-kicker">
                  Section {{ activeInfoBlock.number }}
                </span>
                <h2 :id="`v2-panel-title-${activeInfoBlock.id}`">
                  {{ activeInfoBlock.title }}
                </h2>
              </div>
              <button
                ref="panelCloseButton"
                class="v2-panel-close"
                type="button"
                aria-label="Close guidance"
                @click="closeBlockInfo"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <div class="v2-info-panel-content">
              <p class="v2-info-panel-lead">{{ activeInfoBlock.info.lead }}</p>

              <section
                v-for="insight in activeInfoBlock.info.sections"
                :key="insight.title"
                class="v2-insight"
              >
                <h3>{{ insight.title }}</h3>
                <p>{{ insight.body }}</p>
                <ul v-if="insight.bullets">
                  <li v-for="bullet in insight.bullets" :key="bullet">
                    {{ bullet }}
                  </li>
                </ul>
              </section>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  V2_BLOCKS,
  type V2BlockDefinition,
  type V2PromptId,
  type V2PromptDefinition,
} from './framework'
import V2InfoButton from './V2InfoButton.vue'
import {
  clearV2Draft,
  createEmptyV2Canvas,
  loadV2Draft,
  saveV2Draft,
} from './storage'
import { downloadV2ROCrate, importV2ROCrate } from './rocrate'

const canvas = ref(createEmptyV2Canvas())
const fileInput = ref<HTMLInputElement | null>(null)
const activeInfoBlock = ref<V2BlockDefinition | null>(null)
const panelCloseButton = ref<HTMLButtonElement | null>(null)
const notice = ref('')
let noticeTimer: ReturnType<typeof setTimeout> | undefined
let infoTrigger: HTMLButtonElement | null = null
let previousBodyOverflow = ''

onMounted(() => {
  canvas.value = loadV2Draft()
})

watch(
  canvas,
  (value) => {
    saveV2Draft(value)
  },
  { deep: true },
)

function markUpdated(): void {
  canvas.value.updatedAt = new Date().toISOString()
}

function updateProjectTitle(event: Event): void {
  canvas.value.projectTitle = (event.target as HTMLInputElement).value
  markUpdated()
}

function updateAnswer(promptId: V2PromptId, event: Event): void {
  canvas.value.answers[promptId] = (event.target as HTMLTextAreaElement).value
  markUpdated()
}

function perspectiveLabel(
  perspective: V2PromptDefinition['perspective'],
): string {
  if (perspective === 'user') return 'USER'
  if (perspective === 'developer') return 'DEV'
  return ''
}

async function openBlockInfo(
  block: V2BlockDefinition,
  trigger: HTMLButtonElement,
): Promise<void> {
  activeInfoBlock.value = block
  infoTrigger = trigger
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  await nextTick()
  panelCloseButton.value?.focus()
}

function closeBlockInfo(): void {
  if (!activeInfoBlock.value) return
  activeInfoBlock.value = null
  document.body.style.overflow = previousBodyOverflow
  nextTick(() => {
    infoTrigger?.focus()
    infoTrigger = null
  })
}

function handleGlobalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closeBlockInfo()
}

function showNotice(message: string): void {
  notice.value = message
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = ''
  }, 5000)
}

function hasCanvasContent(): boolean {
  return Boolean(
    canvas.value.projectTitle.trim() ||
      Object.values(canvas.value.answers).some((answer) => answer.trim()),
  )
}

function startFresh(): void {
  if (
    hasCanvasContent() &&
    !confirm('Start a fresh AAC v2 canvas? Export first if you want to keep this version.')
  ) {
    return
  }
  clearV2Draft()
  canvas.value = createEmptyV2Canvas()
  showNotice('Fresh canvas ready.')
}

function openImport(): void {
  fileInput.value?.click()
}

async function importCanvas(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (
    hasCanvasContent() &&
    !confirm('Reopen this RO-Crate and replace the canvas currently in the browser?')
  ) {
    return
  }

  try {
    canvas.value = await importV2ROCrate(file)
    markUpdated()
    showNotice(`Reopened “${canvas.value.projectTitle || 'Untitled project'}”.`)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : 'The RO-Crate could not be reopened.')
  }
}

async function exportCanvas(): Promise<void> {
  try {
    await downloadV2ROCrate(canvas.value)
    showNotice('RO-Crate exported. Partial canvases are welcome.')
  } catch (error) {
    showNotice(error instanceof Error ? error.message : 'The RO-Crate could not be exported.')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  document.body.style.overflow = previousBodyOverflow
  if (noticeTimer) clearTimeout(noticeTimer)
})
</script>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  height: 100%;
  margin: 0;
}

:global(html) {
  overflow: hidden;
}

:global(body) {
  background: #f3f1ec;
}

button,
input,
textarea {
  font: inherit;
}

.v2-shell {
  --ink: #17201e;
  --muted: #5e6965;
  --line: #c9cec9;
  --paper: #fffefa;
  --accent: #146c5b;
  --accent-soft: #dceee8;
  display: flex;
  height: 100vh;
  min-height: 720px;
  flex-direction: column;
  overflow: hidden;
  color: var(--ink);
  background:
    radial-gradient(circle at 12% -10%, rgba(255, 255, 255, 0.95), transparent 34%),
    #f3f1ec;
}

.v2-header {
  display: flex;
  min-height: 68px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 10px 20px;
  border-bottom: 1px solid #d7d7d1;
  background: rgba(255, 254, 250, 0.94);
}

.v2-brand,
.v2-title-row,
.v2-actions,
.v2-context,
.v2-question-row {
  display: flex;
  align-items: center;
}

.v2-brand {
  min-width: 0;
  gap: 12px;
}

.v2-back {
  color: inherit;
  text-decoration: none;
}

.v2-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 11px;
  background: var(--ink);
  color: #fffefa;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.v2-title-row {
  flex-wrap: wrap;
  gap: 9px;
}

.v2-title-row h1 {
  margin: 0;
  font-size: clamp(17px, 1.45vw, 22px);
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.v2-actions {
  flex-shrink: 0;
  gap: 7px;
}

.v2-save-note {
  margin-right: 4px;
  color: #707974;
  font-size: 11px;
}

.v2-button {
  min-height: 35px;
  padding: 0 12px;
  border: 1px solid #aeb6b1;
  border-radius: 7px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
}

.v2-button:hover {
  transform: translateY(-1px);
}

.v2-button:focus-visible,
.v2-project-input:focus,
.v2-prompt textarea:focus {
  outline: 3px solid rgba(20, 108, 91, 0.2);
  outline-offset: 1px;
}

.v2-button-quiet {
  color: #34403c;
  background: #fffefa;
}

.v2-button-quiet:hover {
  border-color: #74817b;
  background: #f7f6f1;
}

.v2-button-primary {
  border-color: var(--accent);
  color: white;
  background: var(--accent);
}

.v2-button-primary:hover {
  background: #0d5a4b;
}

.v2-file-input {
  display: none;
}

.v2-context {
  min-height: 58px;
  gap: 10px;
  padding: 9px 20px;
  border-bottom: 1px solid #d7d7d1;
  background: rgba(243, 241, 236, 0.8);
}

.v2-project-label {
  flex-shrink: 0;
  color: #52605b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.v2-project-input {
  width: min(760px, 62vw);
  min-width: 230px;
  padding: 8px 10px;
  border: 1px solid #acb5b0;
  border-radius: 6px;
  color: var(--ink);
  background: var(--paper);
  font-size: 13px;
  font-weight: 650;
}

.v2-notice {
  position: fixed;
  z-index: 20;
  top: 76px;
  right: 20px;
  max-width: min(440px, calc(100vw - 40px));
  margin: 0;
  padding: 9px 12px;
  border: 1px solid #85aa9f;
  border-radius: 7px;
  box-shadow: 0 8px 24px rgba(35, 52, 47, 0.15);
  color: #174f42;
  background: #eff9f5;
  font-size: 12px;
  font-weight: 650;
}

.v2-canvas {
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-areas:
    'work change solutions'
    'development value mvp';
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 14px 14px;
}

.v2-block {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-top: 3px solid #60746d;
  border-radius: 8px;
  box-shadow: 0 2px 7px rgba(31, 43, 39, 0.06);
  background: var(--paper);
}

.v2-block-work_today { grid-area: work; border-top-color: #2d7564; }
.v2-block-change { grid-area: change; border-top-color: #9a6955; }
.v2-block-solutions { grid-area: solutions; border-top-color: #6f7190; }
.v2-block-development_reality { grid-area: development; border-top-color: #3f6f8a; }
.v2-block-value_and_evidence { grid-area: value; border-top-color: #31705f; }
.v2-block-mvp { grid-area: mvp; border-top-color: #8d643a; }

.v2-block-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-bottom: 1px solid #e1e3de;
  background: #f8f8f4;
}

.v2-block-number {
  display: grid;
  width: 23px;
  height: 23px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: #37433f;
  font-size: 11px;
  font-weight: 800;
}

.v2-block-header h2 {
  flex: 1;
  margin: 0;
  font-size: 14px;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.v2-prompts {
  min-height: 0;
  padding: 8px 9px 10px;
  overflow-y: scroll;
  overscroll-behavior: contain;
  scrollbar-color: #aeb9b3 #eef0ec;
  scrollbar-gutter: stable;
  scrollbar-width: auto;
}

.v2-prompts::-webkit-scrollbar {
  width: 9px;
}

.v2-prompts::-webkit-scrollbar-track {
  border-left: 1px solid #e1e4df;
  background: #f2f3ef;
}

.v2-prompts::-webkit-scrollbar-thumb {
  border: 2px solid #f2f3ef;
  border-radius: 999px;
  background: #aeb9b3;
}

.v2-prompts::-webkit-scrollbar-thumb:hover {
  background: #87958e;
}

.v2-prompt + .v2-prompt {
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px dashed #d9dcd7;
}

.v2-question-row {
  align-items: flex-start;
  gap: 6px;
}

.v2-question-row label {
  flex: 1;
  color: #202a27;
  font-size: 11.5px;
  font-weight: 750;
  line-height: 1.25;
}

.v2-perspective {
  flex-shrink: 0;
  padding: 2px 5px;
  border-radius: 999px;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.v2-perspective-user {
  color: #75432f;
  background: #f5e6df;
}

.v2-perspective-developer {
  color: #315b70;
  background: #e2edf3;
}

.v2-prompt textarea {
  display: block;
  width: 100%;
  min-height: 42px;
  max-height: 170px;
  margin-top: 6px;
  resize: vertical;
  field-sizing: content;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 6px 7px;
  border: 1px solid #c6ccc8;
  border-radius: 5px;
  color: #1f2926;
  background: #fff;
  font-size: 11px;
  line-height: 1.3;
}

.v2-prompt textarea:placeholder-shown {
  border-color: #c9ad79;
  background: #fffbf2;
}

.v2-prompt textarea:placeholder-shown:focus {
  border-color: #7c9189;
  background: #fff;
}

.v2-prompt textarea::-webkit-scrollbar {
  width: 8px;
}

.v2-prompt textarea::-webkit-scrollbar-thumb {
  border: 2px solid #fff;
  border-radius: 999px;
  background: #b7c0bb;
}

.v2-prompt textarea::placeholder,
.v2-project-input::placeholder {
  color: #a0a6a2;
  font-weight: 400;
}

.v2-panel-backdrop {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  background: rgba(22, 30, 28, 0.38);
  backdrop-filter: blur(1.5px);
}

.v2-info-panel {
  display: flex;
  width: min(470px, calc(100vw - 32px));
  height: 100%;
  flex-direction: column;
  border-left: 1px solid #b9c1bc;
  box-shadow: -18px 0 50px rgba(23, 32, 30, 0.2);
  color: #17201e;
  background: #fffefa;
}

.v2-info-panel-header {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 24px 19px;
  border-bottom: 1px solid #d9ddd8;
  background:
    radial-gradient(circle at 100% 0, rgba(220, 238, 232, 0.8), transparent 48%),
    #f8f8f4;
}

.v2-info-panel-kicker {
  color: #477064;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.v2-info-panel-header h2 {
  margin: 5px 0 0;
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.v2-panel-close {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  padding: 0;
  border: 1px solid #aeb7b2;
  border-radius: 50%;
  cursor: pointer;
  color: #42504b;
  background: #fffefa;
}

.v2-panel-close:hover,
.v2-panel-close:focus-visible {
  border-color: #146c5b;
  outline: none;
  color: #0d5a4b;
  background: #e8f4f0;
}

.v2-panel-close:focus-visible {
  box-shadow: 0 0 0 3px rgba(20, 108, 91, 0.18);
}

.v2-panel-close svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.v2-info-panel-content {
  min-height: 0;
  padding: 23px 24px 34px;
  overflow-y: auto;
}

.v2-info-panel-lead {
  margin: 0 0 23px;
  color: #27443b;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.45;
}

.v2-insight {
  padding: 18px 0;
  border-top: 1px solid #e0e3df;
}

.v2-insight h3 {
  margin: 0 0 7px;
  font-size: 13px;
  letter-spacing: -0.01em;
}

.v2-insight p,
.v2-insight li {
  color: #52605b;
  font-size: 12.5px;
  line-height: 1.55;
}

.v2-insight p {
  margin: 0;
}

.v2-insight ul {
  margin: 10px 0 0;
  padding-left: 18px;
}

.v2-insight li + li {
  margin-top: 5px;
}

.v2-panel-enter-active,
.v2-panel-leave-active {
  transition: background 170ms ease;
}

.v2-panel-enter-active .v2-info-panel,
.v2-panel-leave-active .v2-info-panel {
  transition: transform 190ms ease;
}

.v2-panel-enter-from,
.v2-panel-leave-to {
  background: rgba(22, 30, 28, 0);
}

.v2-panel-enter-from .v2-info-panel,
.v2-panel-leave-to .v2-info-panel {
  transform: translateX(100%);
}

@media (max-width: 1100px), (max-height: 719px) {
  :global(html) {
    overflow: auto;
  }

  .v2-shell {
    height: auto;
    min-height: 100%;
    overflow: visible;
  }

  .v2-header {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .v2-actions {
    flex-wrap: wrap;
  }

  .v2-save-note {
    display: none;
  }

  .v2-canvas {
    grid-template-areas:
      'work work'
      'change solutions'
      'development development'
      'value mvp';
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto;
  }

  .v2-block {
    min-height: 310px;
  }
}

@media (min-width: 1101px) and (max-height: 900px) {
  .v2-header {
    min-height: 60px;
    padding-block: 8px;
  }

  .v2-context {
    min-height: 50px;
    padding-block: 7px;
  }

  .v2-canvas {
    gap: 8px;
    padding: 8px 12px 12px;
  }
}

@media (max-width: 700px) {
  .v2-header,
  .v2-context {
    align-items: stretch;
    flex-direction: column;
  }

  .v2-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .v2-project-input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .v2-canvas {
    display: flex;
    flex-direction: column;
  }

  .v2-block {
    min-height: 300px;
  }

  .v2-info-panel {
    width: 100%;
  }
}
</style>
