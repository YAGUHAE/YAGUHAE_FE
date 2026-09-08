/** A-4 경기 등록 — screen-design-admin.md §A-4 */
import { GameForm } from "@/features/admin/game-form";
import { getAdminGame, getLeague } from "@/lib/data/admin";
import { LAST_CREATED_GAME_ID, RECENT_VENUES } from "@/mocks/data";

export default async function NewGamePage() {
  const [league, lastGame] = await Promise.all([getLeague(), getAdminGame(LAST_CREATED_GAME_ID)]);
  return <GameForm mode="create" league={league} recentVenues={RECENT_VENUES} lastGame={lastGame} />;
}
