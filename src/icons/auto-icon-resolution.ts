import { type WorkoutConfig } from "../domain/types.js";
import { AUTO_ICON_ID, getUniqueRandomConcreteIconIds } from "./icon-registry.js";

export const resolveAutoExerciseIcons = (workoutConfig: WorkoutConfig): WorkoutConfig => {
  const selectedExerciseIds = new Set(workoutConfig.selectedExerciseIds);
  const selectedAutoExerciseIds = workoutConfig.exercises
    .filter((exercise) => selectedExerciseIds.has(exercise.id) && exercise.iconId === AUTO_ICON_ID)
    .map((exercise) => exercise.id);
  const reservedIconIds = workoutConfig.exercises
    .filter((exercise) => selectedExerciseIds.has(exercise.id) && exercise.iconId !== AUTO_ICON_ID)
    .map((exercise) => exercise.iconId);
  const resolvedIconIds = getUniqueRandomConcreteIconIds(selectedAutoExerciseIds.length, reservedIconIds);
  const resolvedIconIdByExerciseId = new Map(
    selectedAutoExerciseIds.map((exerciseId, index) => [exerciseId, resolvedIconIds[index]!])
  );

  return {
    ...workoutConfig,
    people: workoutConfig.people.map((person) => ({ ...person })),
    exercises: workoutConfig.exercises.map((exercise) => ({
      ...exercise,
      iconId: resolvedIconIdByExerciseId.get(exercise.id) ?? exercise.iconId
    })),
    timer: { ...workoutConfig.timer },
    selectedExerciseIds: [...workoutConfig.selectedExerciseIds],
    ...(workoutConfig.ui ? { ui: { ...workoutConfig.ui } } : {})
  };
};
