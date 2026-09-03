"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { ControlPanel } from "./controls";
import {
  buildQuery,
  isHeightMessage,
  parseState,
  toJsx,
  type PlaygroundState,
  type PreviewBg,
  type PreviewMessage,
  type PreviewTheme,
  type Viewport,
} from "./encoding";
import { STORIES, STORY_GROUP_LABEL, figmaUrl, getStory, resolveProps, type StoryGroup } from "./stories";

const GROUPS: StoryGroup[] = ["ui", "data", "navigation", "layout"];
const VIEWPORTS: { value: Viewport; label: string }[] = [
  { value: "360", label: "360" },
  { value: "768", label: "768" },
  { value: "1280", label: "1280" },
  { value: "fit", label: "맞춤" },
];
const THEMES: { value: PreviewTheme; label: string }[] = [
  { value: "system", label: "시스템" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];
const BGS: { value: PreviewBg; label: string }[] = [
  { value: "default", label: "default" },
  { value: "subtle", label: "subtle" },
];
const FULL_HEIGHT_PX = 720;
const MIN_HEIGHT_PX = 120;

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-sm">
      <span className="type-label-sm text-text-tertiary">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-md border border-border-default bg-bg-default p-2xs">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-[32px] rounded-sm px-md type-label-sm transition-colors",
              value === opt.value
                ? "bg-bg-brand-subtle text-text-brand"
                : "text-text-secondary hover:bg-bg-hover",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Playground() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<PlaygroundState>(() => parseState(searchParams));
  const [previewHeight, setPreviewHeight] = useState(MIN_HEIGHT_PX);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const story = getStory(state.story) ?? STORIES[0];
  const props = useMemo(() => resolveProps(story, state.props), [story, state.props]);

  // 미리보기 iframe은 스토리가 바뀔 때만 다시 로드합니다. props·테마는 postMessage로.
  const iframeSrc = useMemo(
    () => `/dev/ui/playground/preview?${buildQuery({ ...state, props: {}, vw: "fit" })}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [story.id],
  );

  const post = useCallback((message: PreviewMessage) => {
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  // URL 동기화 (공유용)
  useEffect(() => {
    const query = buildQuery(state);
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  }, [state]);

  // 플레이그라운드 자체도 선택한 테마를 따릅니다.
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "system") delete root.dataset.theme;
    else root.dataset.theme = state.theme;
    return () => {
      delete root.dataset.theme;
    };
  }, [state.theme]);

  // iframe에 props / 테마 전달
  useEffect(() => {
    post({ type: "yaguhae:preview-props", props });
  }, [post, props]);
  useEffect(() => {
    post({ type: "yaguhae:preview-theme", theme: state.theme, bg: state.bg });
  }, [post, state.theme, state.bg]);

  // iframe → 높이
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !isHeightMessage(e.data)) return;
      setPreviewHeight(Math.max(MIN_HEIGHT_PX, Math.ceil(e.data.height)));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const handleIframeLoad = () => {
    post({ type: "yaguhae:preview-props", props });
    post({ type: "yaguhae:preview-theme", theme: state.theme, bg: state.bg });
  };

  const selectStory = (id: string) => setState((s) => ({ ...s, story: id, props: {} }));
  const setProp = (key: string, value: unknown) =>
    setState((s) => ({ ...s, props: { ...s.props, [key]: value } }));
  const resetProps = () => setState((s) => ({ ...s, props: {} }));

  const jsx = toJsx(story.name.split(" ")[0], props);
  const copyJsx = async () => {
    try {
      await navigator.clipboard.writeText(jsx);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const frameWidth = state.vw === "fit" ? "100%" : `${state.vw}px`;
  const frameHeight = story.fullHeight ? FULL_HEIGHT_PX : previewHeight;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-subtle lg:flex-row">
      {/* 스토리 목록 */}
      <aside className="shrink-0 border-b border-border-subtle bg-bg-default lg:w-[240px] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-lg py-md">
          <Link href="/dev/ui" className="type-heading-sm text-text-default">
            플레이그라운드
          </Link>
          <Link href="/dev/ui" className="type-caption text-text-tertiary underline">
            갤러리
          </Link>
        </div>
        <nav aria-label="스토리" className="flex gap-lg overflow-x-auto px-lg pb-md lg:flex-col lg:gap-md">
          {GROUPS.map((group) => (
            <div key={group} className="flex shrink-0 flex-col gap-2xs">
              <span className="px-sm type-label-sm text-text-tertiary">{STORY_GROUP_LABEL[group]}</span>
              {STORIES.filter((s) => s.group === group).map((s) => {
                const active = s.id === story.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => selectStory(s.id)}
                    className={cn(
                      "h-[32px] rounded-sm px-sm text-left type-label-md whitespace-nowrap transition-colors",
                      active ? "bg-bg-brand-subtle text-text-brand" : "text-text-secondary hover:bg-bg-hover",
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* 미리보기 */}
      <main className="flex min-w-0 flex-1 flex-col gap-lg p-lg lg:p-2xl">
        <header className="flex flex-col gap-xs">
          <div className="flex flex-wrap items-baseline gap-sm">
            <h1 className="type-heading-lg text-text-default">{story.name}</h1>
            {story.figma ? (
              <a
                href={figmaUrl(story.figma)}
                target="_blank"
                rel="noopener noreferrer"
                className="type-caption text-text-tertiary underline underline-offset-2 hover:text-text-default"
              >
                Figma ↗
              </a>
            ) : null}
          </div>
          {story.description ? (
            <p className="type-body-sm text-text-secondary">{story.description}</p>
          ) : null}
        </header>

        <div className="flex flex-wrap items-center gap-lg">
          <Segmented label="뷰포트" value={state.vw} options={VIEWPORTS} onChange={(vw) => setState((s) => ({ ...s, vw }))} />
          <Segmented label="테마" value={state.theme} options={THEMES} onChange={(theme) => setState((s) => ({ ...s, theme }))} />
          <Segmented label="배경" value={state.bg} options={BGS} onChange={(bg) => setState((s) => ({ ...s, bg }))} />
        </div>

        <div className="w-full overflow-x-auto rounded-lg border border-border-default bg-bg-muted p-lg">
          <div className="mx-auto" style={{ width: frameWidth, maxWidth: state.vw === "fit" ? "100%" : undefined }}>
            <div className="mb-xs flex items-center justify-between">
              <span className="type-caption text-text-tertiary">{state.vw === "fit" ? "맞춤" : `${state.vw}px`}</span>
              <span className="type-caption text-text-tertiary">{frameHeight}px</span>
            </div>
            <div className="overflow-hidden rounded-md border border-border-subtle bg-bg-default">
              <iframe
                ref={iframeRef}
                title={`${story.name} 미리보기`}
                src={iframeSrc}
                onLoad={handleIframeLoad}
                width={state.vw === "fit" ? undefined : Number(state.vw)}
                height={frameHeight}
                className="block w-full border-0"
                style={{ height: frameHeight }}
              />
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <h2 className="type-label-md text-text-secondary">코드</h2>
            <button
              type="button"
              onClick={copyJsx}
              className="type-label-sm text-text-brand underline underline-offset-2"
            >
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-md bg-bg-default p-md type-body-sm text-text-default">
            <code>{jsx}</code>
          </pre>
        </section>
      </main>

      {/* 컨트롤 */}
      <aside className="shrink-0 border-t border-border-subtle bg-bg-default p-lg lg:w-[320px] lg:border-t-0 lg:border-l">
        <h2 className="pb-lg type-label-md text-text-secondary">Props</h2>
        <ControlPanel story={story} values={props} onChange={setProp} onReset={resetProps} />
      </aside>
    </div>
  );
}
