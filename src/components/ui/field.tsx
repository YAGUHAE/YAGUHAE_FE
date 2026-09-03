import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FieldShellProps = {
  id: string;
  label: string;
  helper?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** TextField · SelectField가 공유하는 라벨 + 안내 문구 껍데기. */
export function FieldShell({
  id,
  label,
  helper,
  error,
  disabled,
  className,
  children,
}: FieldShellProps) {
  const message = error ?? helper;
  return (
    <div className={cn("flex w-full flex-col gap-sm", className)}>
      <label
        htmlFor={id}
        className={cn(
          "type-label-md",
          disabled ? "text-text-disabled" : "text-text-secondary",
        )}
      >
        {label}
      </label>
      {children}
      {message ? (
        <p
          id={`${id}-message`}
          className={cn(
            "type-caption",
            disabled
              ? "text-text-disabled"
              : error
                ? "text-text-danger"
                : "text-text-tertiary",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

/** 입력 박스 공통 클래스. focus/error는 border 1px + ring 1px = 2px로 폭 변화 없이 표현합니다. */
export function fieldBoxClass(opts: { error?: boolean; disabled?: boolean }) {
  return cn(
    "flex h-(--size-control-md) w-full items-center gap-sm rounded-md border px-lg",
    opts.disabled
      ? "border-border-default bg-bg-disabled"
      : opts.error
        ? "border-border-danger bg-bg-default ring-1 ring-inset ring-border-danger"
        : "border-border-default bg-bg-default focus-within:border-border-focus focus-within:ring-1 focus-within:ring-inset focus-within:ring-border-focus",
  );
}
