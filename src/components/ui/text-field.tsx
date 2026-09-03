import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldShell, fieldBoxClass } from "./field";

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "className"
> & {
  label: string;
  /** 평상시 안내 문구. `error`가 있으면 대신 에러 문구가 보입니다. */
  helper?: ReactNode;
  /** 인라인 검증 메시지. 값이 있으면 Error 상태가 됩니다. */
  error?: ReactNode;
  id?: string;
  className?: string;
};

/**
 * Figma `TextField` — State(Default/Focus/Error/Disabled).
 * 단일 행 입력. Focus는 `:focus-within`, Error는 `error` prop으로 갈립니다.
 */
export function TextField({
  label,
  helper,
  error,
  id: idProp,
  disabled,
  className,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hasMessage = Boolean(error ?? helper);
  return (
    <FieldShell
      id={id}
      label={label}
      helper={helper}
      error={error}
      disabled={disabled}
      className={className}
    >
      <div className={fieldBoxClass({ error: Boolean(error), disabled })}>
        <input
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? `${id}-message` : undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent type-body-lg outline-none placeholder:text-text-tertiary",
            disabled ? "text-text-disabled" : "text-text-default",
          )}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}
