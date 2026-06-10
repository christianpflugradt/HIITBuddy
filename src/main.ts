import { createDefaultConfig } from "./config/default-config.js";
import { CONFIG_QUERY_PARAMETER, createShareUrl, readConfigFromUrl } from "./domain/share-link.js";
import { type Exercise, type Person, type TimerSettings, type WorkoutConfig, type WorkoutSession } from "./domain/types.js";
import { START_LIMITS, START_VALIDATION_MESSAGES, TIMER_LIMITS } from "./domain/validation.js";
import { resolveAutoExerciseIcons } from "./icons/auto-icon-resolution.js";
import { AUTO_ICON_ID, findIconAssets, renderExerciseIcon } from "./icons/icon-registry.js";
import {
  addCustomExercise,
  addPerson,
  getStartValidation,
  removeCustomExercise,
  removePerson,
  setExerciseSelected,
  setPersonActive,
  updateTimerSetting
} from "./setup/setup-state.js";
import { createAssignmentsForConfig, getActivePeople, getSelectedExercises, getWorkIntervalsPerRound } from "./workout/scheduler.js";
import {
  advanceIfPhaseComplete,
  createWorkoutSession,
  extendCurrentPhase,
  finishWorkout,
  shouldShowRoundBreakAssignmentPreview,
  skipCurrentExercise,
  skipToRoundBreak
} from "./workout/session.js";
import { getTimerSnapshot } from "./workout/timer.js";
import { formatElapsedTime, getWorkoutSummary } from "./workout/summary.js";

type StatusTone = "neutral" | "success" | "danger";
type SetupStepId = "people" | "exercises" | "timer";
type AppMode = "start" | "setup";

const setupSteps: Array<{ id: SetupStepId; label: string }> = [
  { id: "people", label: "People" },
  { id: "exercises", label: "Exercises" },
  { id: "timer", label: "Timer" }
];

const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("HIITBuddy app root was not found.");
}

const hasConfigQueryParameter = (() => {
  try {
    return new URL(window.location.href).searchParams.has(CONFIG_QUERY_PARAMETER);
  } catch {
    return false;
  }
})();

let config: WorkoutConfig = (() => {
  try {
    return readConfigFromUrl(window.location.href);
  } catch {
    return createDefaultConfig();
  }
})();

let statusMessage = "";
let statusTone: StatusTone = "neutral";
let selectedDialogIconId = AUTO_ICON_ID;
let iconSearchQuery = "";
let pendingExerciseName = "";
let session: WorkoutSession | null = null;
let appMode: AppMode = hasConfigQueryParameter ? "setup" : "start";
let animationFrameId: number | null = null;
let lastRenderedSecond: number | null = null;
let lastRoundBreakPreviewVisible: boolean | null = null;
let setupStepIndex = 0;

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const nameCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base"
});

const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((first, second) => nameCollator.compare(first.name, second.name));

const setStatus = (message: string, tone: StatusTone = "neutral") => {
  statusMessage = message;
  statusTone = tone;
  render();
};

const getPersonCounts = () => {
  const active = config.people.filter((person) => person.active).length;
  const pooled = config.people.length - active;
  return { active, pooled };
};

const getSelectedExerciseCount = () => config.selectedExerciseIds.length;

const getExercisesForDisplay = () => [
  ...sortByName(config.exercises.filter((exercise) => exercise.builtIn)),
  ...sortByName(config.exercises.filter((exercise) => !exercise.builtIn))
];

const getCurrentSetupStep = () => setupSteps[setupStepIndex] ?? setupSteps[0]!;

const getSetupStepForIssue = (code: string): number => {
  if (code === "no_active_people" || code === "too_many_active_people") {
    return 0;
  }

  if (code === "no_exercises" || code === "too_many_people" || code === "too_many_exercises") {
    return 1;
  }

  return 2;
};

const renderIcon = (iconId: string, className = "exercise-icon") => renderExerciseIcon(iconId, { className });

