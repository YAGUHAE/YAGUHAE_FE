import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export type PageHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: string;
  /** A-2 홈의 `상암 리그 · 2026년 9월 3일 (수)` 같은 메타 줄 */
  meta?: string;
  /** 목록 → 상세 2단 깊이에서만. Breadcrumb을 따로 두지 않은 이유가 이 chevron입니다. */
  backHref?: string;
  /** 우측 액션 (`Button size="medium"` 1~2개). 보조 → 주요 순서로 넣습니다. */
  actions?: ReactNode;
};

/** Figma `PageHeader` — Actions(None/One/Two) + 메타 표시 · 뒤로가기 표시. 콘솔 본문 최상단. */
export function PageHeader({
  title,
  meta,
  backHref,
  actions,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <div className={cn("flex w-full items-center gap-lg pb-2xl", className)} {...rest}>
      <div className="flex min-w-0 flex-col gap-2xs">
        <div className="flex items-center gap-sm">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="뒤로 가기"
              className="-ml-xs flex size-(--size-touch-min) shrink-0 items-center justify-center rounded-md text-icon-default hover:bg-bg-hover lg:-ml-0 lg:size-auto"
            >
              <Icon name="chevron-left" size="lg" />
            </Link>
          ) : null}
          <h1 className="truncate type-heading-lg text-text-default">{title}</h1>
        </div>
        {meta ? <p className="type-body-md text-text-secondary">{meta}</p> : null}
      </div>
      <span className="flex-1" />
      {actions ? <div className="flex shrink-0 items-center gap-sm">{actions}</div> : null}
    </div>
  );
}
