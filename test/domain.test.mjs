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
import { START_LIMITS, TIMER_LIMITS, validateConfig, validateStartWorkout } from "../dist/domain/validation.js";

test("default config contains the eight HYROX stations and no running station", () => {
  const config = createDefaultConfig();

  assert.equal(DEFAULT_EXERCISES.length, 8);
  assert.deepEqual(DEFAULT_TIMER_SETTINGS, {
    getReadySeconds: 30,
    workSeconds: 40,
    intervalRestSeconds: 20,
    roundBreakSeconds: 90
  });
  assert.deepEqual(TIMER_LIMITS, {
    getReadySeconds: { min: 5, max: 300 },
    workSeconds: { min: 5, max: 300 },
    intervalRestSeconds: { min: 5, max: 300 },
    roundBreakSeconds: { min: 5, max: 300 }
  });
  assert.deepEqual(START_LIMITS, {
    activePeople: { min: 1, max: 12 },
    selectedExercises: { max: 20 }
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

test("start validation enforces active people and selected exercise count limits", () => {
  const createPerson = (index) => ({
    id: `person_${index}`,
    name: `Person ${index}`,
    active: true
  });
  const createExercise = (index) => ({
    id: `exercise_${index}`,
    name: `Exercise ${index}`,
    iconId: "rowing",
    builtIn: false,
    selected: true
  });

  const tooManyActivePeople = createDefaultConfig();
  tooManyActivePeople.people = Array.from({ length: 13 }, (_, index) => createPerson(index));
  tooManyActivePeople.exercises = Array.from({ length: 13 }, (_, index) => createExercise(index));
  tooManyActivePeople.selectedExerciseIds = tooManyActivePeople.exercises.map((exercise) => exercise.id);

  assert.deepEqual(
    validateStartWorkout(tooManyActivePeople).issues.map((issue) => issue.code),
    ["too_many_active_people"]
  );

  const tooManySelectedExercises = createDefaultConfig();
  tooManySelectedExercises.people = Array.from({ length: 12 }, (_, index) => createPerson(index));
  tooManySelectedExercises.exercises = Array.from({ length: 21 }, (_, index) => createExercise(index));
  tooManySelectedExercises.selectedExerciseIds = tooManySelectedExercises.exercises.map((exercise) => exercise.id);

  assert.deepEqual(
    validateStartWorkout(tooManySelectedExercises).issues.map((issue) => issue.code),
    ["too_many_exercises"]
  );

  const validEdge = createDefaultConfig();
  validEdge.people = Array.from({ length: 12 }, (_, index) => createPerson(index));
  validEdge.exercises = Array.from({ length: 20 }, (_, index) => createExercise(index));
  validEdge.selectedExerciseIds = validEdge.exercises.map((exercise) => exercise.id);

  assert.equal(validateStartWorkout(validEdge).valid, true);
});

test("timer validation enforces five to three hundred seconds for every timer", () => {
  const timerKeys = ["getReadySeconds", "workSeconds", "intervalRestSeconds", "roundBreakSeconds"];

  for (const key of timerKeys) {
    const belowMinimum = createDefaultConfig();
    belowMinimum.people = [{ id: "p1", name: "Alice", active: true }];
    belowMinimum.selectedExerciseIds = ["rowing"];
    belowMinimum.timer[key] = 4;

    assert.deepEqual(
      validateStartWorkout(belowMinimum).issues.map((issue) => issue.code),
      ["invalid_timer"]
    );

    const aboveMaximum = createDefaultConfig();
    aboveMaximum.timer[key] = 301;
    const configResult = validateConfig(aboveMaximum);

    assert.equal(configResult.valid, false);
    assert.deepEqual(
      configResult.issues.map((issue) => issue.code),
      ["invalid_timer_settings"]
    );
  }
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
    getReadySeconds: 25,
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

test("share link codec restores legacy timer payloads without get ready seconds", () => {
  const legacyConfig = createDefaultConfig();
  delete legacyConfig.timer.getReadySeconds;

  const encoded = Buffer.from(JSON.stringify(legacyConfig), "utf8").toString("base64url");
  const decoded = decodeConfig(encoded);

  assert.ok(decoded);
  assert.equal(decoded.timer.getReadySeconds, 30);
  assert.equal(decoded.timer.workSeconds, 40);
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
