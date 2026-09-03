"use client";

import { SelectField, TextField } from "@/components/ui";
import type { AnyStory, Control } from "./stories";

export type ControlPanelProps = {
  story: AnyStory;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset: () => void;
};

/** 스토리의 `controls` 정의를 입력 UI로 그립니다. 입력 컴포넌트는 우리 것을 그대로 씁니다. */
export function ControlPanel({ story, values, onChange, onReset }: ControlPanelProps) {
  const entries = Object.entries(story.controls) as [string, Control][];
  if (entries.length === 0) {
    return <p className="type-body-sm text-text-tertiary">조작할 props가 없는 스토리입니다.</p>;
  }
  return (
    <div className="flex flex-col gap-lg">
      {entries.map(([key, control]) => {
        const label = control.label ?? key;
        const value = values[key];
        switch (control.type) {
          case "select":
            return (
              <SelectField
                key={key}
                label={label}
                value={String(value ?? "")}
                onChange={(e) => onChange(key, e.target.value)}
              >
                {control.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "" ? "(없음)" : opt}
                  </option>
                ))}
              </SelectField>
            );
          case "number":
            return (
              <TextField
                key={key}
                label={label}
                type="number"
                min={control.min}
                max={control.max}
                value={String(value ?? "")}
                onChange={(e) => onChange(key, e.target.value === "" ? 0 : Number(e.target.value))}
              />
            );
          case "boolean":
            return (
              <label key={key} className="flex h-(--size-touch-min) items-center gap-sm">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => onChange(key, e.target.checked)}
                  className="size-[18px] accent-(--color-bg-brand)"
                />
                <span className="type-label-md text-text-secondary">{label}</span>
              </label>
            );
          default:
            return (
              <TextField
                key={key}
                label={label}
                value={String(value ?? "")}
                onChange={(e) => onChange(key, e.target.value)}
              />
            );
        }
      })}
      <button
        type="button"
        onClick={onReset}
        className="self-start type-label-md text-text-secondary underline underline-offset-2 hover:text-text-default"
      >
        기본값으로 되돌리기
      </button>
    </div>
  );
}
