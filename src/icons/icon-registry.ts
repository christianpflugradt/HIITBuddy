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

export const getIconDefinition = (iconId: string): SvgIconDefinition | undefined => iconDefinitionById.get(iconId);

export const hasIcon = (iconId: string): boolean => iconDefinitionById.has(iconId);

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
