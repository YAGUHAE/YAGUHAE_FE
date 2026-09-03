"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterChip } from "@/components/ui/filter-chip";
import { TextField } from "@/components/ui/text-field";

export type PaymentFiltersProps = {
  games: { id: string; label: string }[];
  value: { gameId?: string; q?: string };
};

/** A-6 필터 — 입금자명 검색 + 경기 칩. 기본은 전체 경기 합산 (§A-6). 값은 API 파라미터와 같은 이름으로 URL에 갑니다. */
export function PaymentFilters({ games, value }: PaymentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(value.q ?? "");

  const update = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-md px-lg pb-lg md:px-0">
      <form
        className="lg:max-w-[280px]"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q });
        }}
      >
        <TextField
          label="입금자명 검색"
          value={q}
          placeholder="김철수"
          enterKeyHint="search"
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => q !== (value.q ?? "") && update({ q })}
        />
      </form>
      <div className="flex gap-sm overflow-x-auto [scrollbar-width:none]">
        <FilterChip selected={!value.gameId} className="[&>svg]:hidden" onClick={() => update({ gameId: null })}>
          전체 경기
        </FilterChip>
        {games.map((g) => (
          <FilterChip
            key={g.id}
            selected={value.gameId === g.id}
            className="[&>svg]:hidden"
            onClick={() => update({ gameId: value.gameId === g.id ? null : g.id })}
          >
            {g.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
