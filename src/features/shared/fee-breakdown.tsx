import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

export type FeeRow = { key: string; label: ReactNode; fee: number };

export type FeeBreakdownProps = {
  rows: FeeRow[];
  /** 합계 행. 슬롯이 1개면 넣지 않습니다 (§P-6 "슬롯이 1개면 내역 없이"). */
  total?: { label: ReactNode; amount: number };
  /** 0원 표기 — P-5는 `무료`, P-6·P-8은 `무료 0원` */
  zeroLabel?: string;
  className?: string;
};

/** 슬롯별 금액 내역 회색 블록 (P-5 선택 요약 · P-6 입금액 · P-8 신청 자리 · A-5 예약 카드). */
export function FeeBreakdown({ rows, total, zeroLabel = "무료", className }: FeeBreakdownProps) {
  return (
    <div className={cn("flex w-full flex-col gap-sm rounded-md bg-bg-subtle px-lg py-md", className)}>
      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-md">
          <span className="flex min-w-0 flex-1 items-center gap-sm type-body-md text-text-secondary">{row.label}</span>
          <span className={cn("shrink-0 type-numeric-price", row.fee === 0 ? "text-text-brand" : "text-text-default")}>
            {row.fee === 0 ? zeroLabel : formatPrice(row.fee)}
          </span>
        </div>
      ))}
      {total ? (
        <>
          <div role="presentation" className="my-xs h-px w-full bg-border-brand" />
          <div className="flex items-center justify-between gap-md">
            <span className="type-heading-sm text-text-default">{total.label}</span>
            <span className="type-numeric-countdown text-text-brand">{formatPrice(total.amount)}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
