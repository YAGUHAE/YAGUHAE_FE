import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** `feedback/info` 쌍의 소형 배지 — A-6 `입금 불필요`, A-7 `대리`, P-8 `나`. 상태가 아닌 부가 표시라 `StatusBadge`와 구분합니다. */
export function InfoPill({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm bg-feedback-info-bg px-sm py-2xs type-label-sm text-feedback-info-text whitespace-nowrap",
        className,
      )}
      {...rest}
    />
  );
}

/** `status/reserved` 쌍의 소형 배지 — A-2·A-3 `입금 3건`. */
export function AttentionPill({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm bg-status-reserved-bg px-sm py-2xs type-label-sm text-status-reserved-text whitespace-nowrap",
        className,
      )}
      {...rest}
    />
  );
}
