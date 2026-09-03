"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

/** P-8 예약 취소 — RESERVED · PAYMENT_SUBMITTED에서만. 취소는 예약 전체 단위입니다 (§3.2). */
export function CancelReservationButton({ slotCount }: { slotCount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
        예약 취소
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="예약을 취소할까요?"
        description={`신청한 ${slotCount}자리가 모두 취소돼요. 자리 하나만 빼는 건 아직 지원하지 않아요.`}
        secondary={{ label: "돌아가기", onClick: () => setOpen(false) }}
        primary={{
          label: "취소하기",
          onClick: () => {
            // TODO: PATCH /reservations/:id/cancel
            setOpen(false);
            router.push("/reservations?tab=closed");
          },
        }}
      />
    </>
  );
}
