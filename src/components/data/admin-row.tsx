import type { HTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export type AdminRowProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  title: string;
  /** 제목 옆 소형 배지 (`대기`). 없으면 그리지 않습니다. */
  badge?: string;
  description: string;
  /** `08.03 21:14` 같은 보조 시각 */
  meta?: string;
  href?: string;
  /** 우측 chevron. 기본 true */
  chevron?: boolean;
};

/**
 * Figma `AdminRow` — A-2 홈의 다가오는 경기 목록 행 (배지 · 메타 · 화살표 BOOLEAN 3개).
 */
export function AdminRow({
  title,
  badge,
  description,
  meta,
  href,
  chevron = true,
  className,
  ...rest
}: AdminRowProps) {
  const content = (
    <>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-xs">
        <span className="flex w-full items-center gap-[6px]">
          <span className="truncate type-heading-sm text-text-default">{title}</span>
          {badge ? (
            <span className="shrink-0 rounded-full bg-status-reserved-bg px-sm py-2xs type-label-sm text-status-reserved-text">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="w-full type-body-md text-text-secondary">{description}</span>
        {meta ? <span className="w-full type-caption text-text-tertiary">{meta}</span> : null}
      </span>
      {chevron ? <Icon name="chevron-right" size="md" className="text-icon-secondary" /> : null}
    </>
  );
  const rootClass = cn(
    "flex w-full items-center gap-md border-b border-border-subtle bg-bg-default px-xl py-[14px] text-left",
    href && "transition-colors hover:bg-bg-hover",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={rootClass} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <div className={rootClass} {...rest}>
      {content}
    </div>
  );
}
