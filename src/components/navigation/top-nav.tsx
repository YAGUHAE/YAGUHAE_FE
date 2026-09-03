"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { NavBadge } from "./nav-badge";
import { PLAYER_NAV_ITEMS, resolveActiveKey, type PlayerNavKey } from "./nav-items";

export type TopNavProps = {
  active?: PlayerNavKey;
  /** 알림함 미읽음 수. 0이면 배지를 숨깁니다. */
  unreadCount?: number;
  className?: string;
};

/**
 * Figma `TopNav` — 용병 `lg`(1280~) 상단 내비. `BottomNav` 4탭을 데스크톱에서 대체합니다.
 * 높이 `size/topnav-height` 64, 좌측 워드마크 90×24, 우측 탭 4개(라벨은 `마이페이지` 전체).
 * 1440 초과 화면에서는 안쪽 컨테이너가 `size/container-console`로 잠깁니다.
 */
export function TopNav({ active: activeProp, unreadCount = 0, className }: TopNavProps) {
  const pathname = usePathname();
  const active = activeProp ?? resolveActiveKey(PLAYER_NAV_ITEMS, pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 hidden h-(--size-topnav-height) border-b border-border-subtle bg-bg-default px-3xl lg:block",
        className,
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-console items-center">
        <Link href="/games" aria-label="야구해 홈" className="flex shrink-0 items-center">
          <Image src="/logo-wordmark.svg" alt="야구해" width={90} height={24} priority />
        </Link>
        <span className="flex-1" />
        <nav aria-label="주요 메뉴" className="flex items-center gap-xs">
          {PLAYER_NAV_ITEMS.map((item) => {
            const isActive = item.key === active;
            const badge = item.key === "notifications" && unreadCount > 0 ? unreadCount : null;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-(--size-control-md) items-center gap-sm rounded-md px-md type-label-md whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-bg-brand-subtle text-text-brand"
                    : "text-text-secondary hover:bg-bg-hover",
                )}
              >
                <Icon
                  name={item.icon}
                  size="lg"
                  className={isActive ? "text-icon-brand" : "text-icon-secondary"}
                />
                {item.label}
                {badge ? <NavBadge value={badge} /> : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
