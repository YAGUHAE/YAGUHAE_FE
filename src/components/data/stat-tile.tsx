import type { HTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export type StatTileProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  label: string;
  value: number;
  unit?: string;
  href?: string;
};

/**
 * Figma `StatTile` — A-2 홈 상단 지표 타일 (lg 3열). Tone은 값으로 결정합니다:
 * 0이면 회색 숫자, 1 이상이면 text/brand. 0건도 숨기지 않습니다 (어드민 명세 §A-2).
 */
export function StatTile({ label, value, unit = "건", href, className, ...rest }: StatTileProps) {
  const attention = value > 0;
  const content = (
    <>
      <span className="flex w-full items-center gap-sm">
        <span className="type-label-md text-text-secondary">{label}</span>
        <span className="flex-1" />
        <Icon name="chevron-right" size="lg" className="text-icon-default" />
      </span>
      <span className="flex items-center gap-2xs">
        <span
          className={cn(
            "type-numeric-countdown",
            attention ? "text-text-brand" : "text-text-default",
          )}
        >
          {value}
        </span>
        <span className="type-body-md text-text-secondary">{unit}</span>
      </span>
    </>
  );
  const rootClass = cn(
    "flex w-full flex-col items-start gap-sm rounded-lg border border-border-default bg-bg-default p-2xl",
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
