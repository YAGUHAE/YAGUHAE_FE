/**
 * P-9 평가 작성 — screen-design-player.md §P-9.
 * 지금은 예약 하위(`/reservations/[id]/review`)입니다. 평가 단위가 경기로 확정되면 `/games/[id]/review`로 옮깁니다 (routing.md §7-1).
 */
import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "@/features/reservations/review-form";
import { getGame } from "@/lib/data/games";
import { getReservation, listReviewTargets } from "@/lib/data/reservations";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";

export default async function ReviewPage(props: PageProps<"/reservations/[reservationId]/review">) {
  const { reservationId } = await props.params;
  const reservation = await getReservation(reservationId);
  if (!reservation) notFound();
  if (reservation.status !== "ATTENDED") redirect(routes.reservation(reservation.id));
  const game = await getGame(reservation.gameId);
  if (!game) notFound();
  const targets = await listReviewTargets(reservation);

  return (
    <ReviewForm
      targets={targets}
      gameDateLabel={formatDate(game.startsAt)}
      backHref={routes.reservation(reservation.id)}
    />
  );
}
