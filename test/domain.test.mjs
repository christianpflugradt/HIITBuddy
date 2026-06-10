import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_EXERCISES,
  DEFAULT_SELECTED_EXERCISE_IDS,
  DEFAULT_TIMER_SETTINGS,
  createDefaultConfig
} from "../dist/config/default-config.js";
import {
  CONFIG_QUERY_PARAMETER,
  createShareUrl,
  decodeConfig,
  decodeConfigOrDefault,
  encodeConfig,
  readConfigFromUrl
} from "../dist/domain/share-link.js";
import { validateConfig, validateStartWorkout } from "../dist/domain/validation.js";

test("default config contains the eight HYROX stations and no running station", () => {
  const config = createDefaultConfig();

  assert.equal(DEFAULT_EXERCISES.length, 8);
  assert.deepEqual(DEFAULT_TIMER_SETTINGS, {
    workSeconds: 40,
    intervalRestSeconds: 20,
    roundBreakSeconds: 90
  });
  assert.deepEqual(config.selectedExerciseIds, DEFAULT_SELECTED_EXERCISE_IDS);
  assert.equal(config.people.length, 0);
  assert.equal(config.exercises.some((exercise) => exercise.name.toLowerCase() === "running"), false);
  assert.equal(config.exercises.every((exercise) => exercise.builtIn && !exercise.selected), true);
});

test("start validation blocks empty people, empty exercises, too many people, and invalid timers", () => {
  const emptyConfig = createDefaultConfig();
  const emptyStart = validateStartWorkout(emptyConfig);

  assert.equal(emptyStart.valid, false);
  assert.deepEqual(
    emptyStart.issues.map((issue) => issue.code),
    ["no_active_people", "no_exercises"]
  );

  const tooManyPeople = createDefaultConfig();
  tooManyPeople.people = [
    { id: "p1", name: "Alice", active: true },
    { id: "p2", name: "Ben", active: true }
  ];
  tooManyPeople.selectedExerciseIds = ["rowing"];

  const tooManyStart = validateStartWorkout(tooManyPeople);
  assert.equal(tooManyStart.valid, false);
  assert.deepEqual(
    tooManyStart.issues.map((issue) => issue.code),
    ["too_many_people"]
  );

  const invalidTimer = createDefaultConfig();
  invalidTimer.people = [{ id: "p1", name: "Alice", active: true }];
  invalidTimer.selectedExerciseIds = ["rowing"];
  invalidTimer.timer.workSeconds = 4;

  const invalidTimerStart = validateStartWorkout(invalidTimer);
  assert.equal(invalidTimerStart.valid, false);
  assert.deepEqual(
    invalidTimerStart.issues.map((issue) => issue.code),
    ["invalid_timer"]
  );

  const noExercises = createDefaultConfig();
  noExercises.people = [{ id: "p1", name: "Alice", active: true }];
  noExercises.selectedExerciseIds = [];

  const noExerciseStart = validateStartWorkout(noExercises);
  assert.equal(noExerciseStart.valid, false);
  assert.deepEqual(
    noExerciseStart.issues.map((issue) => issue.code),
    ["no_exercises"]
  );
});

test("config validation trims names and normalizes selected exercise flags", () => {
  const config = createDefaultConfig();
  config.people = [{ id: "p1", name: "  Carla  ", active: true }];
  config.exercises = config.exercises.map((exercise) => ({
    ...exercise,
    selected: false
  }));
  config.selectedExerciseIds = ["rowing", "wall_balls"];

  const result = validateConfig(config);

  assert.equal(result.valid, true);
  assert.equal(result.config.people[0].name, "Carla");
  assert.deepEqual(
    result.config.exercises.filter((exercise) => exercise.selected).map((exercise) => exercise.id),
    ["rowing", "wall_balls"]
  );
});

test("config validation rejects duplicate and unknown selected exercise ids", () => {
  const duplicateConfig = createDefaultConfig();
  duplicateConfig.selectedExerciseIds = ["rowing", "rowing"];

  const duplicateResult = validateConfig(duplicateConfig);
  assert.equal(duplicateResult.valid, false);
  assert.deepEqual(
    duplicateResult.issues.map((issue) => issue.code),
    ["duplicate_selected_exercise"]
  );

  const unknownConfig = createDefaultConfig();
  unknownConfig.selectedExerciseIds = ["rowing", "not_real"];

  const unknownResult = validateConfig(unknownConfig);
  assert.equal(unknownResult.valid, false);
  assert.deepEqual(
    unknownResult.issues.map((issue) => issue.code),
    ["unknown_selected_exercise"]
  );
});

test("share link codec round-trips config data and falls back on invalid payloads", () => {
  const config = createDefaultConfig();
  config.people = [
    { id: "p1", name: "Jörg", active: true },
    { id: "p2", name: "Mina", active: false }
  ];
  config.selectedExerciseIds = ["sled_push", "rowing"];
  config.timer = {
    workSeconds: 45,
    intervalRestSeconds: 15,
    roundBreakSeconds: 120
  };

  const encoded = encodeConfig(config);
  const decoded = decodeConfig(encoded);

  assert.ok(decoded);
  assert.deepEqual(decoded.people, config.people);
  assert.deepEqual(decoded.selectedExerciseIds, config.selectedExerciseIds);
  assert.deepEqual(decoded.timer, config.timer);
  assert.equal(encoded.includes("+"), false);
  assert.equal(encoded.includes("/"), false);
  assert.equal(encoded.includes("="), false);
  assert.deepEqual(decodeConfigOrDefault("not valid base64").selectedExerciseIds, DEFAULT_SELECTED_EXERCISE_IDS);
});

test("share URL helpers write and read the config query parameter", () => {
  const config = createDefaultConfig();
  config.people = [{ id: "p1", name: "Alice", active: true }];

  const shareUrl = createShareUrl(config, "https://example.test/workout?existing=1");
  const parsedUrl = new URL(shareUrl);
  const restored = readConfigFromUrl(shareUrl);

  assert.equal(parsedUrl.searchParams.get("existing"), "1");
  assert.ok(parsedUrl.searchParams.get(CONFIG_QUERY_PARAMETER));
  assert.deepEqual(restored.people, config.people);
  assert.deepEqual(readConfigFromUrl("https://example.test/").selectedExerciseIds, DEFAULT_SELECTED_EXERCISE_IDS);
});
