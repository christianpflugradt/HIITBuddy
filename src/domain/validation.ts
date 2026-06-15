import {
  SCHEMA_VERSION,
  DEFAULT_GET_READY_SECONDS,
  type Exercise,
  type Person,
  type TimerSettings,
  type UiPreferences,
  type WorkoutConfig
} from "./types.js";

export const TIMER_LIMITS = {
  getReadySeconds: {
    min: 5,
    max: 300
  },
  workSeconds: {
    min: 5,
    max: 300
  },
  intervalRestSeconds: {
    min: 5,
    max: 300
  },
  roundBreakSeconds: {
    min: 30,
    max: 300,
    step: 30
  }
} as const;

export const START_LIMITS = {
  activePeople: {
    min: 1,
    max: 12
  },
  selectedExercises: {
    max: 20
  }
} as const;

export const START_VALIDATION_MESSAGES = {
  no_active_people: "Add or activate 1 to 12 people.",
  too_many_active_people: "Move people to the pool. Up to 12 can be active.",
  no_exercises: "Select at least one exercise.",
  too_many_people: "Select at least as many exercises as active people.",
  too_many_exercises: "Select up to 20 exercises.",
  invalid_timer: "Use valid whole-second timer values."
} as const;

export type StartValidationIssueCode = keyof typeof START_VALIDATION_MESSAGES;

export type ConfigValidationIssueCode =
  | StartValidationIssueCode
  | "invalid_schema_version"
  | "invalid_people"
  | "duplicate_person_id"
  | "invalid_exercises"
  | "duplicate_exercise_id"
  | "invalid_selected_exercises"
  | "unknown_selected_exercise"
  | "duplicate_selected_exercise"
  | "invalid_timer_settings"
  | "invalid_ui_preferences";

export type ValidationIssue = {
  code: ConfigValidationIssueCode;
  message: string;
  path?: string;
};

export type ConfigValidationResult =
  | {
      valid: true;
      config: WorkoutConfig;
      issues: [];
    }
  | {
      valid: false;
      config: null;
      issues: ValidationIssue[];
    };

export type StartValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
  activePeopleCount: number;
  selectedExerciseCount: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isWholeNumberInRange = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;

const isWholeNumberStepAligned = (value: number, step: number): boolean => value % step === 0;

const addIssue = (
  issues: ValidationIssue[],
  code: ConfigValidationIssueCode,
  message: string,
  path?: string
) => {
  issues.push(path ? { code, message, path } : { code, message });
};

const validateTimerSettings = (value: unknown, issues: ValidationIssue[], path = "timer"): TimerSettings | null => {
  if (!isRecord(value)) {
    addIssue(issues, "invalid_timer_settings", "Timer settings must be an object.", path);
    return null;
  }

  const getReadySeconds = value["getReadySeconds"] ?? DEFAULT_GET_READY_SECONDS;
  const workSeconds = value["workSeconds"];
  const intervalRestSeconds = value["intervalRestSeconds"];
  const roundBreakSeconds = value["roundBreakSeconds"];

  if (
    !isWholeNumberInRange(getReadySeconds, TIMER_LIMITS.getReadySeconds.min, TIMER_LIMITS.getReadySeconds.max) ||
    !isWholeNumberInRange(workSeconds, TIMER_LIMITS.workSeconds.min, TIMER_LIMITS.workSeconds.max) ||
    !isWholeNumberInRange(
      intervalRestSeconds,
      TIMER_LIMITS.intervalRestSeconds.min,
      TIMER_LIMITS.intervalRestSeconds.max
    ) ||
    !isWholeNumberInRange(roundBreakSeconds, TIMER_LIMITS.roundBreakSeconds.min, TIMER_LIMITS.roundBreakSeconds.max) ||
    !isWholeNumberStepAligned(roundBreakSeconds, TIMER_LIMITS.roundBreakSeconds.step)
  ) {
    addIssue(issues, "invalid_timer_settings", START_VALIDATION_MESSAGES.invalid_timer, path);
    return null;
  }

  return {
    getReadySeconds,
    workSeconds,
    intervalRestSeconds,
    roundBreakSeconds
  };
};

