/** P-5 예약 신청 폼 — screen-design-player.md §P-5 */
import { notFound, redirect } from "next/navigation";
import { ReserveForm } from "@/features/reservations/reserve-form";
import { ScreenHeader } from "@/features/shared/screen-header";
import { emptySlots, getGame, hasMyReservation } from "@/lib/data/games";
import { getProfile } from "@/lib/data/reservations";
import { routes } from "@/lib/routes";

export default async function ReservePage(props: PageProps<"/games/[gameId]/reserve">) {
  const [{ gameId }, sp] = await Promise.all([props.params, props.searchParams]);
  const game = await getGame(gameId);
  if (!game) notFound();
  // 전 슬롯 마감·마감 경기·중복 예약은 P-4에서 이미 차단됩니다 — 직접 진입만 되돌립니다
  if (game.status !== "OPEN" || emptySlots(game).length === 0 || hasMyReservation(game)) {
    redirect(routes.game(game.id));
  }
  const profile = await getProfile();
  const slot = typeof sp.slot === "string" ? sp.slot : undefined;

  return (
    <div data-shell-width="wide" className="flex flex-col">
      <ScreenHeader title="예약 신청" backHref={routes.game(game.id)} />
      <ReserveForm game={game} nickname={profile.nickname} initialSlotId={slot} />
    </div>
  );
}
