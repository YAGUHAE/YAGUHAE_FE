export type PreviewTheme = "system" | "light" | "dark";
export type PreviewBg = "default" | "subtle";
export type Viewport = "360" | "768" | "1280" | "fit";

export type PlaygroundState = {
  story: string;
  /** 스토리 defaults 위에 덮는 부분 props */
  props: Record<string, unknown>;
  vw: Viewport;
  theme: PreviewTheme;
  bg: PreviewBg;
};

export const DEFAULT_STATE: PlaygroundState = {
  story: "button",
  props: {},
  vw: "fit",
  theme: "system",
  bg: "default",
};

const VIEWPORTS: Viewport[] = ["360", "768", "1280", "fit"];
const THEMES: PreviewTheme[] = ["system", "light", "dark"];
const BGS: PreviewBg[] = ["default", "subtle"];

function pick<T extends string>(value: string | null, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function parseState(sp: URLSearchParams): PlaygroundState {
  let props: Record<string, unknown> = {};
  const raw = sp.get("props");
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        props = parsed as Record<string, unknown>;
      }
    } catch {
      props = {};
    }
  }
  return {
    story: sp.get("story") ?? DEFAULT_STATE.story,
    props,
    vw: pick(sp.get("vw"), VIEWPORTS, DEFAULT_STATE.vw),
    theme: pick(sp.get("theme"), THEMES, DEFAULT_STATE.theme),
    bg: pick(sp.get("bg"), BGS, DEFAULT_STATE.bg),
  };
}

export function buildQuery(state: PlaygroundState): string {
  const sp = new URLSearchParams();
  sp.set("story", state.story);
  if (Object.keys(state.props).length > 0) sp.set("props", JSON.stringify(state.props));
  if (state.vw !== DEFAULT_STATE.vw) sp.set("vw", state.vw);
  if (state.theme !== DEFAULT_STATE.theme) sp.set("theme", state.theme);
  if (state.bg !== DEFAULT_STATE.bg) sp.set("bg", state.bg);
  return sp.toString();
}

/** 부모 → 미리보기 iframe */
export type PreviewMessage =
  | { type: "yaguhae:preview-props"; props: Record<string, unknown> }
  | { type: "yaguhae:preview-theme"; theme: PreviewTheme; bg: PreviewBg };

/** 미리보기 iframe → 부모 */
export type PreviewHeightMessage = { type: "yaguhae:preview-height"; height: number };

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  if (!data || typeof data !== "object") return false;
  const t = (data as { type?: unknown }).type;
  return t === "yaguhae:preview-props" || t === "yaguhae:preview-theme";
}

export function isHeightMessage(data: unknown): data is PreviewHeightMessage {
  return (
    !!data &&
    typeof data === "object" &&
    (data as { type?: unknown }).type === "yaguhae:preview-height" &&
    typeof (data as { height?: unknown }).height === "number"
  );
}

/** 현재 props로 JSX 스니펫을 만듭니다. children 키는 태그 사이로 갑니다. */
export function toJsx(componentName: string, props: Record<string, unknown>): string {
  const attrs: string[] = [];
  let children: string | null = null;
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") {
      children = String(value);
      continue;
    }
    if (value === undefined || value === "") continue;
    if (typeof value === "string") attrs.push(`${key}="${value}"`);
    else if (typeof value === "boolean") attrs.push(value ? key : `${key}={false}`);
    else attrs.push(`${key}={${JSON.stringify(value)}}`);
  }
  const head = [componentName, ...attrs].join(" ");
  return children === null ? `<${head} />` : `<${head}>${children}</${componentName}>`;
}
