import test from "node:test";
import assert from "node:assert/strict";

import { createDefaultConfig } from "../dist/config/default-config.js";
import {
  createAssignmentsForConfig,
  getExerciseCoverageForPerson,
  getSelectedExercises,
  getWorkIntervalsPerRound
} from "../dist/workout/scheduler.js";
import {
  advanceAfterCountdown,
  advanceIfPhaseComplete,
  createWorkoutSession,
  extendCurrentPhase,
  finishWorkout,
  shouldShowRoundBreakAssignmentPreview,
  skipCurrentExercise,
  skipToRoundBreak
} from "../dist/workout/session.js";
import { createTimerState, extendTimer, getTimerSnapshot } from "../dist/workout/timer.js";

const createConfigWithPeople = () => {
  const config = createDefaultConfig();
  config.people = [
    { id: "alice", name: "Alice", active: true },
    { id: "ben", name: "Ben", active: true },
    { id: "cara", name: "Cara", active: true },
    { id: "pool", name: "Pool Person", active: false }
  ];
  config.selectedExerciseIds = ["sled_push", "rowing", "wall_balls", "farmers_carry"];
  return config;
};

test("scheduler assigns unique exercises and covers every selected station per person", () => {
  const config = createConfigWithPeople();
  const selectedExercises = getSelectedExercises(config);

  assert.equal(getWorkIntervalsPerRound(config), 4);
  assert.deepEqual(
    selectedExercises.map((exercise) => exercise.id),
    ["sled_push", "rowing", "wall_balls", "farmers_carry"]
  );

  for (let intervalIndex = 0; intervalIndex < selectedExercises.length; intervalIndex += 1) {
    const assignments = createAssignmentsForConfig(config, 0, intervalIndex);
    const assignedExerciseIds = assignments.map((assignment) => assignment.exerciseId);

    assert.equal(assignments.length, 3);
    assert.equal(new Set(assignedExerciseIds).size, assignedExerciseIds.length);
  }

  for (const personId of ["alice", "ben", "cara"]) {
    assert.deepEqual(new Set(getExerciseCoverageForPerson(config, personId, 0)), new Set(config.selectedExerciseIds));
  }
});

test("scheduler shifts the starting exercise by round", () => {
  const config = createConfigWithPeople();
  const roundOne = createAssignmentsForConfig(config, 0, 0);
  const roundTwo = createAssignmentsForConfig(config, 1, 0);

  assert.equal(roundOne.find((assignment) => assignment.personId === "alice")?.exerciseId, "sled_push");
  assert.equal(roundTwo.find((assignment) => assignment.personId === "alice")?.exerciseId, "rowing");
});

test("scheduler rejects more active people than selected exercises", () => {
  const config = createConfigWithPeople();
  config.people = [
    { id: "p1", name: "One", active: true },
    { id: "p2", name: "Two", active: true },
    { id: "p3", name: "Three", active: true }
  ];
  config.selectedExerciseIds = ["rowing", "wall_balls"];

  assert.throws(() => createAssignmentsForConfig(config, 0, 0), /less than or equal/);
});

test("timer snapshot uses monotonic elapsed time and repeatable extensions", () => {
  const timer = createTimerState({
    startedAt: 1000,
    baseDurationSeconds: 40
  });

  assert.deepEqual(getTimerSnapshot(timer, 1000), {
    elapsedSeconds: 0,
    totalSeconds: 40,
    remainingSeconds: 40,
    isComplete: false
  });
  assert.equal(getTimerSnapshot(timer, 1500).remainingSeconds, 40);
  assert.equal(getTimerSnapshot(timer, 40500).remainingSeconds, 1);
  assert.equal(getTimerSnapshot(timer, 41000).remainingSeconds, 0);
  assert.equal(getTimerSnapshot(timer, 41000).isComplete, true);

  const extended = extendTimer(extendTimer(timer, 5), 10);
  assert.equal(extended.addedSeconds, 15);
  assert.equal(getTimerSnapshot(extended, 41000).remainingSeconds, 15);
});

