import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export type ToastType = "success" | "warning" | "danger" | "info";

const TONE: Record<ToastType, { icon: IconName; className: string }> = {
  success: { icon: "check", className: "bg-feedback-success-bg text-feedback-success-text" },
  warning: {
    icon: "alert-triangle",
    className: "bg-feedback-warning-bg text-feedback-warning-text",
  },
  danger: { icon: "alert-triangle", className: "bg-feedback-danger-bg text-feedback-danger-text" },
  info: { icon: "clock", className: "bg-feedback-info-bg text-feedback-info-text" },
};

export type ToastProps = HTMLAttributes<HTMLDivElement> & {
  type?: ToastType;
};

/**
 * Figma `Toast` — Type(Success/Warning/Danger/Info). 시각 요소만 담당합니다.
 * 표시/자동 닫힘은 화면 쪽에서 (P-1 로그인 실패, P-9 최대 2명, P-6 만료 임박).
 */
export function Toast({ type = "success", className, children, ...rest }: ToastProps) {
  const tone = TONE[type];
  return (
    <div
      role={type === "danger" ? "alert" : "status"}
      className={cn(
        "flex w-full items-center gap-sm rounded-md px-lg py-md shadow-card type-body-md",
        tone.className,
        className,
      )}
      {...rest}
    >
      <Icon name={tone.icon} size="md" />
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
