import { type SessionPhase, type WorkoutConfig, type WorkoutSession } from "../domain/types.js";
import { getTimerSnapshot } from "./timer.js";
import { isFinalIntervalOfRound } from "./scheduler.js";

export type RoundBreakReason = "completed" | "abandoned";

export const ROUND_BREAK_ASSIGNMENT_PREVIEW_SECONDS = 30;

export const shouldShowRoundBreakAssignmentPreview = ({
  phase,
  remainingSeconds,
  totalSeconds
}: {
  phase: SessionPhase;
  remainingSeconds: number;
  totalSeconds: number;
}): boolean =>
  phase === "round_break" &&
  (totalSeconds <= ROUND_BREAK_ASSIGNMENT_PREVIEW_SECONDS ||
    remainingSeconds <= ROUND_BREAK_ASSIGNMENT_PREVIEW_SECONDS);

export const getPhaseDurationSeconds = (config: WorkoutConfig, phase: SessionPhase): number => {
  switch (phase) {
    case "round_start":
      return config.timer.getReadySeconds;
    case "work":
      return config.timer.workSeconds;
    case "interval_rest":
      return config.timer.intervalRestSeconds;
    case "round_break":
      return config.timer.roundBreakSeconds;
    case "setup":
    case "summary":
      return 0;
  }
};

export const createWorkoutSession = (config: WorkoutConfig, now: DOMHighResTimeStamp): WorkoutSession => ({
  config,
  phase: "round_start",
  roundIndex: 0,
  intervalIndex: 0,
  phaseStartedAt: now,
  phaseDurationSeconds: getPhaseDurationSeconds(config, "round_start"),
  addedSeconds: 0,
  sessionStartedAt: now,
  completedRounds: 0,
  abandonedRounds: 0
});

export const enterPhase = (
  session: WorkoutSession,
  phase: SessionPhase,
  now: DOMHighResTimeStamp,
  overrides: Partial<Pick<WorkoutSession, "roundIndex" | "intervalIndex" | "completedRounds" | "abandonedRounds">> = {}
): WorkoutSession => ({
  ...session,
  ...overrides,
  phase,
  phaseStartedAt: now,
  phaseDurationSeconds: getPhaseDurationSeconds(session.config, phase),
  addedSeconds: 0
});

export const extendCurrentPhase = (session: WorkoutSession, seconds: number): WorkoutSession => {
  if (session.phase !== "interval_rest" && session.phase !== "round_break") {
    throw new Error("Only rest and round break phases can be extended.");
  }

  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError("Extension seconds must be a non-negative number.");
  }

  return {
    ...session,
    addedSeconds: session.addedSeconds + seconds
  };
};

export const enterIntervalRest = (session: WorkoutSession, now: DOMHighResTimeStamp): WorkoutSession =>
  enterPhase(session, "interval_rest", now);

export const enterRoundBreak = (
  session: WorkoutSession,
  now: DOMHighResTimeStamp,
  reason: RoundBreakReason
): WorkoutSession =>
  enterPhase(session, "round_break", now, {
    completedRounds: session.completedRounds + (reason === "completed" ? 1 : 0),
    abandonedRounds: session.abandonedRounds + (reason === "abandoned" ? 1 : 0)
  });

export const skipCurrentExercise = (session: WorkoutSession, now: DOMHighResTimeStamp): WorkoutSession => {
  if (session.phase !== "work") {
    throw new Error("Current exercise can only be skipped during work.");
  }

  return isFinalIntervalOfRound(session.config, session.intervalIndex)
    ? enterRoundBreak(session, now, "completed")
    : enterIntervalRest(session, now);
};

export const skipToRoundBreak = (session: WorkoutSession, now: DOMHighResTimeStamp): WorkoutSession => {
  if (session.phase !== "work") {
    throw new Error("Round break can only be skipped to during work.");
  }

  return enterRoundBreak(session, now, "abandoned");
};

export const finishWorkout = (session: WorkoutSession, now: DOMHighResTimeStamp): WorkoutSession => {
  if (session.phase !== "round_break") {
    throw new Error("Workout can only be finished during round break.");
  }

  return {
    ...enterPhase(session, "summary", now),
    finishedAt: now
  };
};

export const advanceAfterCountdown = (session: WorkoutSession, now: DOMHighResTimeStamp): WorkoutSession => {
  switch (session.phase) {
    case "round_start":
      return enterPhase(session, "work", now);
    case "work":
      return isFinalIntervalOfRound(session.config, session.intervalIndex)
        ? enterRoundBreak(session, now, "completed")
        : enterIntervalRest(session, now);
    case "interval_rest":
      return enterPhase(session, "work", now, {
        intervalIndex: session.intervalIndex + 1
      });
    case "round_break":
      return enterPhase(session, "work", now, {
        roundIndex: session.roundIndex + 1,
        intervalIndex: 0
      });
    case "setup":
    case "summary":
      return session;
  }
};

export const advanceIfPhaseComplete = (session: WorkoutSession, now: DOMHighResTimeStamp): WorkoutSession => {
  const snapshot = getTimerSnapshot(
    {
      startedAt: session.phaseStartedAt,
      baseDurationSeconds: session.phaseDurationSeconds,
      addedSeconds: session.addedSeconds
    },
    now
  );

  return snapshot.isComplete ? advanceAfterCountdown(session, now) : session;
};
