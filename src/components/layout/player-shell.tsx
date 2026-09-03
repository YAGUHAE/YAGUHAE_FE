import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BottomNav } from "@/components/navigation/bottom-nav";
import type { PlayerNavKey } from "@/components/navigation/nav-items";
import { TopNav } from "@/components/navigation/top-nav";

export type PlayerShellProps = {
  children: ReactNode;
  active?: PlayerNavKey;
  unreadCount?: number;
  /** P-1 로그인 · P-2 온보딩처럼 탭 진입 전 화면은 내비를 그리지 않습니다. */
  nav?: boolean;
  /**
   * `lg` 본문 폭. 기본 `content`(640 중앙). P-4·P-5처럼 정보 열 + 보드 열로 split하는 화면은
   * `wide`(976 = 360 + 32 + 584)로 두고 본문에서 `Split variant="info"`를 씁니다.
   */
  width?: "content" | "wide";
  className?: string;
};

/**
 * 용병 화면 셸 (responsive-design.md §7.1).
 * base: full + BottomNav · md: 640 중앙 + BottomNav 유지 · lg: 640 중앙 + TopNav.
 * P-4·P-5 `lg` split은 본문에서 `Split variant="info"`로 처리합니다.
 */
export function PlayerShell({
  children,
  active,
  unreadCount,
  nav = true,
  width = "content",
  className,
}: PlayerShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      {nav ? <TopNav active={active} unreadCount={unreadCount} /> : null}
      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col bg-bg-default",
          "md:my-2xl md:max-w-content lg:my-3xl",
          width === "wide" && "lg:max-w-wide",
          nav && "pb-[68px] lg:pb-0",
          className,
        )}
      >
        {children}
      </main>
      {nav ? <BottomNav role="player" active={active} /> : null}
    </div>
  );
}
