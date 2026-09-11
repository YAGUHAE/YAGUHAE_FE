"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { Dialog } from "@/components/ui/dialog";
import { SectionBand } from "@/components/ui/section-band";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { Toast } from "@/components/ui/toast";
import { FeeBreakdown } from "@/features/shared/fee-breakdown";
import { InlineNotice } from "@/features/shared/inline-notice";
import { InfoBox, KeyValueRow, SectionTitle } from "@/features/shared/rows";
import { formatPrice } from "@/lib/format";
import type { ReservationStatus } from "@/lib/reservation-status";
import { FEE_TIER_LABEL, type BankAccount, type Reservation } from "@/lib/types";

export type PaymentPanelProps = {
  /** 입금 대기 중인 예약 — 만료 시각이 반드시 있습니다. */
  reservation: Reservation & { expiresAt: string };
  account: BankAccount;
};

/** P-6 입금 안내 — 카운트다운이 주인공. 계좌는 옮겨 적는 값이라 모노 + 복사, 금액은 합계 + 슬롯별 내역. */
export function PaymentPanel({ reservation, account }: PaymentPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ReservationStatus>(reservation.status);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [expired, setExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = reservation.totalFee;
  const multi = reservation.slots.length > 1;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 클립보드 권한이 없으면 조용히 넘어갑니다 — 값은 화면에 그대로 있습니다 */
    }
  };

  const submitPayment = () => {
    // TODO: PATCH /reservations/:id/payment-submitted
    setStatus("PAYMENT_SUBMITTED");
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-md px-lg py-2xl">
        <Countdown
          expiresAt={reservation.expiresAt}
          label="이 시간 안에 입금해야 자리가 유지돼요"
          onExpire={() => status === "RESERVED" && setExpired(true)}
        />
        <StatusBadge status={status} />
        {status === "PAYMENT_SUBMITTED" ? (
          <p className="type-body-md text-text-secondary">주최자 승인을 기다리고 있어요</p>
        ) : null}
      </div>
      <SectionBand />

      <section className="flex flex-col gap-md px-lg py-2xl">
        <SectionTitle title="입금 계좌" aside={<TextLink onClick={copy}>계좌 복사</TextLink>} />
        <InfoBox>
          <KeyValueRow label="은행" value={account.bank} />
          <KeyValueRow label="계좌번호" value={account.accountNumber} mono />
          <KeyValueRow label="예금주" value={account.accountHolder} />
        </InfoBox>
      </section>
      <SectionBand />

      <section className="flex flex-col gap-md px-lg py-2xl">
        <SectionTitle title="입금액" />
        <div className="flex items-center justify-between">
          <span className="type-body-lg text-text-secondary">
            {multi ? "합계" : `입금액 (${FEE_TIER_LABEL[reservation.slots[0].feeTier]})`}
          </span>
          <span className="type-numeric-countdown text-text-brand">{formatPrice(total)}</span>
        </div>
        {multi ? (
          <>
            <FeeBreakdown
              zeroLabel="무료 0원"
              rows={reservation.slots.map((s, i) => ({
                key: `${s.team}-${s.position}-${i}`,
                label: `${s.position} · ${FEE_TIER_LABEL[s.feeTier]}`,
                fee: s.fee,
              }))}
            />
            <p className="type-caption text-text-tertiary">슬롯마다 티어가 달라서 내역을 펼쳐 뒀어요</p>
          </>
        ) : null}
      </section>
      <SectionBand />

      <div className="flex flex-col gap-lg px-lg py-2xl">
        <InlineNotice tone="info">입금 후 아래 버튼을 눌러주세요. 주최자가 확인하면 자리가 확정돼요.</InlineNotice>
        <Button fullWidth disabled={status !== "RESERVED"} onClick={submitPayment}>
          {status === "RESERVED" ? "입금 완료했어요" : "주최자 확인 중"}
        </Button>
        {status === "RESERVED" ? (
          <TextLink onClick={() => setCancelOpen(true)} className="self-center text-text-brand">
            신청 취소
          </TextLink>
        ) : null}
      </div>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="신청을 취소할까요?"
        description={`잡아 둔 ${reservation.slots.length}자리가 모두 풀려요. 취소 후에는 되돌릴 수 없어요.`}
        secondary={{ label: "돌아가기", onClick: () => setCancelOpen(false) }}
        primary={{
          label: "취소하기",
          onClick: () => {
            // TODO: PATCH /reservations/:id/cancel
            setCancelOpen(false);
            router.push("/reservations");
          },
        }}
      />
      <Dialog
        open={expired}
        onClose={() => setExpired(false)}
        title="신청이 만료되었어요"
        description="24시간 안에 입금이 확인되지 않아 자동 취소됐어요. 경기 목록에서 다시 신청할 수 있어요."
        primary={{ label: "경기 목록으로", onClick: () => router.push("/games") }}
      />
      {copied ? (
        <Toast type="success" className="fixed inset-x-lg bottom-[84px] z-50 lg:inset-x-auto lg:right-3xl lg:bottom-3xl lg:w-[360px]">
          계좌번호를 복사했어요
        </Toast>
      ) : null}
    </div>
  );
}
