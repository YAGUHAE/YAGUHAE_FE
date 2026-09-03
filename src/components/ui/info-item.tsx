import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export type InfoItemProps = HTMLAttributes<HTMLDivElement> & {
  icon: IconName;
};

/**
 * Figma `InfoItem` — 아이콘 24 + 한 줄 라벨. P-4에서 2열 그리드로 깔아
 * 경기 조건(급수·소요시간·인원·구장 유형)을 훑게 만듭니다.
 */
export function InfoItem({ icon, className, children, ...rest }: InfoItemProps) {
  return (
    <div
      className={cn("flex items-center gap-sm type-body-md text-text-default", className)}
      {...rest}
    >
      <Icon name={icon} size="lg" className="text-icon-default" />
      <span className="whitespace-nowrap">{children}</span>
    </div>
  );
}
