import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_EXERCISES } from "../dist/config/default-config.js";
import {
  AUTO_ICON_ID,
  CONCRETE_EXERCISE_ICON_IDS,
  EXERCISE_ICON_IDS,
  findIconAssets,
  getIconAsset,
  getIconAssets,
  getUniqueRandomConcreteIconIds,
  hasIcon,
  renderExerciseIcon
} from "../dist/icons/icon-registry.js";

test("icon registry contains HYROX defaults plus custom exercise examples", () => {
  const expectedIds = [
    "auto",
    "skierg",
    "sled_push",
    "sled_pull",
    "burpee_broad_jumps",
    "rowing",
    "farmers_carry",
    "sandbag_lunges",
    "wall_balls",
    "kettlebell_row",
    "lunges",
    "push_ups",
    "air_squats",
    "plank",
    "box_jumps",
    "jump_rope",
    "pull_ups",
    "battle_ropes",
    "kettlebell_swings",
    "dumbbell_press",
    "deadlift",
    "sit_ups",
    "mountain_climbers",
    "medicine_ball_slams",
    "step_ups",
    "bike",
    "thrusters"
  ];

  assert.deepEqual(EXERCISE_ICON_IDS, expectedIds);
  assert.equal(getIconAssets().length, expectedIds.length);
  assert.equal(AUTO_ICON_ID, "auto");
  assert.equal(CONCRETE_EXERCISE_ICON_IDS.includes(AUTO_ICON_ID), false);
  assert.equal(CONCRETE_EXERCISE_ICON_IDS.length, expectedIds.length - 1);
  assert.equal(hasIcon("kettlebell_row"), true);
  assert.equal(hasIcon("lunges"), true);
  assert.equal(hasIcon("auto"), true);
});

test("every default exercise references an available icon", () => {
  for (const exercise of DEFAULT_EXERCISES) {
    assert.equal(hasIcon(exercise.iconId), true, `${exercise.name} icon is missing`);
  }
});

test("unique random concrete icon selection excludes reserved icons and duplicates", () => {
  const reservedIconIds = CONCRETE_EXERCISE_ICON_IDS.slice(0, 3);
  const selectedIconIds = getUniqueRandomConcreteIconIds(5, reservedIconIds);

  assert.equal(selectedIconIds.length, 5);
  assert.equal(new Set(selectedIconIds).size, selectedIconIds.length);

  for (const iconId of selectedIconIds) {
    assert.equal(reservedIconIds.includes(iconId), false);
    assert.equal(CONCRETE_EXERCISE_ICON_IDS.includes(iconId), true);
  }

  assert.throws(
    () => getUniqueRandomConcreteIconIds(CONCRETE_EXERCISE_ICON_IDS.length + 1),
    /Not enough unique exercise icons/
  );
});

test("rendered icons are inline SVGs without text or external image references", () => {
  for (const icon of getIconAssets()) {
    assert.match(icon.svg, /^<svg /);
    assert.match(icon.svg, /viewBox="0 0 64 64"/);
    assert.match(icon.svg, /stroke-linecap="round"/);
    assert.doesNotMatch(icon.svg, /<text\b/i);
    assert.doesNotMatch(icon.svg, /<title\b/i);
    assert.doesNotMatch(icon.svg, /href=/i);
    assert.equal(icon.svg.includes(icon.label), false);
  }
});

test("render helper supports decorative and labelled output", () => {
  const decorativeSvg = renderExerciseIcon("sled_push", {
    className: "exercise-icon"
  });
  const labelledSvg = renderExerciseIcon("sled_push", {
    decorative: false
  });

  assert.match(decorativeSvg, /class="exercise-icon"/);
  assert.match(decorativeSvg, /aria-hidden="true"/);
  assert.match(labelledSvg, /role="img"/);
  assert.match(labelledSvg, /aria-label="Sled Push"/);
  assert.throws(() => renderExerciseIcon("unknown"), /Unknown exercise icon/);
});

test("icon search matches labels, ids, and tags", () => {
  assert.deepEqual(
    findIconAssets("sled").map((icon) => icon.id),
    ["sled_push", "sled_pull"]
  );
  assert.deepEqual(
    findIconAssets("kettlebell").map((icon) => icon.id),
    ["kettlebell_row", "kettlebell_swings"]
  );
  assert.deepEqual(
    findIconAssets("auto").map((icon) => icon.id),
    ["auto"]
  );
  assert.equal(findIconAssets("").length, getIconAssets().length);
  assert.equal(getIconAsset("rowing")?.label, "Rowing");
});
