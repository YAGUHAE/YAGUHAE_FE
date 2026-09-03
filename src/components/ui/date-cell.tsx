import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const DAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"] as const;

export type DateCellProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  date: Date;
  selected?: boolean;
};

function dayClass(dow: number, selected: boolean) {
  if (selected) return { num: "text-text-on-brand", day: "text-text-on-brand" };
  if (dow === 6) return { num: "text-text-saturday", day: "text-text-saturday" };
  if (dow === 0) return { num: "text-text-sunday", day: "text-text-sunday" };
  return { num: "text-text-default", day: "text-text-tertiary" };
}

/**
 * Figma `DateCell` — 가로 날짜 피커의 셀 (44×52).
 * 토=파랑·일=빨강은 한국 달력 관례이고, Selected가 요일색을 덮습니다.
 */
export function DateCell({
  date,
  selected = false,
  type = "button",
  className,
  ...rest
}: DateCellProps) {
  const dow = date.getDay();
  const color = dayClass(dow, selected);
  return (
    <button
      type={type}
      aria-pressed={selected}
      aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일 ${DAY_LABEL[dow]}요일`}
      className={cn(
        "flex h-(--size-control-lg) w-(--size-touch-min) shrink-0 flex-col items-center justify-center gap-2xs rounded-full transition-colors",
        selected ? "bg-bg-brand" : "hover:bg-bg-hover",
        className,
      )}
      {...rest}
    >
      <span className={cn("type-numeric-price", color.num)}>{date.getDate()}</span>
      <span className={cn("type-label-sm", color.day)}>{DAY_LABEL[dow]}</span>
    </button>
  );
}
