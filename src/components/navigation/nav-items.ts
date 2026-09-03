import type { IconName } from "@/components/ui/icon";

export type NavItem<K extends string> = {
  key: K;
  href: string;
  icon: IconName;
  /** TopNav · SideNav Full 라벨 */
  label: string;
  /** BottomNav 라벨 (폭 때문에 줄인 것). 없으면 `label` */
  shortLabel?: string;
};

export type PlayerNavKey = "games" | "reservations" | "notifications" | "my";
export type AdminNavKey = "games" | "payments" | "league";

/** 용병 4탭. 아이콘·순서는 Figma `BottomNav`·`TopNav`와 동일합니다. */
export const PLAYER_NAV_ITEMS: NavItem<PlayerNavKey>[] = [
  { key: "games", href: "/games", icon: "calendar", label: "경기 목록" },
  { key: "reservations", href: "/reservations", icon: "check", label: "내 예약" },
  { key: "notifications", href: "/notifications", icon: "bell", label: "알림함" },
  { key: "my", href: "/my", icon: "user", label: "마이페이지", shortLabel: "마이" },
];

/** 리그 어드민 3탭. */
export const ADMIN_NAV_ITEMS: NavItem<AdminNavKey>[] = [
  { key: "games", href: "/admin/games", icon: "calendar", label: "경기" },
  { key: "payments", href: "/admin/payments", icon: "banknote", label: "입금 확인" },
  { key: "league", href: "/admin/league", icon: "users", label: "리그" },
];

/** pathname으로 활성 탭을 찾습니다. 가장 긴 prefix가 이깁니다. */
export function resolveActiveKey<K extends string>(
  items: NavItem<K>[],
  pathname: string | null,
): K | undefined {
  if (!pathname) return undefined;
  let best: NavItem<K> | undefined;
  for (const item of items) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.href.length) best = item;
    }
  }
  return best?.key;
}
