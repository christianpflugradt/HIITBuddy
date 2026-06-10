import test from "node:test";
import assert from "node:assert/strict";

import { createDefaultConfig } from "../dist/config/default-config.js";
import { resolveAutoExerciseIcons } from "../dist/icons/auto-icon-resolution.js";
import { AUTO_ICON_ID, CONCRETE_EXERCISE_ICON_IDS } from "../dist/icons/icon-registry.js";

test("auto exercise icons resolve uniquely against workout icons", () => {
  const config = createDefaultConfig();
  const autoExercises = [
    {
      id: "custom_auto_1",
      name: "Custom Auto 1",
      iconId: AUTO_ICON_ID,
      builtIn: false,
      selected: true
    },
    {
      id: "custom_auto_2",
      name: "Custom Auto 2",
      iconId: AUTO_ICON_ID,
      builtIn: false,
      selected: true
    },
    {
      id: "custom_unselected_auto",
      name: "Custom Unselected Auto",
      iconId: AUTO_ICON_ID,
      builtIn: false,
      selected: false
    }
  ];

  config.exercises = config.exercises
    .map((exercise) => ({
      ...exercise,
      selected: exercise.id === "rowing" || exercise.id === "sled_push"
    }))
    .concat(autoExercises);
  config.selectedExerciseIds = ["rowing", "sled_push", "custom_auto_1", "custom_auto_2"];

  const resolvedConfig = resolveAutoExerciseIcons(config);
  const selectedExercises = resolvedConfig.exercises.filter((exercise) =>
    resolvedConfig.selectedExerciseIds.includes(exercise.id)
  );
  const selectedIconIds = selectedExercises.map((exercise) => exercise.iconId);
  const resolvedAutoIconIds = ["custom_auto_1", "custom_auto_2"].map(
    (exerciseId) => resolvedConfig.exercises.find((exercise) => exercise.id === exerciseId)?.iconId
  );

  assert.equal(selectedIconIds.includes(AUTO_ICON_ID), false);
  assert.equal(new Set(selectedIconIds).size, selectedIconIds.length);
  assert.equal(resolvedConfig.exercises.find((exercise) => exercise.id === "custom_unselected_auto")?.iconId, AUTO_ICON_ID);

  for (const iconId of resolvedAutoIconIds) {
    assert.ok(iconId);
    assert.equal(CONCRETE_EXERCISE_ICON_IDS.includes(iconId), true);
    assert.equal(["rowing", "sled_push"].includes(iconId), false);
  }
});
