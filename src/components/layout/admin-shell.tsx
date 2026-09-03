import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BottomNav } from "@/components/navigation/bottom-nav";
import type { AdminNavKey } from "@/components/navigation/nav-items";
import { SideNav } from "@/components/navigation/side-nav";

export type AdminShellProps = {
  children: ReactNode;
  leagueName: string;
  active?: AdminNavKey;
  /** 미처리 건수 — 세 형태(BottomNav · Rail · Full) 모두에 배지로 나갑니다. */
  badges?: Partial<Record<AdminNavKey, number>>;
  className?: string;
};

/**
 * 리그 어드민 콘솔 셸 (responsive-design.md §2·§3).
 * base: full + BottomNav 3탭 · md: 레일 72 + 640 중앙 · lg: 풀 240 + 본문 976 (콘솔 전체 1440 잠금).
 * 1440을 넘으면 사이드바가 콘텐츠와 함께 중앙 정렬됩니다 — 뷰포트 왼쪽에 붙지 않습니다.
 */
export function AdminShell({ children, leagueName, active, badges, className }: AdminShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-console">
      <SideNav leagueName={leagueName} active={active} badges={badges} />
      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col bg-bg-default pb-[68px]",
          "md:mx-auto md:max-w-content md:bg-transparent md:px-2xl md:py-2xl md:pb-2xl",
          "lg:mx-0 lg:max-w-none lg:px-3xl lg:py-3xl",
          className,
        )}
      >
        {children}
      </main>
      <BottomNav role="admin" active={active} badges={badges} />
    </div>
  );
}
