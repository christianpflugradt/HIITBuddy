import { type Assignment, type Exercise, type Person, type WorkoutConfig } from "../domain/types.js";

export type ScheduleInput = {
  activePeople: Person[];
  selectedExercises: Exercise[];
  roundIndex: number;
  intervalIndex: number;
};

export const getActivePeople = (config: WorkoutConfig): Person[] => config.people.filter((person) => person.active);

export const getSelectedExercises = (config: WorkoutConfig): Exercise[] => {
  const exerciseById = new Map(config.exercises.map((exercise) => [exercise.id, exercise]));
  return config.selectedExerciseIds
    .map((exerciseId) => exerciseById.get(exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};

export const getWorkIntervalsPerRound = (config: WorkoutConfig): number => getSelectedExercises(config).length;

export const isFinalIntervalOfRound = (config: WorkoutConfig, intervalIndex: number): boolean =>
  intervalIndex === getWorkIntervalsPerRound(config) - 1;

export const assertScheduleInput = ({ activePeople, selectedExercises, intervalIndex, roundIndex }: ScheduleInput) => {
  if (roundIndex < 0 || !Number.isInteger(roundIndex)) {
    throw new RangeError("roundIndex must be a non-negative whole number.");
  }

  if (intervalIndex < 0 || !Number.isInteger(intervalIndex)) {
    throw new RangeError("intervalIndex must be a non-negative whole number.");
  }

  if (activePeople.length === 0) {
    throw new RangeError("At least one active person is required.");
  }

  if (selectedExercises.length === 0) {
    throw new RangeError("At least one selected exercise is required.");
  }

  if (activePeople.length > selectedExercises.length) {
    throw new RangeError("Active people count must be less than or equal to selected exercise count.");
  }

  if (intervalIndex >= selectedExercises.length) {
    throw new RangeError("intervalIndex must be within the selected exercise count.");
  }
};

export const getExerciseIndexForPerson = ({
  personIndex,
  intervalIndex,
  roundIndex,
  selectedExerciseCount
}: {
  personIndex: number;
  intervalIndex: number;
  roundIndex: number;
  selectedExerciseCount: number;
}): number => {
  if (selectedExerciseCount <= 0 || !Number.isInteger(selectedExerciseCount)) {
    throw new RangeError("selectedExerciseCount must be a positive whole number.");
  }

  return (intervalIndex + personIndex + roundIndex) % selectedExerciseCount;
};

export const createAssignments = (input: ScheduleInput): Assignment[] => {
  assertScheduleInput(input);

  return input.activePeople.map((person, personIndex) => {
    const exerciseIndex = getExerciseIndexForPerson({
      personIndex,
      intervalIndex: input.intervalIndex,
      roundIndex: input.roundIndex,
      selectedExerciseCount: input.selectedExercises.length
    });
    const exercise = input.selectedExercises[exerciseIndex];

    if (!exercise) {
      throw new RangeError("Computed exercise index was outside the selected exercise list.");
    }

    return {
      personId: person.id,
      exerciseId: exercise.id,
      roundIndex: input.roundIndex,
      intervalIndex: input.intervalIndex
    };
  });
};

export const createAssignmentsForConfig = (
  config: WorkoutConfig,
  roundIndex: number,
  intervalIndex: number
): Assignment[] =>
  createAssignments({
    activePeople: getActivePeople(config),
    selectedExercises: getSelectedExercises(config),
    roundIndex,
    intervalIndex
  });

export const getExerciseCoverageForPerson = (
  config: WorkoutConfig,
  personId: string,
  roundIndex: number
): string[] => {
  const intervalsPerRound = getWorkIntervalsPerRound(config);
  const coverage: string[] = [];

  for (let intervalIndex = 0; intervalIndex < intervalsPerRound; intervalIndex += 1) {
    const assignment = createAssignmentsForConfig(config, roundIndex, intervalIndex).find(
      (item) => item.personId === personId
    );

    if (assignment) {
      coverage.push(assignment.exerciseId);
    }
  }

  return coverage;
};
