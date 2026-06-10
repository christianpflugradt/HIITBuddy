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

test("setup state caps active people at twelve", () => {
  let config = createDefaultConfig();

  for (let index = 1; index <= 13; index += 1) {
    config = addPerson(config, `Person ${index}`);
  }

  assert.equal(config.people.filter((person) => person.active).length, 12);
  assert.equal(config.people.filter((person) => !person.active).length, 1);

  const pooledPerson = config.people.find((person) => !person.active);
  assert.ok(pooledPerson);

  config = setPersonActive(config, pooledPerson.id, true);
  assert.equal(config.people.filter((person) => person.active).length, 12);
  assert.equal(config.people.find((person) => person.id === pooledPerson.id)?.active, false);

  const activePerson = config.people.find((person) => person.active);
  assert.ok(activePerson);

  config = setPersonActive(config, activePerson.id, false);
  config = setPersonActive(config, pooledPerson.id, true);
  assert.equal(config.people.filter((person) => person.active).length, 12);
  assert.equal(config.people.find((person) => person.id === pooledPerson.id)?.active, true);
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

test("setup state caps selected exercises at twenty", () => {
  let config = createDefaultConfig();

  for (const exercise of config.exercises) {
    config = setExerciseSelected(config, exercise.id, true);
  }

  for (let index = 1; index <= 13; index += 1) {
    config = addCustomExercise(config, `Custom ${index}`, "rowing");
  }

  const lastExercise = config.exercises.at(-1);
  assert.ok(lastExercise);
  assert.equal(config.selectedExerciseIds.length, 20);
  assert.equal(lastExercise.selected, false);
  assert.equal(config.selectedExerciseIds.includes(lastExercise.id), false);

  config = setExerciseSelected(config, lastExercise.id, true);
  assert.equal(config.selectedExerciseIds.length, 20);
  assert.equal(config.exercises.find((exercise) => exercise.id === lastExercise.id)?.selected, false);
});

test("timer updates and start validation reflect setup state", () => {
  let config = createDefaultConfig();

  config = updateTimerSetting(config, "getReadySeconds", "35");
  config = updateTimerSetting(config, "workSeconds", "45");
  config = updateTimerSetting(config, "intervalRestSeconds", 10);
  assert.equal(config.timer.getReadySeconds, 35);
  assert.equal(config.timer.workSeconds, 45);
  assert.equal(config.timer.intervalRestSeconds, 10);

  config = updateTimerSetting(config, "getReadySeconds", "0");
  config = updateTimerSetting(config, "workSeconds", 301);
  config = updateTimerSetting(config, "intervalRestSeconds", -10);
  config = updateTimerSetting(config, "roundBreakSeconds", "999");
  assert.equal(config.timer.getReadySeconds, 5);
  assert.equal(config.timer.workSeconds, 300);
  assert.equal(config.timer.intervalRestSeconds, 5);
  assert.equal(config.timer.roundBreakSeconds, 300);

  assert.deepEqual(
    getStartValidation(config).issues.map((issue) => issue.code),
    ["no_active_people", "no_exercises"]
  );

  config = addPerson(config, "Mina");
  config = setExerciseSelected(config, "rowing", true);
  assert.equal(getStartValidation(config).valid, true);
});
