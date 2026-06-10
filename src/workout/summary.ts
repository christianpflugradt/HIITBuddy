import { type WorkoutSession } from "../domain/types.js";
import { getActivePeople, getSelectedExercises } from "./scheduler.js";

export type WorkoutSummary = {
  completedRounds: number;
  abandonedRounds: number;
  activeParticipants: number;
  selectedExercises: number;
  elapsedSeconds: number;
};

export const getWorkoutSummary = (session: WorkoutSession, now: DOMHighResTimeStamp = session.finishedAt ?? 0): WorkoutSummary => {
  const finishedAt = session.finishedAt ?? now;
  const elapsedSeconds = Math.max(0, Math.round((finishedAt - session.sessionStartedAt) / 1000));

  return {
    completedRounds: session.completedRounds,
    abandonedRounds: session.abandonedRounds,
    activeParticipants: getActivePeople(session.config).length,
    selectedExercises: getSelectedExercises(session.config).length,
    elapsedSeconds
  };
};

export const formatElapsedTime = (elapsedSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.round(elapsedSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
