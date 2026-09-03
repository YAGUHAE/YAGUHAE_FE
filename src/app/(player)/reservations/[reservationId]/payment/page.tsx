/** P-6 입금 안내 — screen-design-player.md §P-6. 진입점이 셋(P-5 제출 직후 · P-7 RESERVED 클릭 · 만료 임박 알림)이라 예약 하위에 둡니다 (routing.md §3-5). */
import { notFound, redirect } from "next/navigation";
import { PaymentPanel } from "@/features/reservations/payment-panel";
import { ScreenHeader } from "@/features/shared/screen-header";
import { getLeague } from "@/lib/data/admin";
import { getReservation } from "@/lib/data/reservations";
import { routes } from "@/lib/routes";

export default async function PaymentPage(props: PageProps<"/reservations/[reservationId]/payment">) {
  const { reservationId } = await props.params;
  const reservation = await getReservation(reservationId);
  if (!reservation) notFound();
  if (reservation.status !== "RESERVED" && reservation.status !== "PAYMENT_SUBMITTED") {
    redirect(routes.reservation(reservation.id));
  }
  // TODO: 계좌는 경기가 속한 리그의 값 (A-8 입금 계좌). 지금은 단일 리그 목입니다
  const league = await getLeague();

  return (
    <>
      <ScreenHeader title="입금 안내" backHref="/reservations" />
      <PaymentPanel
        reservation={reservation}
        account={{ bank: league.bank, accountNumber: league.accountNumber, accountHolder: league.accountHolder }}
      />
    </>
  );
}
