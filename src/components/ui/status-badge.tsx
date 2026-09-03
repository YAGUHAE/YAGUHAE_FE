import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import {
  RESERVATION_STATUS_LABEL,
  type ReservationStatus,
} from "@/lib/reservation-status";

const STATUS_CLASS: Record<ReservationStatus, string> = {
  RESERVED: "bg-status-reserved-bg text-status-reserved-text",
  PAYMENT_SUBMITTED:
    "bg-status-payment-submitted-bg text-status-payment-submitted-text",
  APPROVED: "bg-status-approved-bg text-status-approved-text",
  ATTENDED: "bg-status-attended-bg text-status-attended-text",
  EXPIRED: "bg-status-expired-bg text-status-expired-text",
  CANCELLED: "bg-status-cancelled-bg text-status-cancelled-text",
  REJECTED: "bg-status-rejected-bg text-status-rejected-text",
  NO_SHOW: "bg-status-no-show-bg text-status-no-show-text",
};

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: ReservationStatus;
};

/**
 * Figma `StatusBadge` — 예약 상태 8종.
 * 문구는 상태가 결정하므로 children을 받지 않습니다. 색은 status 토큰 bg/text 쌍 고정.
 */
export function StatusBadge({ status, className, ...rest }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full px-md py-xs type-label-sm whitespace-nowrap",
        STATUS_CLASS[status],
        className,
      )}
      {...rest}
    >
      {RESERVATION_STATUS_LABEL[status]}
    </span>
  );
}