const getSessionSnapshot = (workoutSession: WorkoutSession) =>
  getTimerSnapshot(
    {
      startedAt: workoutSession.phaseStartedAt,
      baseDurationSeconds: workoutSession.phaseDurationSeconds,
      addedSeconds: workoutSession.addedSeconds
    },
    performance.now()
  );

const formatPhase = (workoutSession: WorkoutSession) => {
  switch (workoutSession.phase) {
    case "round_start":
      return "Get Ready";
    case "work":
      return "Work";
    case "interval_rest":
      return "Rest";
    case "round_break":
      return "Round Break";
    case "summary":
      return "Finished";
    case "setup":
      return "Setup";
  }
};

const getIntervalMeta = (workoutSession: WorkoutSession) => {
  const intervalsPerRound = getWorkIntervalsPerRound(workoutSession.config);

  if (workoutSession.phase === "round_start") {
    return `Next 1 / ${intervalsPerRound}`;
  }

  if (workoutSession.phase === "interval_rest") {
    return `Next ${workoutSession.intervalIndex + 2} / ${intervalsPerRound}`;
  }

  if (workoutSession.phase === "round_break") {
    return `Next round ${workoutSession.roundIndex + 2}`;
  }

  return `${workoutSession.intervalIndex + 1} / ${intervalsPerRound}`;
};

const shouldShowRoundBreakPreview = (
  workoutSession: WorkoutSession,
  snapshot: ReturnType<typeof getSessionSnapshot>
) =>
  shouldShowRoundBreakAssignmentPreview({
    phase: workoutSession.phase,
    remainingSeconds: snapshot.remainingSeconds,
    totalSeconds: snapshot.totalSeconds
  });

const updateCountdownText = () => {
  if (!session || session.phase === "summary") {
    return;
  }

  const snapshot = getSessionSnapshot(session);
  const roundBreakPreviewVisible = shouldShowRoundBreakPreview(session, snapshot);

  if (session.phase === "round_break" && roundBreakPreviewVisible !== lastRoundBreakPreviewVisible) {
    render();
    return;
  }

  if (snapshot.remainingSeconds === lastRenderedSecond) {
    return;
  }

  lastRenderedSecond = snapshot.remainingSeconds;
  const countdown = document.querySelector<HTMLElement>("[data-countdown]");

  if (countdown) {
    countdown.textContent = String(snapshot.remainingSeconds);
  }
};

