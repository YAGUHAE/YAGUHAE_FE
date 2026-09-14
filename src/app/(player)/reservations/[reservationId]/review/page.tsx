/**
 * P-9 평가 작성 — screen-design-player.md §P-9.
 * 평가 API는 경기 단위(`/games/:gameId/participants` · `/evaluations`)지만, 진입점이 P-7·P-8의 예약이라
 * URL은 예약 하위에 두고 예약의 경기 id로 호출합니다 (routing.md §7-1).
 */
import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "@/features/reservations/review-form";
import { getReservation, listReviewTargets } from "@/lib/data/reservations";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";

export default async function ReviewPage(props: PageProps<"/reservations/[reservationId]/review">) {
  const { reservationId } = await props.params;
  const reservation = await getReservation(reservationId);
  if (!reservation) notFound();
  if (reservation.status !== "ATTENDED") redirect(routes.reservation(reservation.id));
  const targets = await listReviewTargets(reservation.gameId);

  return (
    <ReviewForm
      targets={targets}
      gameDateLabel={formatDate(reservation.game.startsAt)}
      backHref={routes.reservation(reservation.id)}
    />
  );
}
