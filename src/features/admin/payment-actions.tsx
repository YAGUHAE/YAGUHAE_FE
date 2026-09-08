"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button, type ButtonSize } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";

const REJECT_REASONS = ["미입금", "금액 불일치", "중복 신청", "기타"] as const;

export type PaymentActionsProps = {
  reservationId: string;
  depositorName: string;
  amount: number;
  size?: ButtonSize;
  /** 0원 예약은 확인할 입금이 없으므로 `거절`이 없습니다 (§A-6). */
  rejectable?: boolean;
  /** 카드(base)에서는 두 버튼이 폭을 나눠 갖고, 테이블(lg)에서는 내용 폭입니다. */
  fullWidth?: boolean;
  className?: string;
};

/**
 * `입금 완료` · `거절` — 화면이 아니라 액션입니다 (routing.md §3-6). A-6과 A-5 두 곳에서 같은 동작.
 * 확인 다이얼로그(입금자명·금액 재확인)와 사유 선택 4종은 컴포넌트 상태로만 처리합니다.
 */
export function PaymentActions({
  reservationId,
  depositorName,
  amount,
  size = "medium",
  rejectable = true,
  fullWidth = false,
  className,
}: PaymentActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REJECT_REASONS)[number]>("미입금");
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  if (done) {
    return (
      <span className={cn("flex items-center type-label-md text-text-secondary", fullWidth && "h-(--size-control-md)", className)}>
        {done === "approved" ? "입금 완료 처리됨" : `거절됨 · ${reason}`}
      </span>
    );
  }

  return (
    <>
      <div className={cn("flex items-center gap-sm", fullWidth ? "w-full" : "justify-end", className)}>
        {rejectable ? (
          <Button
            variant="secondary"
            size={size}
            className={cn(fullWidth && "min-w-0 flex-1")}
            onClick={() => setRejectOpen(true)}
          >
            거절
          </Button>
        ) : null}
        <Button size={size} className={cn(fullWidth && "min-w-0 flex-[1.4]")} onClick={() => setConfirmOpen(true)}>
          입금 완료
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="입금 완료로 처리할까요?"
        description={
          <span className="flex flex-col gap-xs">
            <span>은행 내역과 아래 값이 같은지 확인해주세요.</span>
            <span className="flex items-center justify-between rounded-md bg-bg-subtle px-md py-sm">
              <span className="type-heading-sm text-text-default">{depositorName}</span>
              <span className="type-numeric-price text-text-default">{formatPrice(amount)}</span>
            </span>
          </span>
        }
        secondary={{ label: "돌아가기", onClick: () => setConfirmOpen(false) }}
        primary={{
          label: "입금 완료",
          onClick: () => {
            // TODO: PATCH /admin/reservations/:id/confirm-payment + revalidatePath('/admin', 'layout')
            void reservationId;
            setConfirmOpen(false);
            setDone("approved");
          },
        }}
      />
      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="거절 사유를 골라주세요"
        description={
          <span className="flex flex-col gap-2xs pt-xs">
            {REJECT_REASONS.map((r) => (
              <label key={r} className="flex h-(--size-control-md) cursor-pointer items-center gap-md">
                <input
                  type="radio"
                  name={`reject-${reservationId}`}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="size-[20px] accent-(--color-bg-brand)"
                />
                <span className="type-body-lg text-text-default">{r}</span>
              </label>
            ))}
            <span className="type-caption text-text-tertiary">사유는 신청자에게 그대로 전달돼요</span>
          </span>
        }
        secondary={{ label: "돌아가기", onClick: () => setRejectOpen(false) }}
        primary={{
          label: "거절하기",
          onClick: () => {
            // TODO: PATCH /admin/reservations/:id/reject — 슬롯이 다시 열립니다
            setRejectOpen(false);
            setDone("rejected");
          },
        }}
      />
    </>
  );
}
