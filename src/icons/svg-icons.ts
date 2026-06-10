export type SvgIconDefinition = {
  id: string;
  label: string;
  tags: string[];
  body: string;
};

export const SVG_ICON_DEFINITIONS: SvgIconDefinition[] = [
  {
    id: "auto",
    label: "Auto",
    tags: ["auto", "random", "unknown", "placeholder"],
    body: `
      <circle cx="32" cy="32" r="24" />
      <path d="M24 25c1-6 6-10 13-8 6 2 9 8 5 14-2 3-6 4-8 7-1 1-2 3-2 6" />
      <path d="M32 51h.1" />
    `
  },
  {
    id: "skierg",
    label: "SkiErg",
    tags: ["hyrox", "cardio", "machine", "pull"],
    body: `
      <path d="M43 8h9v48h-9" />
      <path d="M47 14 31 29" />
      <path d="M47 14 38 33" />
      <circle cx="27" cy="22" r="4" />
      <path d="M25 27 21 39 30 43" />
      <path d="M30 28 39 33" />
      <path d="M22 39 14 52" />
      <path d="M30 43 36 55" />
      <path d="M19 32 12 26" />
    `
  },
  {
    id: "sled_push",
    label: "Sled Push",
    tags: ["hyrox", "sled", "push", "legs"],
    body: `
      <path d="M13 53h38" />
      <path d="M19 46h24l8 7" />
      <path d="M24 46V29" />
      <path d="M39 46V23" />
      <path d="M28 33h8" />
      <circle cx="28" cy="18" r="4" />
      <path d="M27 23 21 34 30 39" />
      <path d="M30 27 39 23" />
      <path d="M22 35 14 45" />
      <path d="M30 39 38 51" />
    `
  },
  {
    id: "sled_pull",
    label: "Sled Pull",
    tags: ["hyrox", "sled", "pull", "rope"],
    body: `
      <path d="M10 53h24" />
      <path d="M14 46h18l5 7" />
      <path d="M17 46V31" />
      <path d="M28 46V27" />
      <path d="M35 42C44 38 48 31 54 22" />
      <path d="M40 39C47 35 50 29 56 19" />
      <circle cx="46" cy="18" r="4" />
      <path d="M45 23 40 35 48 42" />
      <path d="M41 34 33 42" />
      <path d="M48 42 55 53" />
      <path d="M41 35 44 52" />
    `
  },
  {
    id: "burpee_broad_jumps",
    label: "Burpee Broad Jumps",
    tags: ["hyrox", "bodyweight", "jump", "floor"],
    body: `
      <path d="M8 52h48" />
      <circle cx="18" cy="34" r="4" />
      <path d="M22 36 32 42 44 39" />
      <path d="M31 42 26 51" />
      <path d="M43 39 53 48" />
      <path d="M16 38 11 46" />
      <path d="M33 18c5-5 13-5 18 0" />
      <path d="M51 18h-8" />
      <path d="M51 18v8" />
      <circle cx="39" cy="22" r="3" />
      <path d="M38 25 34 33 42 35" />
    `
  },
  {
    id: "rowing",
    label: "Rowing",
    tags: ["hyrox", "cardio", "machine", "pull"],
    body: `
      <circle cx="48" cy="43" r="8" />
      <circle cx="48" cy="43" r="3" />
      <path d="M10 51h44" />
      <path d="M16 43h20" />
      <path d="M36 43 48 34" />
      <circle cx="24" cy="22" r="4" />
      <path d="M23 27 18 39 29 43" />
      <path d="M29 29 38 34" />
      <path d="M18 39 11 48" />
      <path d="M29 43 39 51" />
      <path d="M37 34h12" />
    `
  },
  {
    id: "farmers_carry",
    label: "Farmers Carry",
    tags: ["hyrox", "carry", "strength", "weights"],
    body: `
      <circle cx="32" cy="14" r="4" />
      <path d="M32 18v19" />
      <path d="M24 26h16" />
      <path d="M24 26 20 41" />
      <path d="M40 26 44 41" />
      <path d="M27 37 22 54" />
      <path d="M37 37 43 54" />
      <rect x="14" y="40" width="10" height="12" rx="2" />
      <rect x="40" y="40" width="10" height="12" rx="2" />
      <path d="M17 40v-4h4v4" />
      <path d="M43 40v-4h4v4" />
    `
  },
  {
    id: "sandbag_lunges",
    label: "Sandbag Lunges",
    tags: ["hyrox", "lunges", "legs", "sandbag"],
    body: `
      <circle cx="30" cy="15" r="4" />
      <rect x="20" y="20" width="24" height="8" rx="4" />
      <path d="M31 20 27 34 36 40" />
      <path d="M27 34 17 47" />
      <path d="M36 40 49 40" />
      <path d="M17 47h13" />
      <path d="M49 40 55 50" />
      <path d="M36 26 45 34" />
      <path d="M26 25 18 32" />
    `
  },
  {
    id: "wall_balls",
    label: "Wall Balls",
    tags: ["hyrox", "ball", "squat", "throw"],
    body: `
      <path d="M51 8v48" />
      <circle cx="43" cy="18" r="5" />
      <path d="M48 18h7" />
      <circle cx="26" cy="24" r="4" />
      <path d="M25 29 21 41 31 47" />
      <path d="M30 31 39 22" />
      <path d="M22 41 14 52" />
      <path d="M31 47 39 54" />
      <path d="M18 36h17" />
      <path d="M37 20c2-4 4-6 6-7" />
    `
  },
  {
    id: "kettlebell_row",
    label: "Kettlebell Row",
    tags: ["kettlebell", "row", "strength", "pull"],
    body: `
      <circle cx="25" cy="20" r="4" />
      <path d="M24 25 18 36 32 39" />
      <path d="M32 39 45 31" />
      <path d="M18 36 11 50" />
      <path d="M31 39 39 52" />
      <path d="M43 31c0-4 3-7 7-7s7 3 7 7" />
      <rect x="43" y="29" width="14" height="17" rx="7" />
      <path d="M47 29h6" />
    `
  },
  {
    id: "lunges",
    label: "Lunges",
    tags: ["bodyweight", "lunges", "legs"],
    body: `
      <circle cx="31" cy="14" r="4" />
      <path d="M31 18 27 32 36 39" />
      <path d="M27 32 17 46" />
      <path d="M36 39 50 39" />
      <path d="M17 46h13" />
      <path d="M50 39 55 50" />
      <path d="M29 25 19 30" />
      <path d="M34 25 43 31" />
    `
  },
  {
    id: "push_ups",
    label: "Push Ups",
    tags: ["bodyweight", "push", "floor", "chest"],
    body: `
      <path d="M8 52h48" />
      <circle cx="20" cy="34" r="4" />
      <path d="M24 36 38 40 52 38" />
      <path d="M29 37 23 50" />
      <path d="M43 39 51 50" />
      <path d="M18 38 12 48" />
      <path d="M34 40 34 49" />
    `
  },
  {
    id: "air_squats",
    label: "Air Squats",
    tags: ["bodyweight", "squat", "legs"],
    body: `
      <circle cx="31" cy="13" r="4" />
      <path d="M31 17 28 31 39 37" />
      <path d="M28 31 18 39" />
      <path d="M39 37 49 48" />
      <path d="M18 39h13" />
      <path d="M49 48h8" />
      <path d="M28 22 18 26" />
      <path d="M34 22 45 25" />
    `
  },
  {
    id: "plank",
    label: "Plank",
    tags: ["bodyweight", "core", "floor", "hold"],
    body: `
      <path d="M8 52h48" />
      <circle cx="19" cy="34" r="4" />
      <path d="M23 36h26" />
      <path d="M28 36 24 48" />
      <path d="M47 36 52 48" />
      <path d="M16 38 12 48" />
      <path d="M24 48h9" />
      <path d="M50 48h7" />
    `
  },
  {
    id: "box_jumps",
    label: "Box Jumps",
    tags: ["jump", "box", "legs", "plyo"],
    body: `
      <rect x="39" y="34" width="17" height="18" rx="2" />
      <circle cx="23" cy="16" r="4" />
      <path d="M22 20 19 31 29 35" />
      <path d="M28 22 36 28" />
      <path d="M19 31 12 42" />
      <path d="M29 35 38 34" />
      <path d="M12 42h11" />
      <path d="M34 16c5 0 10 3 12 8" />
    `
  },
  {
    id: "jump_rope",
    label: "Jump Rope",
    tags: ["cardio", "rope", "jump"],
    body: `
      <path d="M15 24c-7 14-5 29 17 29s24-15 17-29" />
      <circle cx="32" cy="14" r="4" />
      <path d="M32 18v20" />
      <path d="M24 25 14 24" />
      <path d="M40 25 50 24" />
      <path d="M27 38 23 52" />
      <path d="M37 38 41 52" />
      <path d="M20 19 14 24" />
      <path d="M44 19 50 24" />
    `
  },
  {
    id: "pull_ups",
    label: "Pull Ups",
    tags: ["bar", "pull", "bodyweight", "back"],
    body: `
      <path d="M12 12h40" />
      <path d="M18 12v44" />
      <path d="M46 12v44" />
      <circle cx="32" cy="27" r="4" />
      <path d="M32 31v16" />
      <path d="M24 18 29 31" />
      <path d="M40 18 35 31" />
      <path d="M28 47 22 55" />
      <path d="M36 47 42 55" />
    `
  },
  {
    id: "battle_ropes",
    label: "Battle Ropes",
    tags: ["rope", "cardio", "arms", "conditioning"],
    body: `
      <path d="M8 50c8-9 14 9 22 0s14 9 26 0" />
      <path d="M8 40c8-9 14 9 22 0s14 9 26 0" />
      <circle cx="32" cy="15" r="4" />
      <path d="M32 19 29 33 36 38" />
      <path d="M28 27 19 37" />
      <path d="M36 27 46 37" />
      <path d="M29 33 23 52" />
      <path d="M36 38 44 53" />
    `
  },
  {
    id: "kettlebell_swings",
    label: "Kettlebell Swings",
    tags: ["kettlebell", "swing", "hips", "strength"],
    body: `
      <circle cx="32" cy="13" r="4" />
      <path d="M32 17 29 32 37 39" />
      <path d="M29 32 20 46" />
      <path d="M37 39 46 51" />
      <path d="M28 24c-6 5-8 12-5 19" />
      <path d="M36 24c8 2 14 7 17 15" />
      <path d="M43 39c0-4 3-7 7-7s7 3 7 7" />
      <rect x="43" y="37" width="14" height="15" rx="7" />
      <path d="M47 37h6" />
    `
  },
  {
    id: "dumbbell_press",
    label: "Dumbbell Press",
    tags: ["dumbbell", "press", "shoulders", "strength"],
    body: `
      <circle cx="31" cy="22" r="4" />
      <path d="M31 26v20" />
      <path d="M24 35h14" />
      <path d="M24 35 17 52" />
      <path d="M38 35 46 52" />
      <path d="M22 17h18" />
      <path d="M18 14v6" />
      <path d="M44 14v6" />
      <path d="M21 14v6" />
      <path d="M41 14v6" />
      <path d="M26 17 30 26" />
      <path d="M36 17 32 26" />
    `
  },
  {
    id: "deadlift",
    label: "Deadlift",
    tags: ["barbell", "strength", "hinge", "legs"],
    body: `
      <path d="M10 45h44" />
      <circle cx="14" cy="45" r="6" />
      <circle cx="50" cy="45" r="6" />
      <circle cx="32" cy="14" r="4" />
      <path d="M32 18 28 32 38 40" />
      <path d="M28 32 18 43" />
      <path d="M38 40 48 43" />
      <path d="M29 28 22 45" />
      <path d="M36 30 42 45" />
    `
  },
  {
    id: "sit_ups",
    label: "Sit Ups",
    tags: ["bodyweight", "core", "floor", "abs"],
    body: `
      <path d="M8 52h48" />
      <circle cx="26" cy="27" r="4" />
      <path d="M29 30c5 4 8 8 10 14" />
      <path d="M25 31 15 45" />
      <path d="M39 44h16" />
      <path d="M15 45h16" />
      <path d="M22 25 15 20" />
      <path d="M29 25 37 20" />
    `
  },
  {
    id: "mountain_climbers",
    label: "Mountain Climbers",
    tags: ["bodyweight", "core", "cardio", "floor"],
    body: `
      <path d="M8 52h48" />
      <circle cx="20" cy="28" r="4" />
      <path d="M24 30 39 36 52 34" />
      <path d="M30 33 21 47" />
      <path d="M39 36 49 48" />
      <path d="M19 32 12 45" />
      <path d="M25 44 36 48" />
      <path d="M36 48h12" />
    `
  },
  {
    id: "medicine_ball_slams",
    label: "Ball Slams",
    tags: ["ball", "slam", "core", "power"],
    body: `
      <circle cx="45" cy="14" r="6" />
      <circle cx="28" cy="23" r="4" />
      <path d="M28 27 25 39 35 45" />
      <path d="M25 39 16 52" />
      <path d="M35 45 46 53" />
      <path d="M26 31 18 25" />
      <path d="M33 28 43 19" />
      <path d="M12 54h40" />
    `
  },
  {
    id: "step_ups",
    label: "Step Ups",
    tags: ["box", "legs", "step"],
    body: `
      <rect x="35" y="38" width="21" height="14" rx="2" />
      <circle cx="24" cy="14" r="4" />
      <path d="M24 18 22 33 31 38" />
      <path d="M22 33 14 48" />
      <path d="M31 38h15" />
      <path d="M14 48h11" />
      <path d="M26 24 36 29" />
      <path d="M22 24 13 29" />
    `
  },
  {
    id: "bike",
    label: "Bike",
    tags: ["cardio", "machine", "bike", "legs"],
    body: `
      <circle cx="19" cy="47" r="8" />
      <circle cx="48" cy="47" r="8" />
      <path d="M19 47 29 31 39 47 48 47" />
      <path d="M29 31h13" />
      <path d="M35 31 27 47" />
      <circle cx="31" cy="17" r="4" />
      <path d="M31 21 29 31 38 35" />
      <path d="M38 35 48 25" />
      <path d="M29 31 20 28" />
    `
  },
  {
    id: "thrusters",
    label: "Thrusters",
    tags: ["dumbbell", "squat", "press", "strength"],
    body: `
      <circle cx="32" cy="20" r="4" />
      <path d="M32 24 29 37 39 43" />
      <path d="M29 37 19 48" />
      <path d="M39 43 49 52" />
      <path d="M25 16h14" />
      <path d="M21 13v6" />
      <path d="M43 13v6" />
      <path d="M24 13v6" />
      <path d="M40 13v6" />
      <path d="M27 25 22 16" />
      <path d="M37 25 42 16" />
    `
  },
  {
    id: "burpees",
    label: "Burpees",
    tags: ["bodyweight", "floor", "jump", "conditioning"],
    body: `
      <path d="M8 52h48" />
      <circle cx="18" cy="35" r="4" />
      <path d="M22 37 36 42 50 39" />
      <path d="M29 39 23 51" />
      <path d="M44 40 52 50" />
      <path d="M16 39 11 47" />
      <path d="M33 17c4-4 10-4 14 0" />
      <path d="M47 17h-7" />
      <path d="M47 17v7" />
    `
  },
  {
    id: "jumping_jacks",
    label: "Jumping Jacks",
    tags: ["bodyweight", "cardio", "jump"],
    body: `
      <circle cx="32" cy="14" r="4" />
      <path d="M32 18v20" />
      <path d="M25 25 12 16" />
      <path d="M39 25 52 16" />
      <path d="M29 38 20 53" />
      <path d="M35 38 44 53" />
      <path d="M16 24c3 3 7 5 11 6" />
      <path d="M48 24c-3 3-7 5-11 6" />
    `
  },
  {
    id: "high_knees",
    label: "High Knees",
    tags: ["bodyweight", "cardio", "legs"],
    body: `
      <circle cx="30" cy="13" r="4" />
      <path d="M30 17 27 32 37 39" />
      <path d="M27 31 18 44" />
      <path d="M37 39 48 39" />
      <path d="M48 39 55 48" />
      <path d="M31 25 42 28" />
      <path d="M27 25 17 30" />
      <path d="M13 50h15" />
      <path d="M43 50h13" />
    `
  },
  {
    id: "lateral_shuffle",
    label: "Lateral Shuffle",
    tags: ["bodyweight", "agility", "cardio", "legs"],
    body: `
      <path d="M10 52h44" />
      <path d="M14 43h18" />
      <path d="M50 43H32" />
      <path d="M18 39 14 43l4 4" />
      <path d="M46 39 50 43l-4 4" />
      <circle cx="31" cy="16" r="4" />
      <path d="M31 20 28 34 39 39" />
      <path d="M28 34 17 49" />
      <path d="M39 39 50 50" />
      <path d="M28 27 18 25" />
      <path d="M36 27 46 24" />
    `
  },
  {
    id: "wall_sit",
    label: "Wall Sit",
    tags: ["bodyweight", "legs", "hold", "wall"],
    body: `
      <path d="M50 8v48" />
      <path d="M10 52h44" />
      <circle cx="34" cy="18" r="4" />
      <path d="M36 22 42 35" />
      <path d="M42 35H27" />
      <path d="M27 35 17 47" />
      <path d="M42 35 49 47" />
      <path d="M24 47h17" />
      <path d="M37 25 49 23" />
      <path d="M33 26 24 26" />
    `
  },
  {
    id: "calf_raises",
    label: "Calf Raises",
    tags: ["bodyweight", "legs", "calves"],
    body: `
      <circle cx="32" cy="13" r="4" />
      <path d="M32 17v22" />
      <path d="M24 25h16" />
      <path d="M27 39 23 53" />
      <path d="M37 39 41 53" />
      <path d="M18 53h14" />
      <path d="M36 53h14" />
      <path d="M20 47c3-3 8-3 12 0" />
      <path d="M34 47c4-3 9-3 13 0" />
    `
  },
  {
    id: "glute_bridge",
    label: "Glute Bridge",
    tags: ["bodyweight", "floor", "hips", "legs"],
    body: `
      <path d="M8 52h48" />
      <circle cx="17" cy="39" r="4" />
      <path d="M21 39 32 31 45 39" />
      <path d="M45 39 55 39" />
      <path d="M30 31 23 50" />
      <path d="M44 39 45 50" />
      <path d="M15 43 11 50" />
      <path d="M28 32c4-5 12-5 16 0" />
    `
  },
  {
    id: "hip_thrust",
    label: "Hip Thrust",
    tags: ["bench", "hips", "legs", "strength"],
    body: `
      <rect x="8" y="37" width="18" height="9" rx="2" />
      <path d="M8 52h48" />
      <circle cx="22" cy="27" r="4" />
      <path d="M25 30 38 34 52 42" />
      <path d="M38 34 31 51" />
      <path d="M52 42 54 51" />
      <path d="M24 33 16 42" />
      <path d="M36 30h14" />
      <path d="M39 27v6" />
      <path d="M47 27v6" />
    `
  },
  {
    id: "russian_twists",
    label: "Russian Twists",
    tags: ["core", "rotation", "floor", "ball"],
    body: `
      <path d="M8 52h48" />
      <circle cx="29" cy="23" r="4" />
      <path d="M31 27 38 40" />
      <path d="M38 40 50 45" />
      <path d="M30 34 20 47" />
      <path d="M36 42 26 51" />
      <circle cx="49" cy="38" r="5" />
      <path d="M18 29c-5 5-6 12-2 18" />
      <path d="M43 23c5 4 7 10 5 16" />
    `
  },
  {
    id: "v_ups",
    label: "V-Ups",
    tags: ["core", "bodyweight", "floor", "abs"],
    body: `
      <path d="M8 52h48" />
      <circle cx="24" cy="30" r="4" />
      <path d="M27 32 37 42" />
      <path d="M37 42 51 28" />
      <path d="M35 41 20 50" />
      <path d="M21 34 13 45" />
      <path d="M46 29 54 18" />
      <path d="M22 27 14 22" />
      <path d="M30 28 40 20" />
    `
  },
  {
    id: "hollow_hold",
    label: "Hollow Hold",
    tags: ["core", "bodyweight", "floor", "hold"],
    body: `
      <path d="M8 52h48" />
      <circle cx="24" cy="36" r="4" />
      <path d="M28 36c7-5 17-5 24 0" />
      <path d="M23 40 16 48" />
      <path d="M29 35 41 20" />
      <path d="M44 20h10" />
      <path d="M37 38 50 49" />
      <path d="M18 30c-3-5-2-10 2-14" />
    `
  },
  {
    id: "back_extensions",
    label: "Back Extensions",
    tags: ["posterior", "core", "back", "floor"],
    body: `
      <path d="M8 52h48" />
      <circle cx="19" cy="35" r="4" />
      <path d="M23 36 39 32 53 37" />
      <path d="M29 35 22 50" />
      <path d="M43 34 51 50" />
      <path d="M17 39 12 49" />
      <path d="M31 28c5-8 13-10 21-5" />
      <path d="M51 23h-8" />
    `
  },
  {
    id: "bench_dips",
    label: "Bench Dips",
    tags: ["bench", "triceps", "push", "bodyweight"],
    body: `
      <rect x="9" y="33" width="26" height="8" rx="2" />
      <path d="M9 52h46" />
      <circle cx="41" cy="20" r="4" />
      <path d="M40 24 36 36 44 43" />
      <path d="M36 36 28 36" />
      <path d="M44 43 56 47" />
      <path d="M39 31 31 39" />
      <path d="M44 31 37 39" />
      <path d="M28 41v11" />
      <path d="M52 47v5" />
    `
  },
  {
    id: "handstand_push_ups",
    label: "Handstand Push Ups",
    tags: ["bodyweight", "push", "shoulders", "wall"],
    body: `
      <path d="M50 8v48" />
      <path d="M10 52h46" />
      <circle cx="31" cy="43" r="4" />
      <path d="M31 39 30 24" />
      <path d="M24 39 30 30" />
      <path d="M38 39 30 30" />
      <path d="M28 24 22 12" />
      <path d="M32 24 39 12" />
      <path d="M22 12h8" />
      <path d="M39 12h9" />
    `
  },
  {
    id: "ring_rows",
    label: "Ring Rows",
    tags: ["rings", "pull", "bodyweight", "back"],
    body: `
      <path d="M18 8v19" />
      <path d="M46 8v19" />
      <circle cx="18" cy="32" r="5" />
      <circle cx="46" cy="32" r="5" />
      <circle cx="30" cy="36" r="4" />
      <path d="M34 38 48 43" />
      <path d="M26 38 14 43" />
      <path d="M29 40 20 52" />
      <path d="M34 41 45 52" />
      <path d="M13 52h39" />
    `
  },
  {
    id: "rope_climb",
    label: "Rope Climb",
    tags: ["rope", "pull", "climb", "upper"],
    body: `
      <path d="M43 8v48" />
      <circle cx="30" cy="17" r="4" />
      <path d="M31 21 36 35 28 44" />
      <path d="M35 27 43 21" />
      <path d="M37 35 43 31" />
      <path d="M29 27 20 35" />
      <path d="M28 44 19 53" />
      <path d="M28 44 38 53" />
      <path d="M43 16c-4 3-4 7 0 10" />
      <path d="M43 36c-4 3-4 7 0 10" />
    `
  },
  {
    id: "tire_flips",
    label: "Tire Flips",
    tags: ["power", "flip", "legs", "strength"],
    body: `
      <circle cx="44" cy="42" r="13" />
      <circle cx="44" cy="42" r="6" />
      <path d="M8 54h48" />
      <circle cx="22" cy="19" r="4" />
      <path d="M22 23 18 36 29 42" />
      <path d="M29 42 38 32" />
      <path d="M18 36 12 51" />
      <path d="M28 42 32 54" />
      <path d="M28 27 38 24" />
    `
  },
  {
    id: "goblet_squats",
    label: "Goblet Squats",
    tags: ["kettlebell", "squat", "legs", "strength"],
    body: `
      <circle cx="32" cy="13" r="4" />
      <path d="M32 17 29 32 39 39" />
      <path d="M29 32 19 44" />
      <path d="M39 39 50 48" />
      <path d="M19 44h14" />
      <path d="M50 48h7" />
      <path d="M24 25h16" />
      <path d="M27 27c0-4 3-7 7-7s7 3 7 7" />
      <rect x="27" y="25" width="14" height="15" rx="7" />
    `
  },
  {
    id: "front_squats",
    label: "Front Squats",
    tags: ["barbell", "squat", "legs", "strength"],
    body: `
      <path d="M15 24h34" />
      <circle cx="32" cy="14" r="4" />
      <path d="M32 18 29 33 39 39" />
      <path d="M29 33 19 45" />
      <path d="M39 39 50 49" />
      <path d="M19 45h14" />
      <path d="M50 49h7" />
      <path d="M24 24 29 31" />
      <path d="M40 24 35 31" />
      <path d="M11 20v8" />
      <path d="M53 20v8" />
    `
  },
  {
    id: "overhead_squats",
    label: "Overhead Squats",
    tags: ["barbell", "squat", "overhead", "strength"],
    body: `
      <path d="M12 12h40" />
      <path d="M8 8v8" />
      <path d="M56 8v8" />
      <circle cx="32" cy="22" r="4" />
      <path d="M32 26 29 38 39 43" />
      <path d="M29 38 19 49" />
      <path d="M39 43 50 52" />
      <path d="M19 49h14" />
      <path d="M50 52h7" />
      <path d="M25 15 31 26" />
      <path d="M39 15 33 26" />
    `
  },
  {
    id: "clean_and_press",
    label: "Clean and Press",
    tags: ["barbell", "press", "power", "strength"],
    body: `
      <path d="M14 14h36" />
      <path d="M10 10v8" />
      <path d="M54 10v8" />
      <circle cx="32" cy="25" r="4" />
      <path d="M32 29 30 42 38 49" />
      <path d="M30 42 22 54" />
      <path d="M38 49 47 54" />
      <path d="M25 17 30 30" />
      <path d="M39 17 34 30" />
      <path d="M20 44h24" />
    `
  },
  {
    id: "snatch",
    label: "Snatch",
    tags: ["barbell", "power", "overhead", "strength"],
    body: `
      <path d="M12 10h40" />
      <path d="M8 6v8" />
      <path d="M56 6v8" />
      <circle cx="30" cy="22" r="4" />
      <path d="M30 26 28 39 38 46" />
      <path d="M28 39 18 52" />
      <path d="M38 46 49 53" />
      <path d="M25 14 29 26" />
      <path d="M39 14 33 26" />
      <path d="M19 52h15" />
    `
  },
  {
    id: "lateral_raises",
    label: "Lateral Raises",
    tags: ["dumbbell", "shoulders", "strength", "arms"],
    body: `
      <circle cx="32" cy="16" r="4" />
      <path d="M32 20v21" />
      <path d="M24 28 12 25" />
      <path d="M40 28 52 25" />
      <path d="M27 41 22 54" />
      <path d="M37 41 42 54" />
      <path d="M8 22v6" />
      <path d="M14 22v6" />
      <path d="M50 22v6" />
      <path d="M56 22v6" />
    `
  }
];
