import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export type ScreenHeaderProps = {
  title: string;
  /** 목록 → 상세 2단에서만 (routing.md §3-4). 루트 탭 화면은 넣지 않습니다. */
  backHref?: string;
  /** P-9 `1 / 8` 같은 우측 보조 표시 */
  trailing?: ReactNode;
  className?: string;
};

/** 용병 화면 상단 헤더 — 뒤로가기 chevron + 제목. `PageHeader`(어드민 콘솔)와 달리 헤어라인으로 닫습니다. */
export function ScreenHeader({ title, backHref, trailing, className }: ScreenHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-[56px] w-full shrink-0 items-center gap-xs border-b border-border-subtle bg-bg-default px-lg",
        className,
      )}
    >
      {backHref ? (
        <Link
          href={backHref}
          aria-label="뒤로 가기"
          className="-ml-sm flex size-(--size-touch-min) shrink-0 items-center justify-center rounded-md text-icon-default hover:bg-bg-hover"
        >
          <Icon name="chevron-left" size="lg" />
        </Link>
      ) : null}
      {title ? (
        <h1 className="min-w-0 flex-1 truncate type-heading-md text-text-default">{title}</h1>
      ) : (
        <span className="flex-1" />
      )}
      {trailing ? <div className="shrink-0 type-label-md text-text-secondary">{trailing}</div> : null}
    </header>
  );
}

/** P-3 홈 헤더 — 워드마크만. `lg`에서는 `TopNav`가 로고를 들고 있으므로 숨깁니다 (responsive-design.md §7.1). */
export function LogoHeader({ className }: { className?: string }) {
  return (
    <header className={cn("flex h-[56px] w-full shrink-0 items-center bg-bg-default px-lg lg:hidden", className)}>
      <Image src="/logo-wordmark.svg" alt="야구해" width={90} height={24} priority />
    </header>
  );
}
