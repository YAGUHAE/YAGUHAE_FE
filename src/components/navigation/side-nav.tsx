"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { NavBadge } from "./nav-badge";
import { ADMIN_NAV_ITEMS, resolveActiveKey, type AdminNavKey } from "./nav-items";

export type SideNavProps = {
  /** Full(lg) 상단에 상주하는 리그명. 계정이 리그에 1:1이라 항상 보이게 둡니다. */
  leagueName: string;
  active?: AdminNavKey;
  badges?: Partial<Record<AdminNavKey, number>>;
  className?: string;
};

/**
 * Figma `SideNav` — Size(Rail/Full) × Active. 어드민 `md`·`lg` 전 화면 (A-1 제외).
 * 하나의 컴포넌트가 `md`에서 레일 72(아이콘만), `lg`에서 풀 240(리그명 + 라벨 + pill)로 바뀝니다.
 * base(360)에서는 `hidden` — 그 자리는 `BottomNav role="admin"`입니다.
 */
export function SideNav({ leagueName, active: activeProp, badges, className }: SideNavProps) {
  const pathname = usePathname();
  const active = activeProp ?? resolveActiveKey(ADMIN_NAV_ITEMS, pathname);

  return (
    <nav
      aria-label="어드민 메뉴"
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col gap-xs border-r border-border-subtle bg-bg-subtle py-2xl",
        "md:flex md:w-(--size-sidenav-rail) md:items-center md:px-sm",
        "lg:w-(--size-sidenav-full) lg:items-stretch lg:px-md",
        className,
      )}
    >
      <div className="hidden w-full flex-col gap-2xs px-sm pb-lg lg:flex">
        <span className="truncate type-heading-sm text-text-default">{leagueName}</span>
        <span className="type-caption text-text-secondary">리그 어드민</span>
      </div>
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        const badge = badges?.[item.key];
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "relative flex items-center rounded-md transition-colors",
              "md:size-[56px] md:justify-center",
              "lg:h-(--size-control-md) lg:w-full lg:justify-start lg:gap-sm lg:px-sm",
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
            <span className="hidden type-label-md whitespace-nowrap lg:inline">{item.label}</span>
            <span className="hidden flex-1 lg:block" />
            {badge ? (
              <>
                {/* Rail: 아이콘 우상단 점 */}
                <span className="absolute top-[6px] left-[36px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bg-brand px-xs type-label-sm text-text-on-brand lg:hidden">
                  {badge}
                </span>
                {/* Full: 행 우측 끝 pill */}
                <span className="hidden lg:inline-flex">
                  <NavBadge value={badge} />
                </span>
              </>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
