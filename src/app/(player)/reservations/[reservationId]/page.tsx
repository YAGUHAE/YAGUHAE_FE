/** P-8 예약 상세 — screen-design-player.md §P-8 */
import { notFound } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { SectionBand } from "@/components/ui/section-band";
import { StatusBadge } from "@/components/ui/status-badge";
import { CancelReservationButton } from "@/features/reservations/cancel-button";
import { FeeBreakdown } from "@/features/shared/fee-breakdown";
import { InfoPill } from "@/features/shared/pill";
import { KeyValueRow, SectionTitle } from "@/features/shared/rows";
import { ScreenHeader } from "@/features/shared/screen-header";
import { getReservation } from "@/lib/data/reservations";
import { formatDateTime, formatTimestamp } from "@/lib/format";
import type { ReservationStatus } from "@/lib/reservation-status";
import { routes } from "@/lib/routes";
import { TEAM_LABEL } from "@/lib/types";

/** 상태별 안내 문구 (§P-8 표) */
const STATUS_NOTE: Record<ReservationStatus, string> = {
  RESERVED: "입금을 기다리고 있어요. 24시간 안에 입금해주세요",
  PAYMENT_SUBMITTED: "주최자가 입금을 확인하고 있어요",
  APPROVED: "자리가 확정됐어요. 경기 당일 집합 시간을 확인해주세요",
  ATTENDED: "참가 완료. 함께한 참가자를 평가해주세요",
  EXPIRED: "24시간 안에 입금이 확인되지 않아 자동 취소됐어요",
  CANCELLED: "본인이 취소한 예약이에요",
  REJECTED: "주최자가 거절한 예약이에요",
  NO_SHOW: "노쇼로 처리됐어요",
};

export default async function ReservationPage(props: PageProps<"/reservations/[reservationId]">) {
  const { reservationId } = await props.params;
  const reservation = await getReservation(reservationId);
  if (!reservation) notFound();
  const { game } = reservation;
  const multi = reservation.slots.length > 1;
  const cancellable = reservation.status === "RESERVED" || reservation.status === "PAYMENT_SUBMITTED";

  return (
    <>
      <ScreenHeader title="예약 상세" backHref="/reservations" />
      <section className="flex flex-col gap-xs px-lg py-2xl">
        <div className="flex items-center justify-between gap-md">
          <span className="type-body-md text-text-secondary">{formatDateTime(game.startsAt)}</span>
          <StatusBadge status={reservation.status} />
        </div>
        <h2 className="type-heading-md text-text-default">{game.venue}</h2>
        <p className="type-body-md text-text-secondary">{STATUS_NOTE[reservation.status]}</p>
      </section>
      <SectionBand />

      <section className="flex flex-col gap-md px-lg py-2xl">
        <SectionTitle title={`신청 자리 ${reservation.slots.length}개`} />
        {/* 행에 개별 삭제 버튼을 두지 않습니다 — 부분 취소는 v1 범위 밖이라 가능해 보이면 안 됩니다 (§P-8) */}
        <FeeBreakdown
          zeroLabel="무료 0원"
          rows={reservation.slots.map((s, i) => ({
            key: `${s.team}-${s.position}-${i}`,
            label: (
              <>
                <span>
                  {TEAM_LABEL[s.team]} {s.position}
                </span>
                <span className="text-text-default">{s.participantName}</span>
                {s.isOwner ? <InfoPill>나</InfoPill> : null}
              </>
            ),
            fee: s.fee,
          }))}
          total={multi ? { label: "합계", amount: reservation.totalFee } : undefined}
        />
      </section>
      <SectionBand />

      <section className="flex flex-col gap-md px-lg py-2xl">
        <SectionTitle title="입금 정보" />
        <KeyValueRow label="입금자명" value={reservation.depositorName} />
        <KeyValueRow label="신청 시각" value={formatTimestamp(reservation.createdAt)} mono />
      </section>
      <SectionBand />

      <section className="flex flex-col gap-md px-lg py-2xl">
        <SectionTitle title="상태 이력" />
        <ol className="flex flex-col gap-md">
          {reservation.history.map((h, i) => (
            <li key={i} className="flex items-center gap-md">
              <span
                aria-hidden
                className={cn("size-[8px] shrink-0 rounded-full", h.current ? "bg-bg-brand" : "bg-border-strong")}
              />
              <span className={cn("flex-1 type-body-md", h.current ? "text-text-default" : "text-text-secondary")}>
                {h.label}
              </span>
              <span className="type-caption text-text-tertiary">{h.note ?? formatTimestamp(h.at)}</span>
            </li>
          ))}
        </ol>
      </section>
      <SectionBand />

      <div className="flex flex-col gap-md px-lg py-2xl">
        {reservation.status === "RESERVED" ? (
          <Button fullWidth href={routes.reservationPayment(reservation.id)}>
            입금 안내로 이동
          </Button>
        ) : null}
        {reservation.status === "ATTENDED" && !reservation.reviewed ? (
          <Button fullWidth href={routes.reservationReview(reservation.id)}>
            평가하기
          </Button>
        ) : null}
        {cancellable ? <CancelReservationButton slotCount={reservation.slots.length} /> : null}
      </div>
    </>
  );
}