const validatePeople = (value: unknown, issues: ValidationIssue[]): Person[] | null => {
  if (!Array.isArray(value)) {
    addIssue(issues, "invalid_people", "People must be an array.", "people");
    return null;
  }

  const seenIds = new Set<string>();
  const people: Person[] = [];

  value.forEach((personValue, index) => {
    const path = `people.${index}`;

    if (!isRecord(personValue)) {
      addIssue(issues, "invalid_people", "Person must be an object.", path);
      return;
    }

    const id = personValue["id"];
    const name = personValue["name"];
    const active = personValue["active"];

    if (typeof id !== "string" || id.trim() === "") {
      addIssue(issues, "invalid_people", "Person id must be a non-empty string.", `${path}.id`);
      return;
    }

    if (seenIds.has(id)) {
      addIssue(issues, "duplicate_person_id", "Person ids must be unique.", `${path}.id`);
      return;
    }

    if (typeof name !== "string" || name.trim() === "") {
      addIssue(issues, "invalid_people", "Person name must be a non-empty string.", `${path}.name`);
      return;
    }

    if (typeof active !== "boolean") {
      addIssue(issues, "invalid_people", "Person active flag must be a boolean.", `${path}.active`);
      return;
    }

    seenIds.add(id);
    people.push({
      id,
      name: name.trim().slice(0, 40),
      active
    });
  });

  return people;
};

const validateExercises = (value: unknown, issues: ValidationIssue[]): Exercise[] | null => {
  if (!Array.isArray(value)) {
    addIssue(issues, "invalid_exercises", "Exercises must be an array.", "exercises");
    return null;
  }

  const seenIds = new Set<string>();
  const exercises: Exercise[] = [];

  value.forEach((exerciseValue, index) => {
    const path = `exercises.${index}`;

    if (!isRecord(exerciseValue)) {
      addIssue(issues, "invalid_exercises", "Exercise must be an object.", path);
      return;
    }

    const id = exerciseValue["id"];
    const name = exerciseValue["name"];
    const iconId = exerciseValue["iconId"];
    const builtIn = exerciseValue["builtIn"];
    const selected = exerciseValue["selected"];

    if (typeof id !== "string" || id.trim() === "") {
      addIssue(issues, "invalid_exercises", "Exercise id must be a non-empty string.", `${path}.id`);
      return;
    }

    if (seenIds.has(id)) {
      addIssue(issues, "duplicate_exercise_id", "Exercise ids must be unique.", `${path}.id`);
      return;
    }

    if (typeof name !== "string" || name.trim() === "") {
      addIssue(issues, "invalid_exercises", "Exercise name must be a non-empty string.", `${path}.name`);
      return;
    }

    if (typeof iconId !== "string" || iconId.trim() === "") {
      addIssue(issues, "invalid_exercises", "Exercise iconId must be a non-empty string.", `${path}.iconId`);
      return;
    }

    if (typeof builtIn !== "boolean") {
      addIssue(issues, "invalid_exercises", "Exercise builtIn flag must be a boolean.", `${path}.builtIn`);
      return;
    }

    if (typeof selected !== "boolean") {
      addIssue(issues, "invalid_exercises", "Exercise selected flag must be a boolean.", `${path}.selected`);
      return;
    }

    seenIds.add(id);
    exercises.push({
      id,
      name: name.trim().slice(0, 48),
      iconId: iconId.trim(),
      builtIn,
      selected
    });
  });

  return exercises;
};

const validateSelectedExerciseIds = (
  value: unknown,
  exercises: Exercise[],
  issues: ValidationIssue[]
): string[] | null => {
  if (!Array.isArray(value)) {
    addIssue(issues, "invalid_selected_exercises", "selectedExerciseIds must be an array.", "selectedExerciseIds");
    return null;
  }

  const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
  const seenIds = new Set<string>();
  const selectedExerciseIds: string[] = [];

  value.forEach((selectedValue, index) => {
    const path = `selectedExerciseIds.${index}`;

    if (typeof selectedValue !== "string" || selectedValue.trim() === "") {
      addIssue(issues, "invalid_selected_exercises", "Selected exercise id must be a non-empty string.", path);
      return;
    }

    if (seenIds.has(selectedValue)) {
      addIssue(issues, "duplicate_selected_exercise", "Selected exercise ids must be unique.", path);
      return;
    }

    if (!exerciseIds.has(selectedValue)) {
      addIssue(issues, "unknown_selected_exercise", "Selected exercise id must exist in exercises.", path);
      return;
    }

    seenIds.add(selectedValue);
    selectedExerciseIds.push(selectedValue);
  });

  return selectedExerciseIds;
};

