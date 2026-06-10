import { type Exercise, type Person, type TimerSettings, type WorkoutConfig } from "../domain/types.js";
import { validateStartWorkout, type StartValidationResult } from "../domain/validation.js";

const createId = (prefix: string): string => {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi && "randomUUID" in cryptoApi) {
    return `${prefix}_${cryptoApi.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const cloneConfig = (config: WorkoutConfig): WorkoutConfig => ({
  ...config,
  people: config.people.map((person) => ({ ...person })),
  exercises: config.exercises.map((exercise) => ({ ...exercise })),
  timer: { ...config.timer },
  selectedExerciseIds: [...config.selectedExerciseIds],
  ...(config.ui ? { ui: { ...config.ui } } : {})
});

export const createPerson = (name: string, active = true): Person => ({
  id: createId("person"),
  name: name.trim().slice(0, 40),
  active
});

export const createCustomExercise = (name: string, iconId: string): Exercise => ({
  id: createId("exercise"),
  name: name.trim().slice(0, 48),
  iconId,
  builtIn: false,
  selected: true
});

export const addPerson = (config: WorkoutConfig, name: string): WorkoutConfig => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return config;
  }

  const nextConfig = cloneConfig(config);
  nextConfig.people.push(createPerson(trimmedName));
  return nextConfig;
};

export const setPersonActive = (config: WorkoutConfig, personId: string, active: boolean): WorkoutConfig => {
  const nextConfig = cloneConfig(config);
  nextConfig.people = nextConfig.people.map((person) => (person.id === personId ? { ...person, active } : person));
  return nextConfig;
};

export const removePerson = (config: WorkoutConfig, personId: string): WorkoutConfig => {
  const nextConfig = cloneConfig(config);
  nextConfig.people = nextConfig.people.filter((person) => person.id !== personId);
  return nextConfig;
};

export const addCustomExercise = (config: WorkoutConfig, name: string, iconId: string): WorkoutConfig => {
  const trimmedName = name.trim();

  if (!trimmedName || !iconId.trim()) {
    return config;
  }

  const nextConfig = cloneConfig(config);
  const exercise = createCustomExercise(trimmedName, iconId.trim());
  nextConfig.exercises.push(exercise);
  nextConfig.selectedExerciseIds.push(exercise.id);
  return nextConfig;
};

export const setExerciseSelected = (config: WorkoutConfig, exerciseId: string, selected: boolean): WorkoutConfig => {
  const nextConfig = cloneConfig(config);
  const selectedIds = new Set(nextConfig.selectedExerciseIds);

  if (selected) {
    selectedIds.add(exerciseId);
  } else {
    selectedIds.delete(exerciseId);
  }

  nextConfig.selectedExerciseIds = nextConfig.exercises
    .map((exercise) => exercise.id)
    .filter((id) => selectedIds.has(id));
  nextConfig.exercises = nextConfig.exercises.map((exercise) => ({
    ...exercise,
    selected: selectedIds.has(exercise.id)
  }));

  return nextConfig;
};

export const removeCustomExercise = (config: WorkoutConfig, exerciseId: string): WorkoutConfig => {
  const exercise = config.exercises.find((item) => item.id === exerciseId);

  if (!exercise || exercise.builtIn) {
    return config;
  }

  const nextConfig = cloneConfig(config);
  nextConfig.exercises = nextConfig.exercises.filter((item) => item.id !== exerciseId);
  nextConfig.selectedExerciseIds = nextConfig.selectedExerciseIds.filter((id) => id !== exerciseId);
  return nextConfig;
};

export const updateTimerSetting = (
  config: WorkoutConfig,
  key: keyof TimerSettings,
  rawValue: string | number
): WorkoutConfig => {
  const numericValue = typeof rawValue === "number" ? rawValue : Number.parseInt(rawValue, 10);

  if (!Number.isFinite(numericValue)) {
    return config;
  }

  const nextConfig = cloneConfig(config);
  nextConfig.timer[key] = Math.max(0, Math.trunc(numericValue));
  return nextConfig;
};

export const getStartValidation = (config: WorkoutConfig): StartValidationResult => validateStartWorkout(config);
