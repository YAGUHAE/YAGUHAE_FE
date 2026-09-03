"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { isPreviewMessage, parseState, type PreviewBg, type PreviewTheme } from "../encoding";
import { getStory, resolveProps } from "../stories";

/** 플레이그라운드 iframe 안에서 스토리 하나만 그립니다. props·테마는 부모의 postMessage로 갱신됩니다. */
export function PreviewClient() {
  const searchParams = useSearchParams();
  const initial = parseState(searchParams);
  const [overrides, setOverrides] = useState<Record<string, unknown>>(initial.props);
  const [theme, setTheme] = useState<PreviewTheme>(initial.theme);
  const [bg, setBg] = useState<PreviewBg>(initial.bg);
  const rootRef = useRef<HTMLDivElement>(null);

  const story = getStory(initial.story);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !isPreviewMessage(e.data)) return;
      if (e.data.type === "yaguhae:preview-props") setOverrides(e.data.props);
      else {
        setTheme(e.data.theme);
        setBg(e.data.bg);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  // 콘텐츠 높이를 부모에게 알립니다 (셸 스토리는 부모가 고정 높이를 씁니다).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const report = () => {
      window.parent.postMessage(
        { type: "yaguhae:preview-height", height: el.getBoundingClientRect().height },
        window.location.origin,
      );
    };
    const observer = new ResizeObserver(report);
    observer.observe(el);
    report();
    return () => observer.disconnect();
  }, []);

  if (!story) {
    return (
      <p className="p-lg type-body-md text-text-danger">
        알 수 없는 스토리입니다: {initial.story}
      </p>
    );
  }

  const props = resolveProps(story, overrides);
  return (
    <div
      ref={rootRef}
      className={cn(
        "flex w-full flex-col",
        bg === "subtle" ? "bg-bg-subtle" : "bg-bg-default",
        story.fullHeight ? "min-h-dvh" : "items-start p-lg",
      )}
    >
      {story.render(props)}
    </div>
  );
}
