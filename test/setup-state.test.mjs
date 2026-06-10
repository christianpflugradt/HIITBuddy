import test from "node:test";
import assert from "node:assert/strict";

import { createDefaultConfig } from "../dist/config/default-config.js";
import {
  addCustomExercise,
  addPerson,
  getStartValidation,
  removeCustomExercise,
  removePerson,
  setExerciseSelected,
  setPersonActive,
  updateTimerSetting
} from "../dist/setup/setup-state.js";

test("setup state can add, pool, activate, and remove people", () => {
  let config = createDefaultConfig();

  config = addPerson(config, "  Alice  ");
  assert.equal(config.people.length, 1);
  assert.equal(config.people[0].name, "Alice");
  assert.equal(config.people[0].active, true);

  const personId = config.people[0].id;
  config = setPersonActive(config, personId, false);
  assert.equal(config.people[0].active, false);

  config = setPersonActive(config, personId, true);
  assert.equal(config.people[0].active, true);

  config = removePerson(config, personId);
  assert.equal(config.people.length, 0);
});

test("setup state can add, deselect, select, and remove custom exercises", () => {
  let config = createDefaultConfig();

  config = addCustomExercise(config, " Kettlebell Row ", "kettlebell_row");
  const customExercise = config.exercises.at(-1);

  assert.ok(customExercise);
  assert.equal(customExercise.name, "Kettlebell Row");
  assert.equal(customExercise.builtIn, false);
  assert.equal(config.selectedExerciseIds.includes(customExercise.id), true);

  config = setExerciseSelected(config, customExercise.id, false);
  assert.equal(config.selectedExerciseIds.includes(customExercise.id), false);
  assert.equal(config.exercises.find((exercise) => exercise.id === customExercise.id)?.selected, false);

  config = setExerciseSelected(config, customExercise.id, true);
  assert.equal(config.selectedExerciseIds.includes(customExercise.id), true);

  config = removeCustomExercise(config, customExercise.id);
  assert.equal(config.exercises.some((exercise) => exercise.id === customExercise.id), false);
});

test("setup state protects built-in exercises from removal", () => {
  const config = createDefaultConfig();
  const nextConfig = removeCustomExercise(config, "rowing");

  assert.equal(nextConfig, config);
  assert.equal(nextConfig.exercises.some((exercise) => exercise.id === "rowing"), true);
});

test("timer updates and start validation reflect setup state", () => {
  let config = createDefaultConfig();

  config = updateTimerSetting(config, "getReadySeconds", "35");
  config = updateTimerSetting(config, "workSeconds", "45");
  config = updateTimerSetting(config, "intervalRestSeconds", 10);
  assert.equal(config.timer.getReadySeconds, 35);
  assert.equal(config.timer.workSeconds, 45);
  assert.equal(config.timer.intervalRestSeconds, 10);

  assert.deepEqual(
    getStartValidation(config).issues.map((issue) => issue.code),
    ["no_active_people", "no_exercises"]
  );

  config = addPerson(config, "Mina");
  config = setExerciseSelected(config, "rowing", true);
  assert.equal(getStartValidation(config).valid, true);
});
