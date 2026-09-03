import type { ReactNode } from "react";

/** `AdminShell` 본문은 base에서 좌우 패딩이 없습니다(행 컴포넌트 풀블리드). `PageHeader`만 여기로 감쌉니다. */
export function ConsoleHeader({ children }: { children: ReactNode }) {
  return <div className="px-lg pt-lg md:px-0 md:pt-0">{children}</div>;
}
