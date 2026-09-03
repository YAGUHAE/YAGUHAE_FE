import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export type PositionSlotState = "empty" | "selected" | "filled";

export type PositionSlotProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "value"
> & {
  /** 타순 번호 1~11 */
  index: number;
  /** `선발` · `포수` … */
  position: string;
  state: PositionSlotState;
  /** Filled일 때 참가자 이름 */
  participant?: string;
  /** 내 예약에 속한 슬롯 표시 (대리 신청분 포함) */
  mine?: boolean;
  mineLabel?: string;
  /**
   * Empty 문구의 톤. `brand`(기본)는 「신청 가능」 + chevron으로 진입점을 광고합니다.
   * 어드민(A-5)처럼 탭할 수 없는 보드는 `muted`로 두면 text/tertiary · chevron 없음이 됩니다.
   */
  emptyTone?: "brand" | "muted";
  emptyLabel?: string;
  selectedLabel?: string;
};

/**
 * Figma `PositionSlot` — 포지션 보드의 한 행 (State Empty/Selected/Filled × 내 신청 표시).
 * Selected는 라디오가 아니라 체크박스입니다 — 여러 행을 동시에 Selected로 둘 수 있습니다.
 * `onClick`이 있으면 `<button>`, 없으면 `<div>`로 그립니다.
 */
export function PositionSlot({
  index,
  position,
  state,
  participant,
  mine = false,
  mineLabel = "내 신청",
  emptyTone = "brand",
  emptyLabel = "신청 가능",
  selectedLabel = "선택함",
  onClick,
  className,
  disabled,
  ...rest
}: PositionSlotProps) {
  const isFilled = state === "filled";
  const isSelected = state === "selected";
  const showChevron = state === "empty" && emptyTone === "brand";

  const rootClass = cn(
    "flex h-[48px] w-full items-center gap-sm px-md text-left",
    isSelected
      ? "rounded-sm bg-bg-brand-subtle ring-2 ring-inset ring-border-brand"
      : isFilled
        ? "border-b border-border-subtle bg-bg-subtle"
        : "border-b border-border-subtle bg-bg-default",
    onClick && !disabled && "transition-colors hover:bg-bg-hover",
    className,
  );

  const content = (
    <>
      <span className="w-[18px] shrink-0 text-right type-label-sm text-text-tertiary">
        {index}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate type-body-lg",
          isFilled ? "text-text-secondary" : "text-text-default",
        )}
      >
        {position}
      </span>
      {mine ? (
        <span className="shrink-0 rounded-full bg-bg-brand px-[6px] py-2xs type-label-sm text-text-on-brand">
          {mineLabel}
        </span>
      ) : null}
      {isFilled ? (
        <span className="shrink-0 text-right type-body-lg text-text-secondary">{participant}</span>
      ) : (
        <span
          className={cn(
            "shrink-0 text-right type-label-md",
            isSelected || emptyTone === "brand" ? "text-text-brand" : "text-text-tertiary",
          )}
        >
          {isSelected ? selectedLabel : emptyLabel}
        </span>
      )}
      {isSelected ? <Icon name="check" size="md" className="text-icon-brand" /> : null}
      {showChevron ? <Icon name="chevron-right" size="md" className="text-icon-brand" /> : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={isSelected}
        className={cn(rootClass, "disabled:cursor-not-allowed")}
        {...rest}
      >
        {content}
      </button>
    );
  }
  return <div className={rootClass}>{content}</div>;
}