const stopWorkoutLoop = () => {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const tickWorkout = () => {
  if (!session || session.phase === "summary") {
    stopWorkoutLoop();
    return;
  }

  const now = performance.now();
  const nextSession = advanceIfPhaseComplete(session, now);

  if (nextSession !== session) {
    session = nextSession;
    lastRenderedSecond = null;
    render();
  } else {
    updateCountdownText();
  }

  animationFrameId = window.requestAnimationFrame(tickWorkout);
};

const startWorkoutLoop = () => {
  stopWorkoutLoop();
  animationFrameId = window.requestAnimationFrame(tickWorkout);
};

const renderPersonList = (people: Person[], emptyLabel: string) => {
  if (people.length === 0) {
    return `<p class="empty">${emptyLabel}</p>`;
  }

  return `
    <ul class="item-list">
      ${people
        .map(
          (person) => `
            <li class="person-item">
              <span class="item-name">${escapeHtml(person.name)}</span>
              <div class="item-actions">
                ${
                  person.active
                    ? `<button class="button ghost small" type="button" data-action="pool-person" data-person-id="${person.id}">Pool</button>`
                    : `<button class="button ghost small" type="button" data-action="activate-person" data-person-id="${person.id}">Active</button>`
                }
                <button class="button icon danger" type="button" aria-label="Remove ${escapeHtml(person.name)}" data-action="remove-person" data-person-id="${person.id}">x</button>
              </div>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
};

const renderExercise = (exercise: Exercise) => {
  const checked = config.selectedExerciseIds.includes(exercise.id) ? "checked" : "";
  const escapedName = escapeHtml(exercise.name);

  return `
    <li class="exercise-item ${exercise.builtIn ? "default-exercise" : "custom-exercise"}">
      <label class="exercise-toggle">
        <input type="checkbox" ${checked} data-action="toggle-exercise" data-exercise-id="${exercise.id}">
        <span class="exercise-mark"></span>
        ${renderIcon(exercise.iconId)}
        <span class="item-name">${escapedName}</span>
      </label>
      ${
        exercise.builtIn
          ? ""
          : `<button class="button icon danger" type="button" aria-label="Remove ${escapedName}" data-action="remove-exercise" data-exercise-id="${exercise.id}">x</button>`
      }
    </li>
  `;
};

const timerControlMeta: Record<keyof TimerSettings, { label: string; step: number }> = {
  getReadySeconds: { label: "Get Ready", step: 5 },
  workSeconds: { label: "Work", step: 5 },
  intervalRestSeconds: { label: "Rest", step: 5 },
  roundBreakSeconds: { label: "Round Break", step: 30 }
};

const renderTimerField = (key: keyof TimerSettings) => {
  const meta = timerControlMeta[key];

  return `
    <article class="timer-card">
      <header class="timer-card-head">
        <span class="timer-label">${meta.label}</span>
        <span class="timer-unit">sec</span>
      </header>
      <div class="timer-control">
        <button class="timer-step" type="button" aria-label="Decrease ${meta.label}" data-action="timer-step" data-timer-key="${key}" data-step="-${meta.step}">-</button>
        <input class="timer-value" type="number" inputmode="numeric" aria-label="${meta.label} seconds" min="${TIMER_LIMITS[key].min}" max="${TIMER_LIMITS[key].max}" step="${meta.step}" value="${config.timer[key]}" data-action="timer-change" data-timer-key="${key}">
        <button class="timer-step" type="button" aria-label="Increase ${meta.label}" data-action="timer-step" data-timer-key="${key}" data-step="${meta.step}">+</button>
      </div>
    </article>
  `;
};

const renderIconOptions = () => {
  const icons = findIconAssets(iconSearchQuery);

  return icons
    .map(
      (icon) => `
        <button class="icon-option ${icon.id === selectedDialogIconId ? "selected" : ""}" type="button" data-action="select-icon" data-icon-id="${icon.id}" aria-pressed="${icon.id === selectedDialogIconId}">
          ${icon.svg}
          <span>${escapeHtml(icon.label)}</span>
        </button>
      `
    )
    .join("");
};

const renderDialogs = () => `
  <dialog id="person-dialog" class="modal">
    <form method="dialog" class="modal-body" data-form="person">
      <header class="modal-header">
        <h2>Add Person</h2>
        <button class="button icon" value="cancel" aria-label="Close" type="submit" formnovalidate>x</button>
      </header>
      <label class="field">
        <span>Name</span>
        <input name="personName" autocomplete="off" maxlength="40" required>
      </label>
      <footer class="modal-actions">
        <button class="button ghost" value="cancel" type="submit" formnovalidate>Cancel</button>
        <button class="button primary" value="ok" type="submit">OK</button>
      </footer>
    </form>
  </dialog>

  <dialog id="exercise-dialog" class="modal">
    <form method="dialog" class="modal-body" data-form="exercise">
      <header class="modal-header">
        <h2>Add Exercise</h2>
        <button class="button icon" value="cancel" aria-label="Close" type="submit" formnovalidate>x</button>
      </header>
      <div class="exercise-dialog-row">
        <button class="selected-icon" type="button" data-action="open-icon-dialog" aria-label="Choose Icon">
          ${renderIcon(selectedDialogIconId, "exercise-icon large")}
        </button>
        <label class="field exercise-name-field">
          <span>Name</span>
          <input name="exerciseName" value="${escapeHtml(pendingExerciseName)}" autocomplete="off" maxlength="48" required>
        </label>
      </div>
      <footer class="modal-actions">
        <button class="button ghost" value="cancel" type="submit" formnovalidate>Cancel</button>
        <button class="button primary" value="ok" type="submit">OK</button>
      </footer>
    </form>
  </dialog>

  <dialog id="icon-dialog" class="modal icon-modal">
    <div class="modal-body">
      <header class="modal-header">
        <h2>Choose Icon</h2>
        <button class="button icon" type="button" data-action="close-icon-dialog" aria-label="Close">x</button>
      </header>
      <label class="field">
        <span>Search</span>
        <input value="${escapeHtml(iconSearchQuery)}" autocomplete="off" data-action="icon-search">
      </label>
      <div class="icon-grid">
        ${renderIconOptions()}
      </div>
    </div>
  </dialog>
`;

const renderAssignmentTiles = (workoutSession: WorkoutSession) => {
  const personById = new Map(getActivePeople(workoutSession.config).map((person) => [person.id, person]));
  const exerciseById = new Map(getSelectedExercises(workoutSession.config).map((exercise) => [exercise.id, exercise]));
  const assignmentPosition = (() => {
    if (workoutSession.phase === "interval_rest") {
      return {
        roundIndex: workoutSession.roundIndex,
        intervalIndex: workoutSession.intervalIndex + 1
      };
    }

    if (workoutSession.phase === "round_break") {
      return {
        roundIndex: workoutSession.roundIndex + 1,
        intervalIndex: 0
      };
    }

    return {
      roundIndex: workoutSession.roundIndex,
      intervalIndex: workoutSession.intervalIndex
    };
  })();
  const assignments = createAssignmentsForConfig(
    workoutSession.config,
    assignmentPosition.roundIndex,
    assignmentPosition.intervalIndex
  );

  return assignments
    .map((assignment) => {
      const person = personById.get(assignment.personId);
      const exercise = exerciseById.get(assignment.exerciseId);

      if (!person || !exercise) {
        return "";
      }

      return `
        <article class="assignment-card">
          ${renderIcon(exercise.iconId, "assignment-icon")}
          <div>
            <h2>${escapeHtml(person.name)}</h2>
            <p>${escapeHtml(exercise.name)}</p>
          </div>
        </article>
      `;
    })
    .join("");
};

const getAssignmentLayoutClass = (workoutSession: WorkoutSession) => {
  const activeCount = getActivePeople(workoutSession.config).length;

  if (activeCount <= 1) {
    return "assignment-count-1";
  }

  if (activeCount === 2) {
    return "assignment-count-2";
  }

  if (activeCount === 3) {
    return "assignment-count-3";
  }

  if (activeCount <= 6) {
    return "assignment-count-4-6";
  }

  if (activeCount === 7) {
    return "assignment-count-7";
  }

  return "assignment-count-8-plus";
};

const getWorkoutDensityClass = (workoutSession: WorkoutSession) =>
  getActivePeople(workoutSession.config).length >= 5 ? "workout-compact" : "";

const renderWorkoutControls = (workoutSession: WorkoutSession) => {
  if (workoutSession.phase === "work") {
    return `
      <button class="button ghost" type="button" data-action="skip-exercise">Skip Exercise</button>
      <button class="button danger" type="button" data-action="skip-round">Round Break</button>
    `;
  }

  if (workoutSession.phase === "interval_rest") {
    return `
      <button class="button ghost" type="button" data-action="extend-phase" data-seconds="5">+5</button>
      <button class="button ghost" type="button" data-action="extend-phase" data-seconds="10">+10</button>
      <button class="button ghost" type="button" data-action="extend-phase" data-seconds="20">+20</button>
    `;
  }

  if (workoutSession.phase === "round_break") {
    return `
      <button class="button ghost" type="button" data-action="extend-phase" data-seconds="30">+30</button>
      <button class="button ghost" type="button" data-action="extend-phase" data-seconds="60">+60</button>
      <button class="button primary" type="button" data-action="finish-workout">Finish</button>
    `;
  }

  return "";
};

const renderWorkoutMain = (workoutSession: WorkoutSession, snapshot: ReturnType<typeof getSessionSnapshot>) => {
  const assignmentLayoutClass = getAssignmentLayoutClass(workoutSession);

  if (workoutSession.phase === "round_break") {
    const previewVisible = shouldShowRoundBreakPreview(workoutSession, snapshot);

    return `
      <section class="round-break-stack">
        <section class="round-break-panel" aria-label="Round status">
          <div>
            <span>${workoutSession.completedRounds}</span>
            <p>Completed</p>
          </div>
          <div>
            <span>${workoutSession.abandonedRounds}</span>
            <p>Abandoned</p>
          </div>
        </section>
        <section class="assignment-grid ${assignmentLayoutClass} round-preview ${previewVisible ? "visible" : ""}" aria-label="Next assignments" aria-hidden="${previewVisible ? "false" : "true"}">
          ${renderAssignmentTiles(workoutSession)}
        </section>
      </section>
    `;
  }

  return `
    <section class="assignment-grid ${assignmentLayoutClass}" aria-label="Assignments">
      ${renderAssignmentTiles(workoutSession)}
    </section>
  `;
};

const renderWorkoutScreen = (workoutSession: WorkoutSession) => {
  const snapshot = getSessionSnapshot(workoutSession);
  lastRenderedSecond = snapshot.remainingSeconds;
  lastRoundBreakPreviewVisible = shouldShowRoundBreakPreview(workoutSession, snapshot);
  const controls = renderWorkoutControls(workoutSession);
  const assignmentLayoutClass = getAssignmentLayoutClass(workoutSession);
  const densityClass = getWorkoutDensityClass(workoutSession);

  return `
    <section class="workout-shell ${workoutSession.phase} ${densityClass}" aria-labelledby="phase-title">
      <header class="workout-topbar">
        <div>
          <p class="eyebrow">Round ${workoutSession.roundIndex + 1}</p>
          <h1 id="phase-title">${formatPhase(workoutSession)}</h1>
        </div>
        <div class="phase-meta">${getIntervalMeta(workoutSession)}</div>
      </header>
      ${renderWorkoutMain(workoutSession, snapshot)}
      <footer class="timer-band ${controls ? "" : "countdown-only"}">
        <div class="countdown" data-countdown>${snapshot.remainingSeconds}</div>
        ${controls ? `<div class="timer-actions">${controls}</div>` : ""}
      </footer>
    </section>
  `;
};

const renderStartScreen = () => `
  <section class="start-shell" aria-labelledby="start-title">
    <div class="start-content">
      <div class="start-visual" aria-hidden="true">
        <span class="start-connector start-connector-horizontal"></span>
        <span class="start-connector start-connector-vertical"></span>
        <span class="start-station start-station-a"></span>
        <span class="start-station start-station-b"></span>
        <span class="start-station start-station-c"></span>
        <span class="start-station start-station-d"></span>
        <span class="start-timer-mark"></span>
      </div>
      <h1 id="start-title">HIITBuddy</h1>
      <button class="button primary start-button" type="button" data-action="new-workout">New Workout</button>
    </div>
  </section>
`;

const renderPeoplePanel = (activePeople: Person[], pooledPeople: Person[], counts: ReturnType<typeof getPersonCounts>) => `
  <section class="panel people-panel setup-panel" aria-labelledby="people-title">
    <div class="panel-header">
      <div>
        <h2 id="people-title">People</h2>
        <p>${counts.active} active / ${counts.pooled} pool</p>
      </div>
      <button class="button secondary" type="button" data-action="open-person-dialog">Add</button>
    </div>
    <div class="split-list">
      <section class="people-group people-group-active">
        <h3>Active</h3>
        ${renderPersonList(activePeople, "No active people")}
      </section>
      <section class="people-group people-group-pool">
        <h3>Pool</h3>
        ${renderPersonList(pooledPeople, "Empty")}
      </section>
    </div>
  </section>
`;

const renderExercisesPanel = () => `
  <section class="panel exercise-panel setup-panel" aria-labelledby="exercise-title">
    <div class="panel-header">
      <div>
        <h2 id="exercise-title">Exercises</h2>
        <p>${getSelectedExerciseCount()} selected</p>
      </div>
      <button class="button secondary" type="button" data-action="open-exercise-dialog">Add</button>
    </div>
    <ul class="exercise-list">
      ${getExercisesForDisplay().map(renderExercise).join("")}
    </ul>
  </section>
`;

const renderTimerPanel = () => `
  <aside class="panel timer-panel setup-panel" aria-label="Timer">
    <div class="timer-grid">
      ${renderTimerField("getReadySeconds")}
      ${renderTimerField("workSeconds")}
      ${renderTimerField("intervalRestSeconds")}
      ${renderTimerField("roundBreakSeconds")}
    </div>
  </aside>
`;

const getSetupStatus = () => {
  return {
    message: statusMessage,
    tone: statusTone
  };
};

const renderSetupStep = (
  activePeople: Person[],
  pooledPeople: Person[],
  counts: ReturnType<typeof getPersonCounts>
) => {
  switch (getCurrentSetupStep().id) {
    case "people":
      return renderPeoplePanel(activePeople, pooledPeople, counts);
    case "exercises":
      return renderExercisesPanel();
    case "timer":
      return renderTimerPanel();
  }
};

const renderSetupFeedback = (message: string, tone: StatusTone) => {
  if (!message) {
    return "";
  }

  return `<div class="setup-feedback status ${tone}" role="status" aria-live="polite">${escapeHtml(message)}</div>`;
};

const renderSetupNav = () => {
  const isFirst = setupStepIndex === 0;
  const isLast = setupStepIndex === setupSteps.length - 1;

  return `
    <footer class="setup-nav">
      <button class="button ghost" type="button" data-action="setup-back" ${isFirst ? "disabled" : ""}>Back</button>
      <button class="button ghost" type="button" data-action="copy-link">Copy</button>
      ${isLast ? `<button class="button primary" type="button" data-action="start-workout">Start</button>` : `<button class="button primary" type="button" data-action="setup-next">Next</button>`}
    </footer>
  `;
};

const renderSummaryScreen = (workoutSession: WorkoutSession) => {
  const summary = getWorkoutSummary(workoutSession);

  return `
  <section class="summary-shell" aria-labelledby="finished-title">
    <div class="summary-celebration" aria-hidden="true">
      <span class="summary-check"></span>
    </div>
    <p class="eyebrow">HIITBuddy</p>
    <h1 id="finished-title">Strong Finish</h1>
    <dl class="summary-grid">
      <div>
        <dt>Completed</dt>
        <dd>${summary.completedRounds}</dd>
      </div>
      <div>
        <dt>Abandoned</dt>
        <dd>${summary.abandonedRounds}</dd>
      </div>
      <div>
        <dt>People</dt>
        <dd>${summary.activeParticipants}</dd>
      </div>
      <div>
        <dt>Exercises</dt>
        <dd>${summary.selectedExercises}</dd>
      </div>
      <div class="wide">
        <dt>Elapsed</dt>
        <dd>${formatElapsedTime(summary.elapsedSeconds)}</dd>
      </div>
    </dl>
    <div class="summary-actions">
      <button class="button primary" type="button" data-action="new-workout">New Workout</button>
    </div>
  </section>
`;
};

const render = () => {
  if (session) {
    app.innerHTML = session.phase === "summary" ? renderSummaryScreen(session) : renderWorkoutScreen(session);
    return;
  }

  if (appMode === "start") {
    app.innerHTML = renderStartScreen();
    return;
  }

  const activePeople = sortByName(config.people.filter((person) => person.active));
  const pooledPeople = sortByName(config.people.filter((person) => !person.active));
  const counts = getPersonCounts();
  const currentStep = getCurrentSetupStep();
  const setupStatus = getSetupStatus();

  app.innerHTML = `
    <section class="app-shell" aria-labelledby="app-title">
      <header class="topbar">
        <div>
          <p class="eyebrow">Setup ${setupStepIndex + 1} / ${setupSteps.length}</p>
          <h1 id="app-title">${currentStep.label}</h1>
        </div>
      </header>
      <main class="setup-stage">
        ${renderSetupStep(activePeople, pooledPeople, counts)}
      </main>
      ${renderSetupFeedback(setupStatus.message, setupStatus.tone)}
      ${renderSetupNav()}
    </section>
    ${renderDialogs()}
  `;
};

const getDialog = (id: string): HTMLDialogElement => {
  const dialog = document.querySelector<HTMLDialogElement>(`#${id}`);

  if (!dialog) {
    throw new Error(`Dialog ${id} was not found.`);
  }

  return dialog;
};

const focusDialogInput = (dialog: HTMLDialogElement) => {
  window.requestAnimationFrame(() => {
    dialog.querySelector<HTMLInputElement>("input")?.focus();
  });
};

const openDialog = (id: string) => {
  const dialog = getDialog(id);
  dialog.showModal();
  focusDialogInput(dialog);
};

const openIconDialog = () => {
  const dialog = getDialog("icon-dialog");
  dialog.showModal();
  focusDialogInput(dialog);
};

const capturePendingExerciseName = () => {
  pendingExerciseName =
    document.querySelector<HTMLInputElement>('form[data-form="exercise"] input[name="exerciseName"]')?.value ?? "";
};

const handleCopyLink = async () => {
  const shareUrl = createShareUrl(config, window.location.href);

  try {
    await navigator.clipboard.writeText(shareUrl);
    setStatus("Settings copied", "success");
  } catch {
    setStatus("Copy failed", "danger");
  }
};

const handleStartWorkout = () => {
  const validation = getStartValidation(config);

  if (!validation.valid) {
    const firstIssue = validation.issues[0];
    setupStepIndex = firstIssue ? getSetupStepForIssue(firstIssue.code) : setupStepIndex;
    setStatus(firstIssue?.message ?? START_VALIDATION_MESSAGES.invalid_timer, "danger");
    return;
  }

  session = createWorkoutSession(resolveAutoExerciseIcons(config), performance.now());
  statusMessage = "";
  statusTone = "neutral";
  lastRenderedSecond = null;
  render();
  startWorkoutLoop();
};

const updateSession = (nextSession: WorkoutSession) => {
  session = nextSession;
  lastRenderedSecond = null;
  render();

  if (session.phase !== "summary") {
    startWorkoutLoop();
  } else {
    stopWorkoutLoop();
  }
};

const handleAction = (target: HTMLElement) => {
  const action = target.dataset.action;

  switch (action) {
    case "copy-link":
      void handleCopyLink();
      break;
    case "start-workout":
      handleStartWorkout();
      break;
    case "new-workout":
      session = null;
      stopWorkoutLoop();
      appMode = "setup";
      setupStepIndex = 0;
      statusMessage = "";
      statusTone = "neutral";
      render();
      break;
    case "open-person-dialog":
      openDialog("person-dialog");
      break;
    case "setup-back":
      setupStepIndex = Math.max(0, setupStepIndex - 1);
      setStatus("");
      break;
    case "setup-next":
      setupStepIndex = Math.min(setupSteps.length - 1, setupStepIndex + 1);
      setStatus("");
      break;
    case "timer-step": {
      const timerKey = target.dataset.timerKey as keyof TimerSettings;
      const step = Number.parseInt(target.dataset.step ?? "0", 10);
      const meta = timerControlMeta[timerKey];

      if (meta && Number.isFinite(step)) {
        config = updateTimerSetting(config, timerKey, config.timer[timerKey] + step);
        setStatus("");
      }
      break;
    }
    case "open-exercise-dialog":
      pendingExerciseName = "";
      selectedDialogIconId = AUTO_ICON_ID;
      iconSearchQuery = "";
      render();
      openDialog("exercise-dialog");
      break;
    case "pool-person":
      config = setPersonActive(config, target.dataset.personId ?? "", false);
      setStatus("");
      break;
    case "activate-person":
      if (getPersonCounts().active >= START_LIMITS.activePeople.max) {
        setStatus(START_VALIDATION_MESSAGES.too_many_active_people, "danger");
      } else {
        config = setPersonActive(config, target.dataset.personId ?? "", true);
        setStatus("");
      }
      break;
    case "remove-person":
      config = removePerson(config, target.dataset.personId ?? "");
      setStatus("");
      break;
    case "remove-exercise":
      config = removeCustomExercise(config, target.dataset.exerciseId ?? "");
      setStatus("");
      break;
    case "open-icon-dialog":
      capturePendingExerciseName();
      getDialog("exercise-dialog").close();
      render();
      openIconDialog();
      break;
    case "close-icon-dialog":
      getDialog("icon-dialog").close();
      break;
    case "select-icon":
      selectedDialogIconId = target.dataset.iconId ?? selectedDialogIconId;
      getDialog("icon-dialog").close();
      render();
      openDialog("exercise-dialog");
      break;
    case "skip-exercise":
      if (session) {
        updateSession(skipCurrentExercise(session, performance.now()));
      }
      break;
    case "skip-round":
      if (session) {
        updateSession(skipToRoundBreak(session, performance.now()));
      }
      break;
    case "extend-phase":
      if (session) {
        updateSession(extendCurrentPhase(session, Number.parseInt(target.dataset.seconds ?? "0", 10)));
      }
      break;
    case "finish-workout":
      if (session) {
        updateSession(finishWorkout(session, performance.now()));
      }
      break;
    case "back-setup":
      session = null;
      stopWorkoutLoop();
      appMode = "setup";
      setupStepIndex = 0;
      statusMessage = "";
      statusTone = "neutral";
      render();
      break;
  }
};

document.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");

  if (!target) {
    return;
  }

  if (target.dataset.action === "open-icon-dialog" || target.dataset.action === "select-icon") {
    event.preventDefault();
  }

  handleAction(target);
});

