import type { HTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type GameStatus = "OPEN" | "CLOSED" | "CANCELLED";

const PILL: Record<GameStatus, { label: string; className: string }> = {
  OPEN: { label: "모집중", className: "bg-bg-brand text-text-on-brand" },
  CLOSED: { label: "마감", className: "bg-bg-muted text-text-secondary" },
  CANCELLED: { label: "취소", className: "bg-bg-danger text-text-on-danger" },
};

export type MatchRowProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** `19:00` — 행의 주인공. 날짜는 DateCell 스트립이 담당하므로 넣지 않습니다. */
  time: string;
  venue: string;
  /** `선공 4/11 · 후공 6/11` */
  capacity: string;
  /** `13,000원부터` */
  price: string;
  /** `3~5급` — 가격 옆에 `· ` 접두로 붙습니다. */
  meta?: string;
  /** 빈 포지션 칩. OPEN에서만 그립니다 — 마감·취소 행에 「모집」 칩이 뜨면 모순입니다. */
  chips?: string[];
  status: GameStatus;
  /** 행 전체가 탭 타깃입니다. 있으면 `<a>`, 없으면 `<div>`. */
  href?: string;
};

/**
 * Figma `MatchRow` — P-3 · A-3 경기 목록 행. `GameCard`를 대체합니다.
 * 좌측 시간(모노) → 본문 → 우측 상태 pill. pill은 버튼이 아니라 상태 표시입니다.
 */
export function MatchRow({
  time,
  venue,
  capacity,
  price,
  meta,
  chips,
  status,
  href,
  className,
  ...rest
}: MatchRowProps) {
  const muted = status !== "OPEN";
  const pill = PILL[status];
  const content = (
    <>
      <span
        className={cn(
          "shrink-0 type-numeric-price",
          muted ? "text-text-tertiary" : "text-text-default",
        )}
      >
        {time}
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-xs">
        <span
          className={cn(
            "w-full truncate type-heading-sm",
            muted ? "text-text-tertiary" : "text-text-default",
          )}
        >
          {venue}
        </span>
        <span className="type-body-sm text-text-secondary">{capacity}</span>
        <span className="flex items-center gap-xs">
          <span className="type-numeric-price text-text-default">{price}</span>
          {meta ? <span className="type-body-sm text-text-tertiary">· {meta}</span> : null}
        </span>
        {status === "OPEN" && chips && chips.length > 0 ? (
          <span className="flex flex-wrap gap-xs">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-sm bg-accent-clay-bg px-sm py-2xs type-label-sm text-accent-clay-text"
              >
                {chip}
              </span>
            ))}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "shrink-0 rounded-sm px-md py-sm type-label-sm whitespace-nowrap",
          pill.className,
        )}
      >
        {pill.label}
      </span>
    </>
  );

  const rootClass = cn(
    "flex w-full items-start gap-md border-b border-border-subtle bg-bg-default p-lg text-left",
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