test("session advances through start, work, rest, completed round break, and next round", () => {
  const config = createConfigWithPeople();
  config.timer.getReadySeconds = 12;
  const initial = createWorkoutSession(config, 0);

  assert.equal(initial.phase, "round_start");
  assert.equal(initial.phaseDurationSeconds, 12);
  assert.equal(initial.roundIndex, 0);
  assert.equal(initial.intervalIndex, 0);

  const firstWork = advanceAfterCountdown(initial, 12_000);
  assert.equal(firstWork.phase, "work");
  assert.equal(firstWork.phaseDurationSeconds, 40);

  const rest = advanceAfterCountdown(firstWork, 70_000);
  assert.equal(rest.phase, "interval_rest");
  assert.equal(rest.phaseDurationSeconds, 20);

  const nextWork = advanceAfterCountdown(rest, 90_000);
  assert.equal(nextWork.phase, "work");
  assert.equal(nextWork.intervalIndex, 1);

  const finalWork = {
    ...nextWork,
    intervalIndex: 3
  };
  const roundBreak = advanceAfterCountdown(finalWork, 130_000);
  assert.equal(roundBreak.phase, "round_break");
  assert.equal(roundBreak.completedRounds, 1);
  assert.equal(roundBreak.abandonedRounds, 0);
  assert.equal(roundBreak.phaseDurationSeconds, 90);

  const nextRound = advanceAfterCountdown(roundBreak, 220_000);
  assert.equal(nextRound.phase, "work");
  assert.equal(nextRound.roundIndex, 1);
  assert.equal(nextRound.intervalIndex, 0);
});

test("session skip exercise goes to rest or completed round break", () => {
  const config = createConfigWithPeople();
  const initial = advanceAfterCountdown(createWorkoutSession(config, 0), 30_000);
  const rest = skipCurrentExercise(initial, 31_000);

  assert.equal(rest.phase, "interval_rest");
  assert.equal(rest.completedRounds, 0);

  const finalWork = {
    ...initial,
    intervalIndex: 3
  };
  const roundBreak = skipCurrentExercise(finalWork, 2_000);

  assert.equal(roundBreak.phase, "round_break");
  assert.equal(roundBreak.completedRounds, 1);
  assert.equal(roundBreak.abandonedRounds, 0);
});

test("session skip to round break records abandoned rounds and finish is only available there", () => {
  const config = createConfigWithPeople();
  const initial = advanceAfterCountdown(createWorkoutSession(config, 0), 30_000);
  const abandonedBreak = skipToRoundBreak(initial, 31_000);

  assert.equal(abandonedBreak.phase, "round_break");
  assert.equal(abandonedBreak.completedRounds, 0);
  assert.equal(abandonedBreak.abandonedRounds, 1);

  assert.throws(() => finishWorkout(initial, 2_000), /only be finished during round break/);

  const summary = finishWorkout(abandonedBreak, 2_000);
  assert.equal(summary.phase, "summary");
  assert.equal(summary.finishedAt, 2_000);
});

test("session extensions apply only to rest phases and phase completion honors added seconds", () => {
  const config = createConfigWithPeople();
  const initial = advanceAfterCountdown(createWorkoutSession(config, 0), 30_000);
  const rest = skipCurrentExercise(initial, 31_000);
  const extendedRest = extendCurrentPhase(extendCurrentPhase(rest, 5), 10);

  assert.equal(extendedRest.addedSeconds, 15);
  assert.equal(advanceIfPhaseComplete(extendedRest, 65_999).phase, "interval_rest");
  assert.equal(advanceIfPhaseComplete(extendedRest, 66_000).phase, "work");
  assert.throws(() => extendCurrentPhase(initial, 5), /Only rest and round break/);
});

test("round break assignment preview appears in the final 30 seconds or immediately for short breaks", () => {
  assert.equal(
    shouldShowRoundBreakAssignmentPreview({
      phase: "round_break",
      totalSeconds: 90,
      remainingSeconds: 31
    }),
    false
  );
  assert.equal(
    shouldShowRoundBreakAssignmentPreview({
      phase: "round_break",
      totalSeconds: 90,
      remainingSeconds: 30
    }),
    true
  );
  assert.equal(
    shouldShowRoundBreakAssignmentPreview({
      phase: "round_break",
      totalSeconds: 20,
      remainingSeconds: 20
    }),
    true
  );
  assert.equal(
    shouldShowRoundBreakAssignmentPreview({
      phase: "work",
      totalSeconds: 20,
      remainingSeconds: 20
    }),
    false
  );
});