document.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;

  if (target.dataset.action === "toggle-exercise") {
    const exerciseId = target.dataset.exerciseId ?? "";
    const reachedLimit =
      target.checked &&
      !config.selectedExerciseIds.includes(exerciseId) &&
      getSelectedExerciseCount() >= START_LIMITS.selectedExercises.max;

    config = setExerciseSelected(config, exerciseId, target.checked);
    setStatus(
      reachedLimit ? START_VALIDATION_MESSAGES.too_many_exercises : "",
      reachedLimit ? "danger" : "neutral"
    );
  }
});

document.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;

  if (target.dataset.action === "timer-change") {
    config = updateTimerSetting(config, target.dataset.timerKey as keyof TimerSettings, target.value);
    setStatus("");
  }

  if (target.dataset.action === "icon-search") {
    iconSearchQuery = target.value;
    const iconGrid = document.querySelector<HTMLElement>(".icon-grid");

    if (iconGrid) {
      iconGrid.innerHTML = renderIconOptions();
    }
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement) || event.key !== "Enter" || event.isComposing) {
    return;
  }

  const form = target.closest<HTMLFormElement>('form[data-form="person"], form[data-form="exercise"]');

  if (!form || (target.name !== "personName" && target.name !== "exerciseName")) {
    return;
  }

  const okButton = form.querySelector<HTMLButtonElement>('button[value="ok"]');

  if (!okButton) {
    return;
  }

  event.preventDefault();
  form.requestSubmit(okButton);
});

document.addEventListener("submit", (event) => {
  const form = event.target as HTMLFormElement;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;

  if (submitter?.value !== "ok") {
    return;
  }

  const formData = new FormData(form);

  if (form.dataset.form === "person") {
    config = addPerson(config, String(formData.get("personName") ?? ""));
    setStatus("");
  }

  if (form.dataset.form === "exercise") {
    config = addCustomExercise(config, String(formData.get("exerciseName") ?? ""), selectedDialogIconId);
    pendingExerciseName = "";
    selectedDialogIconId = AUTO_ICON_ID;
    setStatus("");
  }
});

render();
