import { createDefaultConfig } from "../config/default-config.js";
import { type WorkoutConfig } from "./types.js";
import { validateConfig } from "./validation.js";

export const CONFIG_QUERY_PARAMETER = "config";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const bytesToBase64 = (bytes: Uint8Array): string => {
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const toBase64Url = (base64: string) => base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

const fromBase64Url = (base64Url: string) => {
  const base64 = base64Url.replaceAll("-", "+").replaceAll("_", "/");
  const paddingLength = (4 - (base64.length % 4)) % 4;
  return `${base64}${"=".repeat(paddingLength)}`;
};

const toSharePayload = (config: WorkoutConfig): WorkoutConfig => {
  const payload: WorkoutConfig = {
    schemaVersion: config.schemaVersion,
    people: config.people.map((person) => ({
      id: person.id,
      name: person.name,
      active: person.active
    })),
    exercises: config.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      iconId: exercise.iconId,
      builtIn: exercise.builtIn,
      selected: exercise.selected
    })),
    timer: {
      workSeconds: config.timer.workSeconds,
      intervalRestSeconds: config.timer.intervalRestSeconds,
      roundBreakSeconds: config.timer.roundBreakSeconds
    },
    selectedExerciseIds: [...config.selectedExerciseIds]
  };

  if (config.ui) {
    payload.ui = { ...config.ui };
  }

  return payload;
};

export const encodeConfig = (config: WorkoutConfig): string => {
  const json = JSON.stringify(toSharePayload(config));
  return toBase64Url(bytesToBase64(textEncoder.encode(json)));
};

export const decodeConfig = (encodedConfig: string): WorkoutConfig | null => {
  try {
    const json = textDecoder.decode(base64ToBytes(fromBase64Url(encodedConfig)));
    const validation = validateConfig(JSON.parse(json));
    return validation.valid ? validation.config : null;
  } catch {
    return null;
  }
};

export const decodeConfigOrDefault = (encodedConfig: string | null | undefined): WorkoutConfig => {
  if (!encodedConfig) {
    return createDefaultConfig();
  }

  return decodeConfig(encodedConfig) ?? createDefaultConfig();
};

export const createShareUrl = (config: WorkoutConfig, baseUrl: string | URL): string => {
  const url = new URL(baseUrl.toString());
  url.searchParams.set(CONFIG_QUERY_PARAMETER, encodeConfig(config));
  return url.toString();
};

export const readConfigFromUrl = (urlLike: string | URL): WorkoutConfig => {
  const url = new URL(urlLike.toString());
  return decodeConfigOrDefault(url.searchParams.get(CONFIG_QUERY_PARAMETER));
};
