import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type RosterStripProps = HTMLAttributes<HTMLDivElement> & {
  /** 채워진 칸 수 */
  filled: number;
  /** 전체 칸 수. 기본 10 (P-1 히어로 그래픽) */
  total?: number;
};

/**
 * Figma `RosterStrip` — 라인업 카드의 타순 칸에서 가져온 정원 표시. P-1 히어로 전용 그래픽입니다.
 * P-4·P-5는 보드 자체가 정원 시각화라 여기서는 쓰지 않습니다.
 */
export function RosterStrip({ filled, total = 10, className, ...rest }: RosterStripProps) {
  return (
    <div
      role="img"
      aria-label={`${total}자리 중 ${filled}자리 예약됨`}
      className={cn("flex gap-2xs", className)}
      {...rest}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="h-[8px] w-[20px] overflow-hidden rounded-sm bg-bg-muted">
          {i < filled ? <span className="block h-full w-full bg-bg-brand" /> : null}
        </span>
      ))}
    </div>
  );
}
