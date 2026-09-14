import { cn } from "@/lib/cn";
import { StatusBadge } from "@/components/ui/status-badge";
import { FeeBreakdown } from "@/features/shared/fee-breakdown";
import { InfoPill } from "@/features/shared/pill";
import { PaymentActions } from "./payment-actions";
import { formatPrice, formatShortDateTime, formatShortTimestamp, formatUntilExpiry } from "@/lib/format";
import { isPending } from "@/lib/reservation-status";
import { TEAM_LABEL, type AdminGameReservation, type AdminReservation, type ReservationSlot } from "@/lib/types";

const SOON_MS = 6 * 60 * 60 * 1000;

/** `선공 3루 홍길동 · 외 2자리` */
export function slotSummary(slots: ReservationSlot[]) {
  const first = slots[0];
  const head = `${TEAM_LABEL[first.team]} ${first.position} ${first.participantName}`;
  return slots.length > 1 ? `${head} · 외 ${slots.length - 1}자리` : head;
}

/** A-6은 경기 줄을 보여주고 슬롯은 한 줄 요약, A-5는 경기 안이므로 자리별 금액까지 펼칩니다. */
export type PaymentCardProps = { now: number; className?: string } & (
  | { variant: "payments"; reservation: AdminReservation }
  | { variant: "game"; reservation: AdminGameReservation }
);

/** 어드민 예약 카드 (base · md). lg의 A-6은 `TableRow`로 갈립니다 (responsive-design.md §5). */
export function PaymentCard(props: PaymentCardProps) {
  const { reservation, now, className } = props;
  const amount = reservation.totalFee;
  const zero = amount === 0;
  const pending = isPending(reservation.status);
  const soon = pending && reservation.expiresAt !== undefined && new Date(reservation.expiresAt).getTime() - now < SOON_MS;

  return (
    <article
      className={cn(
        "flex w-full flex-col gap-sm rounded-lg border bg-bg-default p-lg",
        zero && pending ? "border-border-brand" : "border-border-default",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-md">
        <span className="min-w-0 truncate type-heading-md text-text-default">{reservation.depositorName}</span>
        <span className="shrink-0 type-numeric-price text-text-default">{formatPrice(amount)}</span>
      </div>
      <div className="flex items-center gap-sm">
        <span className="type-caption text-text-secondary">{reservation.nickname}</span>
        {zero && pending ? <InfoPill>입금 불필요</InfoPill> : <StatusBadge status={reservation.status} />}
      </div>
      {props.variant === "payments" ? (
        <>
          <p className="type-body-sm text-text-secondary">
            {formatShortDateTime(reservation.game.startsAt)} · {reservation.game.venue}
          </p>
          <p className="type-body-sm text-text-secondary">{slotSummary(reservation.slots)}</p>
        </>
      ) : (
        <FeeBreakdown
          zeroLabel="무료 0원"
          rows={props.reservation.slots.map((s, i) => ({
            key: `${s.team}-${s.position}-${i}`,
            label: (
              <>
                <span>
                  {TEAM_LABEL[s.team]} {s.position}
                </span>
                <span className="text-text-default">{s.participantName}</span>
              </>
            ),
            fee: s.fee,
          }))}
        />
      )}
      <p className={cn("type-caption", soon ? "text-feedback-warning-text" : "text-text-tertiary")}>
        신청 {formatShortTimestamp(reservation.createdAt)}
        {soon && reservation.expiresAt ? ` · ${formatUntilExpiry(reservation.expiresAt, now)}` : ""}
      </p>
      {pending ? (
        <PaymentActions
          reservationId={reservation.id}
          depositorName={reservation.depositorName}
          amount={amount}
          rejectable={!zero}
          fullWidth
          className="pt-xs"
        />
      ) : null}
    </article>
  );
}
