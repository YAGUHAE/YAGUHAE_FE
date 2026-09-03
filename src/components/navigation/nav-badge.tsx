import { cn } from "@/lib/cn";

export type NavBadgeProps = {
  value: number | string;
  className?: string;
};

/** 미처리 건수 pill — `bg/brand` + `text/on-brand`, `Label/Small`, radius/full. SideNav · TopNav 공용. */
export function NavBadge({ value, className }: NavBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-bg-brand px-[6px] type-label-sm text-text-on-brand",
        className,
      )}
    >
      {value}
    </span>
  );
}