const validateUiPreferences = (value: unknown, issues: ValidationIssue[]): UiPreferences | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    addIssue(issues, "invalid_ui_preferences", "UI preferences must be an object.", "ui");
    return undefined;
  }

  const theme = value["theme"];

  if (theme === undefined) {
    return {};
  }

  if (theme !== "system" && theme !== "light" && theme !== "dark") {
    addIssue(issues, "invalid_ui_preferences", "Theme must be system, light, or dark.", "ui.theme");
    return undefined;
  }

  return { theme };
};

export const validateConfig = (value: unknown): ConfigValidationResult => {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    addIssue(issues, "invalid_schema_version", "Workout config must be an object.");
    return {
      valid: false,
      config: null,
      issues
    };
  }

  if (value["schemaVersion"] !== SCHEMA_VERSION) {
    addIssue(issues, "invalid_schema_version", `Workout config schemaVersion must be ${SCHEMA_VERSION}.`, "schemaVersion");
  }

  const people = validatePeople(value["people"], issues);
  const exercises = validateExercises(value["exercises"], issues);
  const timer = validateTimerSettings(value["timer"], issues);
  const selectedExerciseIds = exercises
    ? validateSelectedExerciseIds(value["selectedExerciseIds"], exercises, issues)
    : null;
  const ui = validateUiPreferences(value["ui"], issues);

  if (issues.length > 0 || !people || !exercises || !timer || !selectedExerciseIds) {
    return {
      valid: false,
      config: null,
      issues
    };
  }

  const selectedExerciseIdSet = new Set(selectedExerciseIds);
  const normalizedExercises = exercises.map((exercise) => ({
    ...exercise,
    selected: selectedExerciseIdSet.has(exercise.id)
  }));

  return {
    valid: true,
    config: ui
      ? {
          schemaVersion: SCHEMA_VERSION,
          people,
          exercises: normalizedExercises,
          timer,
          selectedExerciseIds,
          ui
        }
      : {
          schemaVersion: SCHEMA_VERSION,
          people,
          exercises: normalizedExercises,
          timer,
          selectedExerciseIds
        },
    issues: []
  };
};

export const validateStartWorkout = (config: WorkoutConfig): StartValidationResult => {
  const issues: ValidationIssue[] = [];
  const activePeopleCount = config.people.filter((person) => person.active).length;
  const selectedExerciseCount = config.selectedExerciseIds.length;
  const timerIssues: ValidationIssue[] = [];

  validateTimerSettings(config.timer, timerIssues);

  if (activePeopleCount < START_LIMITS.activePeople.min) {
    addIssue(issues, "no_active_people", START_VALIDATION_MESSAGES.no_active_people, "people");
  }

  if (activePeopleCount > START_LIMITS.activePeople.max) {
    addIssue(issues, "too_many_active_people", START_VALIDATION_MESSAGES.too_many_active_people, "people");
  }

  if (selectedExerciseCount === 0) {
    addIssue(issues, "no_exercises", START_VALIDATION_MESSAGES.no_exercises, "selectedExerciseIds");
  }

  if (selectedExerciseCount > START_LIMITS.selectedExercises.max) {
    addIssue(issues, "too_many_exercises", START_VALIDATION_MESSAGES.too_many_exercises, "selectedExerciseIds");
  }

  if (activePeopleCount > selectedExerciseCount && selectedExerciseCount > 0) {
    addIssue(issues, "too_many_people", START_VALIDATION_MESSAGES.too_many_people, "people");
  }

  if (timerIssues.length > 0) {
    addIssue(issues, "invalid_timer", START_VALIDATION_MESSAGES.invalid_timer, "timer");
  }

  return {
    valid: issues.length === 0,
    issues,
    activePeopleCount,
    selectedExerciseCount
  };
};

export const isWorkoutStartable = (config: WorkoutConfig) => validateStartWorkout(config).valid;
