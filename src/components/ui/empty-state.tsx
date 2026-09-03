import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: IconName;
  title: string;
  description?: ReactNode;
  /** `<Button variant="secondary" size="medium">` — P-3 「필터 초기화」. P-11 알림 없음은 생략. */
  action?: ReactNode;
};

/** Figma `EmptyState` — 빈 목록 안내 (액션 표시 BOOLEAN). */
export function EmptyState({
  icon = "calendar",
  title,
  description,
  action,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-md px-2xl py-5xl text-center",
        className,
      )}
      {...rest}
    >
      <span className="flex size-[64px] items-center justify-center rounded-full bg-bg-muted">
        <Icon name={icon} className="size-[28px] text-icon-secondary" />
      </span>
      <p className="type-heading-sm text-text-default">{title}</p>
      {description ? <p className="type-body-md text-text-secondary">{description}</p> : null}
      {action}
    </div>
  );
}
