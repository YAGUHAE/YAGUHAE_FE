import { PlayerShell } from "@/components/layout/player-shell";
import { getUnreadCount } from "@/lib/data/reservations";

/**
 * 용병 셸 — 여기서 한 번만 두릅니다 (routing.md §3-2). `active`는 내비가 pathname으로 해결합니다.
 * ⚠️ layout은 네비게이션마다 다시 실행되지 않습니다 — 읽음 처리 액션에서 `revalidatePath('/', 'layout')`을 걸어야 배지가 갱신됩니다.
 */
export default async function PlayerLayout({ children }: LayoutProps<"/">) {
  const unreadCount = await getUnreadCount();
  return <PlayerShell unreadCount={unreadCount}>{children}</PlayerShell>;
}
