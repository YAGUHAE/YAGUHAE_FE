import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ReservationStatus } from "@/lib/reservation-status";

export type ReservationRowProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  venue: string;
  /** `2026년 8월 12일 (수) 19:00` */
  datetime: string;
  status: ReservationStatus;
  /** 행 전체 탭 타깃 (P-8 상세 / P-6 입금 안내). */
  href?: string;
  /** ATTENDED 미평가 건의 「평가하기」 같은 우측 액션. 있으면 chevron 대신 그립니다. */
  action?: ReactNode;
};

/**
 * Figma `ReservationRow` — P-7 내 예약 리스트 아이템.
 * v2에서 카드(라운드+테두리)를 평탄화해 `MatchRow`와 같은 행 언어를 씁니다.
 * `href`와 `action`이 함께 있으면 링크를 stretched-link로 깔고 액션만 위에 띄웁니다.
 */
export function ReservationRow({
  venue,
  datetime,
  status,
  href,
  action,
  className,
  ...rest
}: ReservationRowProps) {
  const info = (
    <>
      <span className="flex w-full items-center gap-sm">
        <span className="truncate type-heading-sm text-text-default">{venue}</span>
        <StatusBadge status={status} />
      </span>
      <span className="w-full type-body-sm text-text-secondary">{datetime}</span>
    </>
  );
  return (
    <div
      className={cn(
        "relative flex w-full items-center gap-md border-b border-border-subtle bg-bg-default p-lg",
        href && "transition-colors hover:bg-bg-hover",
        className,
      )}
      {...rest}
    >
      {href ? (
        <Link
          href={href}
          className="flex min-w-0 flex-1 flex-col items-start gap-xs after:absolute after:inset-0 after:content-['']"
        >
          {info}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col items-start gap-xs">{info}</div>
      )}
      {action ? (
        <div className="relative z-10 shrink-0">{action}</div>
      ) : (
        <Icon name="chevron-right" size="md" className="text-icon-secondary" />
      )}
    </div>
  );
}

/** `ReservationRow`의 우측 액션 pill — 「평가하기」. 높이 36(`size/control-sm`). */
export function ReservationRowAction({
  className,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-(--size-control-sm) items-center justify-center rounded-full border border-border-brand bg-bg-brand-subtle px-md type-label-md text-text-brand whitespace-nowrap transition-colors hover:bg-bg-brand-hover hover:text-text-on-brand",
        className,
      )}
      {...rest}
    />
  );
}
