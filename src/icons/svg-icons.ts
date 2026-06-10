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
  }
];
