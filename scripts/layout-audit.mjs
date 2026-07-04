import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const port = 4173;
const rootUrl = `http://127.0.0.1:${port}`;
const artifactDir = new URL("../artifacts/layout-audit/", import.meta.url);

const { createDefaultConfig } = await import(new URL("../dist/config/default-config.js", import.meta.url));
const { createShareUrl } = await import(new URL("../dist/domain/share-link.js", import.meta.url));

const participantNames = [
  "Christian",
  "Loredana",
  "Maximilian",
  "Sophie",
  "Benjamin",
  "Alexandra",
  "Sebastian",
  "Franziska",
  "Johannes",
  "Katharina",
  "Dominique",
  "Valentina"
];

const selectedExerciseIds = [
  "skierg",
  "sled_push",
  "burpee_broad_jumps",
  "rowing",
  "farmers_carry",
  "sandbag_lunges",
  "wall_balls",
  "sled_pull"
];

const createWorkoutUrl = (participantCount) => {
  const config = createDefaultConfig();
  const exerciseIds = [...selectedExerciseIds];

  config.people = participantNames.slice(0, participantCount).map((name, index) => ({
    id: `p${index + 1}`,
    name,
    active: true
  }));

  while (exerciseIds.length < participantCount) {
    const customIndex = exerciseIds.length - selectedExerciseIds.length + 1;
    const id = `custom_${customIndex}`;

    config.exercises.push({
      id,
      name: `Custom Exercise ${customIndex}`,
      iconId: "rowing",
      builtIn: false,
      selected: true
    });
    exerciseIds.push(id);
  }

  config.selectedExerciseIds = exerciseIds;
  config.exercises = config.exercises.map((exercise) => ({
    ...exercise,
    selected: exerciseIds.includes(exercise.id)
  }));

  return createShareUrl(config, rootUrl);
};

const cases = [
  {
    id: "phone-2",
    count: 2,
    viewport: { width: 390, height: 844 },
    expect: { columns: 1, maxCardHeight: 120 }
  },
  {
    id: "phone-3",
    count: 3,
    viewport: { width: 390, height: 844 },
    expect: { columns: 1, maxCardHeight: 120 }
  },
  {
    id: "phone-4",
    count: 4,
    viewport: { width: 390, height: 844 },
    expect: { columns: 1, maxCardHeight: 120 }
  },
  {
    id: "phone-6",
    count: 6,
    viewport: { width: 390, height: 844 },
    expect: { columns: 1, maxCardHeight: 120 }
  },
  {
    id: "tablet-portrait-3",
    count: 3,
    viewport: { width: 820, height: 1180 },
    expect: { columns: 2, minCardsAreaRatio: 0.45 }
  },
  {
    id: "tablet-portrait-8",
    count: 8,
    viewport: { width: 820, height: 1180 },
    expect: { columns: 3, minCardsAreaRatio: 0.55 }
  },
  {
    id: "tablet-landscape-2",
    count: 2,
    viewport: { width: 1366, height: 1024 },
    expect: { columns: 1, minGridWidthRatio: 0.82, minCardsAreaRatio: 0.52 }
  },
  {
    id: "tablet-landscape-3",
    count: 3,
    viewport: { width: 1180, height: 820 },
    expect: { columns: 3, minCardsAreaRatio: 0.5 }
  },
  {
    id: "tablet-landscape-8",
    count: 8,
    viewport: { width: 1180, height: 820 },
    expect: { columns: 4, minCardsAreaRatio: 0.58 }
  },
  {
    id: "tablet-landscape-12",
    count: 12,
    viewport: { width: 1180, height: 820 },
    expect: { columns: 4, minCardsAreaRatio: 0.6 }
  }
];

const getColumnCount = (gridTemplateColumns) =>
  gridTemplateColumns
    .split(" ")
    .map((segment) => segment.trim())
    .filter(Boolean).length;

const waitForServer = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(rootUrl, { redirect: "manual" });

      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the server is ready.
    }

    await delay(250);
  }

  throw new Error("Layout audit server did not start in time.");
};

