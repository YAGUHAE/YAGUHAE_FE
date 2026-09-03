import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type RatingValue = 0 | 1 | 2 | 3 | 4 | 5;

export type RatingScaleProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  label: string;
  /** 0은 미선택 */
  value: RatingValue;
  onChange?: (value: RatingValue) => void;
  disabled?: boolean;
};

const POINTS = [1, 2, 3, 4, 5] as const;

/**
 * Figma `RatingScale` — Value(0~5). P-9 매너 / 실력-프로필 일치도 / 시간 준수.
 * `value` 이하의 점은 전부 채워집니다 (별점처럼).
 */
export function RatingScale({
  label,
  value,
  onChange,
  disabled = false,
  className,
  ...rest
}: RatingScaleProps) {
  return (
    <div className={cn("flex w-full flex-col gap-sm", className)} {...rest}>
      <span className="type-label-md text-text-secondary">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex w-full gap-sm">
        {POINTS.map((n) => {
          const filled = n <= value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              disabled={disabled}
              onClick={() => onChange?.(n)}
              className={cn(
                "flex h-(--size-control-md) min-w-0 flex-1 items-center justify-center rounded-md border type-label-md transition-colors",
                filled
                  ? "border-border-brand bg-bg-brand text-text-on-brand"
                  : "border-border-default bg-bg-default text-text-tertiary hover:bg-bg-hover",
                "disabled:cursor-not-allowed",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
