/** P-6 입금 안내 — screen-design-player.md §P-6. 진입점이 셋(P-5 제출 직후 · P-7 RESERVED 클릭 · 만료 임박 알림)이라 예약 하위에 둡니다 (routing.md §3-5). */
import { notFound, redirect } from "next/navigation";
import { PaymentPanel } from "@/features/reservations/payment-panel";
import { ScreenHeader } from "@/features/shared/screen-header";
import { getReservation } from "@/lib/data/reservations";
import { routes } from "@/lib/routes";

export default async function PaymentPage(props: PageProps<"/reservations/[reservationId]/payment">) {
  const { reservationId } = await props.params;
  const reservation = await getReservation(reservationId);
  if (!reservation) notFound();
  const { expiresAt } = reservation;
  if ((reservation.status !== "RESERVED" && reservation.status !== "PAYMENT_SUBMITTED") || !expiresAt) {
    redirect(routes.reservation(reservation.id));
  }

  return (
    <>
      <ScreenHeader title="입금 안내" backHref="/reservations" />
      <PaymentPanel
        reservation={{ ...reservation, expiresAt }}
        // 계좌는 경기가 속한 리그의 값 — 예약 상세에 조인돼 옵니다 (명세 §6)
        account={reservation.game.bank}
      />
    </>
  );
}
