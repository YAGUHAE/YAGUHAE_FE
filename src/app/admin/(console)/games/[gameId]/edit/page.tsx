/** A-4 경기 수정 — screen-design-admin.md §A-4 「수정 시 제약」 */
import { notFound } from "next/navigation";
import { GameForm } from "@/features/admin/game-form";
import { getAdminGame, getGameFormContext, getLeague } from "@/lib/data/admin";

export default async function EditGamePage(props: PageProps<"/admin/games/[gameId]/edit">) {
  const { gameId } = await props.params;
  const [game, league, { recentVenues }] = await Promise.all([getAdminGame(gameId), getLeague(), getGameFormContext()]);
  if (!game) notFound();
  return <GameForm mode="edit" game={game} league={league} recentVenues={recentVenues} />;
}
