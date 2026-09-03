"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateCell } from "@/components/ui/date-cell";
import { FilterChip } from "@/components/ui/filter-chip";
import { toDateKey } from "@/lib/format";

export type GameFiltersProps = {
  regions: string[];
  levels: string[];
  value: { date: string; region?: string; level?: string; hideClosed: boolean };
  /** 스트립의 첫 날 (`YYYY-MM-DD`). 서버에서 계산해 넘겨 하이드레이션이 어긋나지 않게 합니다. */
  startDate: string;
};

/** P-3 필터 바 — 날짜 스트립 7칸 + 지역·급수 드롭다운 칩 + 마감 가리기. 전부 `searchParams`로 갑니다 (routing.md §3-7). */
export function GameFilters({ regions, levels, value, startDate }: GameFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${startDate}T00:00:00+09:00`);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex w-full flex-col gap-md pb-md">
      <div className="flex justify-between gap-xs overflow-x-auto px-lg [scrollbar-width:none]">
        {days.map((d) => {
          const key = toDateKey(d);
          return (
            <DateCell key={key} date={d} selected={key === value.date} onClick={() => update({ date: key })} />
          );
        })}
      </div>
      <div className="flex gap-sm overflow-x-auto px-lg [scrollbar-width:none]">
        <ChipSelect
          label={value.region ?? "내 지역"}
          selected={Boolean(value.region)}
          value={value.region ?? ""}
          options={regions}
          placeholder="전체 지역"
          onChange={(v) => update({ region: v })}
        />
        <ChipSelect
          label={value.level ?? "급수"}
          selected={Boolean(value.level)}
          value={value.level ?? ""}
          options={levels}
          placeholder="전체 급수"
          onChange={(v) => update({ level: v })}
        />
        <FilterChip
          selected={value.hideClosed}
          className="[&>svg]:hidden"
          onClick={() => update({ hideClosed: value.hideClosed ? null : "1" })}
        >
          마감 가리기
        </FilterChip>
      </div>
    </div>
  );
}

/**
 * 드롭다운형 칩. 칩 위에 투명한 네이티브 `<select>`를 얹어 OS 피커를 그대로 씁니다 —
 * `SelectField`가 커스텀 리스트박스를 만들지 않은 것과 같은 이유입니다.
 */
function ChipSelect({
  label,
  selected,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  selected: boolean;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <span className="relative shrink-0">
      <FilterChip selected={selected} tabIndex={-1} aria-hidden>
        {label}
      </FilterChip>
      <select
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </span>
  );
}