const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, PORT: String(port) },
  stdio: "inherit"
});

try {
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(artifactDir, { recursive: true });
  await waitForServer();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const failures = [];
  const report = [];

  for (const auditCase of cases) {
    await page.setViewportSize(auditCase.viewport);
    await page.goto(createWorkoutUrl(auditCase.count), { waitUntil: "domcontentloaded" });

    for (const action of ["Next", "Next", "Start"]) {
      await page.getByRole("button", { name: action }).click();
    }

    await page.waitForSelector(".assignment-grid");

    const metrics = await page.evaluate(() => {
      const stage = document.querySelector(".assignment-stage");
      const grid = document.querySelector(".assignment-grid");
      const cards = Array.from(document.querySelectorAll(".assignment-card"));

      if (!(stage instanceof HTMLElement) || !(grid instanceof HTMLElement) || cards.length === 0) {
        throw new Error("Workout layout elements were not found.");
      }

      const stageRect = stage.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      const cardRects = cards.map((card) => {
        const icon = card.querySelector(".assignment-icon");
        const copy = card.querySelector(".assignment-copy");
        const cardRect = card.getBoundingClientRect();
        const iconRect = icon?.getBoundingClientRect();
        const copyRect = copy?.getBoundingClientRect();

        return {
          area: cardRect.width * cardRect.height,
          height: cardRect.height,
          contentWidth:
            iconRect && copyRect
              ? Math.max(iconRect.right, copyRect.right) - Math.min(iconRect.left, copyRect.left)
              : 0
        };
      });

      const totalCardsArea = cardRects.reduce((sum, rect) => sum + rect.area, 0);

      return {
        cardsAreaRatio: totalCardsArea / (stageRect.width * stageRect.height),
        cardHeights: cardRects.map((rect) => Math.round(rect.height)),
        columnCount: getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length,
        contentWidthRatios: cardRects.map((rect) =>
          rect.contentWidth > 0 && gridRect.width > 0 ? rect.contentWidth / gridRect.width : 0
        ),
        gridWidthRatio: gridRect.width / stageRect.width,
        stageRect: { width: stageRect.width, height: stageRect.height }
      };
    });

    const screenshotPath = new URL(`${auditCase.id}.png`, artifactDir);
    await page.screenshot({ path: fileURLToPath(screenshotPath), fullPage: true });

    report.push({
      id: auditCase.id,
      count: auditCase.count,
      metrics
    });

    if (metrics.columnCount !== auditCase.expect.columns) {
      failures.push(
        `${auditCase.id}: expected ${auditCase.expect.columns} columns, got ${metrics.columnCount}`
      );
    }

    if (auditCase.expect.maxCardHeight && metrics.cardHeights.some((height) => height > auditCase.expect.maxCardHeight)) {
      failures.push(
        `${auditCase.id}: expected card height <= ${auditCase.expect.maxCardHeight}, got ${metrics.cardHeights.join(", ")}`
      );
    }

    if (auditCase.expect.minGridWidthRatio && metrics.gridWidthRatio < auditCase.expect.minGridWidthRatio) {
      failures.push(
        `${auditCase.id}: expected grid width ratio >= ${auditCase.expect.minGridWidthRatio.toFixed(2)}, got ${metrics.gridWidthRatio.toFixed(2)}`
      );
    }

    if (auditCase.expect.minCardsAreaRatio && metrics.cardsAreaRatio < auditCase.expect.minCardsAreaRatio) {
      failures.push(
        `${auditCase.id}: expected cards/stage area ratio >= ${auditCase.expect.minCardsAreaRatio.toFixed(2)}, got ${metrics.cardsAreaRatio.toFixed(2)}`
      );
    }
  }

  await writeFile(new URL("report.json", artifactDir), JSON.stringify(report, null, 2));
  await browser.close();

  if (failures.length > 0) {
    throw new Error(`Layout audit failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  }

  console.log(`Layout audit passed. Screenshots and report saved to ${artifactDir.pathname}`);
} finally {
  server.kill("SIGTERM");
}
