import { type IconAsset } from "../domain/types.js";
import { SVG_ICON_DEFINITIONS, type SvgIconDefinition } from "./svg-icons.js";

export type RenderIconOptions = {
  className?: string;
  decorative?: boolean;
};

const SVG_ATTRIBUTES =
  'viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';

const escapeAttribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const renderDefinition = (definition: SvgIconDefinition, options: RenderIconOptions = {}): string => {
  const classAttribute = options.className ? ` class="${escapeAttribute(options.className)}"` : "";
  const accessibilityAttribute =
    options.decorative === false ? ` role="img" aria-label="${escapeAttribute(definition.label)}"` : ' aria-hidden="true"';

  return `<svg ${SVG_ATTRIBUTES}${classAttribute}${accessibilityAttribute}>${definition.body}</svg>`;
};

export const EXERCISE_ICON_IDS = SVG_ICON_DEFINITIONS.map((definition) => definition.id);
export const AUTO_ICON_ID = "auto";
export const CONCRETE_EXERCISE_ICON_IDS = EXERCISE_ICON_IDS.filter((iconId) => iconId !== AUTO_ICON_ID);

const iconDefinitionById = new Map(SVG_ICON_DEFINITIONS.map((definition) => [definition.id, definition]));

const getRandomIndex = (length: number): number => {
  if (length <= 0) {
    throw new RangeError("Cannot pick a random icon from an empty set.");
  }

  const cryptoApi = globalThis.crypto;

  if (cryptoApi && "getRandomValues" in cryptoApi) {
    const [randomValue] = cryptoApi.getRandomValues(new Uint32Array(1));
    return (randomValue ?? 0) % length;
  }

  return Math.floor(Math.random() * length);
};

export const getIconDefinition = (iconId: string): SvgIconDefinition | undefined => iconDefinitionById.get(iconId);

export const hasIcon = (iconId: string): boolean => iconDefinitionById.has(iconId);

export const getUniqueRandomConcreteIconIds = (
  count: number,
  reservedIconIds: Iterable<string> = []
): string[] => {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("Icon count must be a non-negative whole number.");
  }

  const reserved = new Set(reservedIconIds);
  const availableIconIds = CONCRETE_EXERCISE_ICON_IDS.filter((iconId) => !reserved.has(iconId));

  if (availableIconIds.length < count) {
    throw new RangeError("Not enough unique exercise icons are available.");
  }

  const selectedIconIds: string[] = [];

  while (selectedIconIds.length < count) {
    const index = getRandomIndex(availableIconIds.length);
    const [iconId] = availableIconIds.splice(index, 1);

    if (iconId) {
      selectedIconIds.push(iconId);
    }
  }

  return selectedIconIds;
};

export const getIconAssets = (): IconAsset[] =>
  SVG_ICON_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    tags: [...definition.tags],
    svg: renderDefinition(definition)
  }));

export const getIconAsset = (iconId: string): IconAsset | undefined => {
  const definition = getIconDefinition(iconId);

  if (!definition) {
    return undefined;
  }

  return {
    id: definition.id,
    label: definition.label,
    tags: [...definition.tags],
    svg: renderDefinition(definition)
  };
};

export const renderExerciseIcon = (iconId: string, options: RenderIconOptions = {}): string => {
  const definition = getIconDefinition(iconId);

  if (!definition) {
    throw new RangeError(`Unknown exercise icon: ${iconId}`);
  }

  return renderDefinition(definition, options);
};

export const findIconAssets = (query: string): IconAsset[] => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return getIconAssets();
  }

  return SVG_ICON_DEFINITIONS.filter((definition) => {
    const haystack = [definition.label, definition.id, ...definition.tags].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  }).map((definition) => ({
    id: definition.id,
    label: definition.label,
    tags: [...definition.tags],
    svg: renderDefinition(definition)
  }));
};
