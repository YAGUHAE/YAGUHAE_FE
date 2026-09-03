import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * 좌우 패딩 — base `spacing/lg` 16 · md `spacing/2xl` 24 · lg `spacing/3xl` 32 (responsive-design.md §2).
 * 행 컴포넌트(MatchRow 등)는 자체 패딩을 가지므로 이 안에 넣지 않고 풀블리드로 둡니다.
 */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full px-lg md:px-2xl lg:px-3xl", className)} {...rest} />;
}

export type SplitProps = HTMLAttributes<HTMLDivElement> & {
  /** `even` 1:1 (A-5 보드, A-7 출석) · `side` 5:3 (A-2 홈, A-4 등록, A-5 상세) · `info` 360:FILL (P-4·P-5 lg) */
  variant?: "even" | "side" | "info";
};

/** `lg` 전용 2열 분할. 그 아래에서는 세로로 쌓입니다. 비율은 이 세 가지뿐입니다 — 새 비율을 만들지 마세요. */
export function Split({ variant = "even", className, ...rest }: SplitProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3xl",
        variant === "even" && "lg:grid-cols-2",
        variant === "side" && "lg:grid-cols-[5fr_3fr]",
        variant === "info" && "lg:grid-cols-[360px_minmax(0,1fr)]",
        className,
      )}
      {...rest}
    />
  );
}
