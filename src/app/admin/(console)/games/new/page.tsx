/** A-4 경기 등록 — screen-design-admin.md §A-4 */
import { GameForm } from "@/features/admin/game-form";
import { getGameFormContext, getLeague } from "@/lib/data/admin";

export default async function NewGamePage() {
  const [league, { lastGame, recentVenues }] = await Promise.all([getLeague(), getGameFormContext()]);
  return <GameForm mode="create" league={league} recentVenues={recentVenues} lastGame={lastGame} />;
}
