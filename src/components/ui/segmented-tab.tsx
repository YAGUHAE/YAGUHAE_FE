import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type SegmentedTabsProps = HTMLAttributes<HTMLDivElement>;

/** `SegmentedTab`을 가로로 FILL 배치하는 tablist 컨테이너. */
export function SegmentedTabs({ className, ...rest }: SegmentedTabsProps) {
  return <div role="tablist" className={cn("flex w-full", className)} {...rest} />;
}

export type SegmentedTabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

/**
 * Figma `SegmentedTab` — Selected(T/F). 선택 표시는 하단 2px 인디케이터.
 * P-7 내 예약(진행중/완료/종료·취소), P-4·P-5 선공/후공 탭.
 */
export function SegmentedTab({
  selected = false,
  type = "button",
  className,
  children,
  ...rest
}: SegmentedTabProps) {
  return (
    <button
      type={type}
      role="tab"
      aria-selected={selected}
      className={cn("flex flex-1 flex-col items-center", className)}
      {...rest}
    >
      <span
        className={cn(
          "flex h-(--size-control-md) items-center justify-center px-2xl type-label-md whitespace-nowrap",
          selected ? "text-text-default" : "text-text-tertiary",
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cn("h-[2px] w-full", selected ? "bg-bg-brand" : "bg-border-subtle")}
      />
    </button>
  );
}
