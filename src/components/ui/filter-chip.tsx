import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

/**
 * Figma `FilterChip` — P-3 필터 바의 드롭다운형 칩 (`내 지역 ▾`).
 * 높이는 `size/touch-min` 44 고정. 선택 표시는 brand 테두리 2px(border 1 + ring 1).
 */
export function FilterChip({
  selected = false,
  type = "button",
  className,
  children,
  ...rest
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-(--size-touch-min) shrink-0 items-center justify-center gap-xs rounded-full border pl-lg pr-md type-label-md whitespace-nowrap transition-colors",
        selected
          ? "border-border-brand bg-bg-brand-subtle text-text-brand ring-1 ring-inset ring-border-brand"
          : "border-border-default bg-bg-default text-text-secondary hover:bg-bg-hover",
        "disabled:cursor-not-allowed disabled:border-border-default disabled:bg-bg-disabled disabled:text-text-disabled disabled:ring-0",
        className,
      )}
      {...rest}
    >
      {children}
      <Icon name="chevron-down" size="sm" />
    </button>
  );
}
