import { DEFAULT_GET_READY_SECONDS, SCHEMA_VERSION, type Exercise, type TimerSettings, type WorkoutConfig } from "../domain/types.js";

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  getReadySeconds: DEFAULT_GET_READY_SECONDS,
  workSeconds: 40,
  intervalRestSeconds: 20,
  roundBreakSeconds: 90
};

export const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: "skierg",
    name: "SkiErg",
    iconId: "skierg",
    builtIn: true,
    selected: false
  },
  {
    id: "sled_push",
    name: "Sled Push",
    iconId: "sled_push",
    builtIn: true,
    selected: false
  },
  {
    id: "sled_pull",
    name: "Sled Pull",
    iconId: "sled_pull",
    builtIn: true,
    selected: false
  },
  {
    id: "burpee_broad_jumps",
    name: "Burpee Broad Jumps",
    iconId: "burpee_broad_jumps",
    builtIn: true,
    selected: false
  },
  {
    id: "rowing",
    name: "Rowing",
    iconId: "rowing",
    builtIn: true,
    selected: false
  },
  {
    id: "farmers_carry",
    name: "Farmers Carry",
    iconId: "farmers_carry",
    builtIn: true,
    selected: false
  },
  {
    id: "sandbag_lunges",
    name: "Sandbag Lunges",
    iconId: "sandbag_lunges",
    builtIn: true,
    selected: false
  },
  {
    id: "wall_balls",
    name: "Wall Balls",
    iconId: "wall_balls",
    builtIn: true,
    selected: false
  }
];

export const DEFAULT_SELECTED_EXERCISE_IDS: string[] = [];

export const createDefaultConfig = (): WorkoutConfig => ({
  schemaVersion: SCHEMA_VERSION,
  people: [],
  exercises: DEFAULT_EXERCISES.map((exercise) => ({ ...exercise })),
  timer: { ...DEFAULT_TIMER_SETTINGS },
  selectedExerciseIds: [...DEFAULT_SELECTED_EXERCISE_IDS]
});
