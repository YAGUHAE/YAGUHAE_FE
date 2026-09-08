import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "large" | "medium";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-bg-brand text-text-on-brand hover:bg-bg-brand-hover active:bg-bg-brand-hover disabled:bg-bg-disabled disabled:text-text-disabled",
  secondary:
    "bg-bg-default text-text-default border border-border-strong hover:bg-bg-muted active:bg-bg-muted disabled:bg-bg-disabled disabled:border-border-default disabled:text-text-disabled",
  ghost:
    "bg-transparent text-text-brand hover:bg-bg-muted active:bg-bg-muted disabled:text-text-disabled disabled:hover:bg-transparent",
  danger:
    "bg-bg-danger text-text-on-danger hover:bg-bg-danger-hover active:bg-bg-danger-hover disabled:bg-bg-disabled disabled:text-text-disabled",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  large: "h-(--size-control-lg) px-2xl type-label-lg",
  medium: "h-(--size-control-md) px-lg type-label-md",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 라벨 왼쪽 아이콘. Large 24 · Medium 20 */
  icon?: IconName;
  /** 부모 폭을 채웁니다 (화면 하단 CTA, Dialog 액션). */
  fullWidth?: boolean;
  /** 있으면 같은 모양의 `<Link>`로 그립니다 — 버튼처럼 보이는 내비게이션 (P-4 신청하기, A-3 경기 등록). */
  href?: string;
};

/**
 * Figma `Button` — Variant(Primary/Secondary/Ghost/Danger) × Size(Large/Medium) × State.
 * Pressed는 `:active`/`:hover`, Disabled는 `disabled` 속성으로 표현합니다.
 * `Size=Small`은 의도적으로 없습니다 (design-system.md §6.2).
 */
export function Button({
  variant = "primary",
  size = "large",
  icon,
  fullWidth = false,
  href,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const rootClass = cn(
    "inline-flex items-center justify-center gap-sm rounded-md whitespace-nowrap transition-colors disabled:cursor-not-allowed",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth && "w-full",
    className,
  );
  const content = (
    <>
      {icon ? <Icon name={icon} size={size === "large" ? "lg" : "md"} /> : null}
      {children}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={rootClass}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={rootClass} {...rest}>
      {content}
    </button>
  );
}
