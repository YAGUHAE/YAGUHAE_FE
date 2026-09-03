import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Figma `SectionBand` — 섹션 사이를 헤어라인이 아니라 회색 띠(8px)로 끊습니다.
 * 정보 위계가 바뀌는 지점에만 쓰세요. 같은 위계 항목 사이에는 헤어라인.
 */
export function SectionBand({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="presentation"
      className={cn("h-(--spacing-sm) w-full shrink-0 bg-bg-subtle", className)}
      {...rest}
    />
  );
}
