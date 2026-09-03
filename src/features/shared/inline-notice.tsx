import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";

export type InlineNoticeTone = "warning" | "info" | "danger" | "success";

const TONE: Record<InlineNoticeTone, { icon: IconName; className: string }> = {
  warning: { icon: "alert-triangle", className: "bg-feedback-warning-bg text-feedback-warning-text" },
  info: { icon: "alert-triangle", className: "bg-feedback-info-bg text-feedback-info-text" },
  danger: { icon: "alert-triangle", className: "bg-feedback-danger-bg text-feedback-danger-text" },
  success: { icon: "check", className: "bg-feedback-success-bg text-feedback-success-text" },
};

/** 화면 안에 상주하는 안내 블록. `Toast`와 같은 색이지만 그림자 없이 흐름에 놓입니다 (P-5 · P-6 · A-7 · A-8). */
export function InlineNotice({
  tone = "warning",
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { tone?: InlineNoticeTone }) {
  const t = TONE[tone];
  return (
    <div
      className={cn("flex w-full items-start gap-sm rounded-md px-lg py-md type-body-md", t.className, className)}
      {...rest}
    >
      <Icon name={t.icon} size="md" className="mt-2xs shrink-0" />
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
