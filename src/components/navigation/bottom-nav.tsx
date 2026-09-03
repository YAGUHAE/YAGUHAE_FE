"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import {
  ADMIN_NAV_ITEMS,
  PLAYER_NAV_ITEMS,
  resolveActiveKey,
  type AdminNavKey,
  type NavItem,
  type PlayerNavKey,
} from "./nav-items";

/** 셸의 하단 패딩과 맞춥니다: py 8×2 + 아이템(4 + 24 + 4 + 16 + 4) = 68 */
export const BOTTOM_NAV_HEIGHT_CLASS = "h-[68px]";

type BaseProps = {
  className?: string;
  /** 키별 미처리 건수 배지 (어드민 입금 확인 등) */
  badges?: Partial<Record<string, number>>;
};

export type BottomNavProps =
  | (BaseProps & { role: "player"; active?: PlayerNavKey })
  | (BaseProps & { role: "admin"; active?: AdminNavKey });

/**
 * Figma `BottomNav` — Active 7종 (용병 4탭 + 어드민 3탭).
 * 용병은 `md`(768)까지 유지하고 `lg`에서 `TopNav`로, 어드민은 `md`부터 `SideNav`로 교체됩니다.
 * `active`를 안 넘기면 pathname으로 찾습니다.
 */
export function BottomNav(props: BottomNavProps) {
  const pathname = usePathname();
  const items: NavItem<string>[] = props.role === "player" ? PLAYER_NAV_ITEMS : ADMIN_NAV_ITEMS;
  const active = props.active ?? resolveActiveKey(items, pathname);

  return (
    <nav
      aria-label={props.role === "player" ? "주요 메뉴" : "어드민 메뉴"}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex bg-bg-default py-sm pb-[max(var(--spacing-sm),env(safe-area-inset-bottom))] shadow-nav",
        BOTTOM_NAV_HEIGHT_CLASS,
        props.role === "player" ? "lg:hidden" : "md:hidden",
        props.className,
      )}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        const badge = props.badges?.[item.key];
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-xs py-xs"
          >
            <span className="relative">
              <Icon
                name={item.icon}
                size="lg"
                className={isActive ? "text-icon-brand" : "text-icon-secondary"}
              />
              {badge ? (
                <span className="absolute -top-[6px] left-[16px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bg-brand px-xs type-label-sm text-text-on-brand">
                  {badge}
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "type-label-sm whitespace-nowrap",
                isActive ? "text-text-brand" : "text-text-tertiary",
              )}
            >
              {item.shortLabel ?? item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
