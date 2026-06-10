export const SCHEMA_VERSION = 1;

export type Person = {
  id: string;
  name: string;
  active: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  iconId: string;
  builtIn: boolean;
  selected: boolean;
};

export type TimerSettings = {
  workSeconds: number;
  intervalRestSeconds: number;
  roundBreakSeconds: number;
};

export type ThemePreference = "system" | "light" | "dark";

export type UiPreferences = {
  theme?: ThemePreference;
};

export type WorkoutConfig = {
  schemaVersion: typeof SCHEMA_VERSION;
  people: Person[];
  exercises: Exercise[];
  timer: TimerSettings;
  selectedExerciseIds: string[];
  ui?: UiPreferences;
};

export type SessionPhase = "setup" | "round_start" | "work" | "interval_rest" | "round_break" | "summary";

export type WorkoutSession = {
  config: WorkoutConfig;
  phase: SessionPhase;
  roundIndex: number;
  intervalIndex: number;
  phaseStartedAt: DOMHighResTimeStamp;
  phaseDurationSeconds: number;
  addedSeconds: number;
  sessionStartedAt: DOMHighResTimeStamp;
  completedRounds: number;
  abandonedRounds: number;
  finishedAt?: DOMHighResTimeStamp;
};

export type Assignment = {
  personId: string;
  exerciseId: string;
  roundIndex: number;
  intervalIndex: number;
};

export type IconAsset = {
  id: string;
  label: string;
  tags: string[];
  svg: string;
};
