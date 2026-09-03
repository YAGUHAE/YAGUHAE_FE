import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { FieldShell, fieldBoxClass } from "./field";
import { Icon } from "./icon";

export type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id" | "className"
> & {
  label: string;
  helper?: ReactNode;
  error?: ReactNode;
  /** 값이 비었을 때 보이는 문구. 선택 불가한 첫 option으로 들어갑니다. */
  placeholder?: string;
  id?: string;
  className?: string;
  /** `<option>` 목록 */
  children: ReactNode;
};

/**
 * Figma `SelectField` — 네이티브 `<select>`에 chevron-down 20을 얹은 드롭다운.
 * 모바일 OS 피커를 그대로 쓰기 위해 커스텀 리스트박스를 만들지 않았습니다.
 */
export function SelectField({
  label,
  helper,
  error,
  placeholder,
  id: idProp,
  disabled,
  className,
  children,
  value,
  defaultValue,
  ...rest
}: SelectFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hasMessage = Boolean(error ?? helper);
  const isEmpty = (value ?? defaultValue ?? "") === "";
  return (
    <FieldShell
      id={id}
      label={label}
      helper={helper}
      error={error}
      disabled={disabled}
      className={className}
    >
      <div className={cn(fieldBoxClass({ error: Boolean(error), disabled }), "relative")}>
        <select
          id={id}
          disabled={disabled}
          value={value}
          defaultValue={placeholder && value === undefined && defaultValue === undefined ? "" : defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? `${id}-message` : undefined}
          className={cn(
            "min-w-0 flex-1 appearance-none bg-transparent pr-2xl type-body-lg outline-none",
            disabled
              ? "text-text-disabled"
              : isEmpty && placeholder
                ? "text-text-tertiary"
                : "text-text-default",
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        <Icon
          name="chevron-down"
          size="md"
          className={cn(
            "pointer-events-none absolute right-lg",
            disabled ? "text-icon-disabled" : "text-icon-default",
          )}
        />
      </div>
    </FieldShell>
  );
}
