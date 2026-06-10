import test from "node:test";
import assert from "node:assert/strict";

import { createDefaultConfig } from "../dist/config/default-config.js";
import { advanceAfterCountdown, createWorkoutSession, enterRoundBreak, finishWorkout } from "../dist/workout/session.js";
import { formatElapsedTime, getWorkoutSummary } from "../dist/workout/summary.js";

test("workout summary reports rounds, participants, exercises, and elapsed time", () => {
  const config = createDefaultConfig();
  config.people = [
    { id: "p1", name: "Alice", active: true },
    { id: "p2", name: "Ben", active: false }
  ];
  config.selectedExerciseIds = ["rowing", "wall_balls"];

  const started = createWorkoutSession(config, 1_000);
  const work = advanceAfterCountdown(started, 31_000);
  const breakSession = enterRoundBreak(work, 71_000, "completed");
  const finished = finishWorkout(breakSession, 126_000);
  const summary = getWorkoutSummary(finished);

  assert.deepEqual(summary, {
    completedRounds: 1,
    abandonedRounds: 0,
    activeParticipants: 1,
    selectedExercises: 2,
    elapsedSeconds: 125
  });
});

test("elapsed time formatting stays compact", () => {
  assert.equal(formatElapsedTime(0), "0:00");
  assert.equal(formatElapsedTime(9), "0:09");
  assert.equal(formatElapsedTime(65), "1:05");
  assert.equal(formatElapsedTime(3661), "1:01:01");
});
