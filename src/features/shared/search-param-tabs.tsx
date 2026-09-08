"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedTab, SegmentedTabs } from "@/components/ui/segmented-tab";

export type SearchParamTabOption<V extends string> = { value: V; label: string };

export type SearchParamTabsProps<V extends string> = {
  /** 쿼리 키 (routing.md §3-7). 첫 옵션이 기본값이라 값이 기본이면 키를 지웁니다. */
  param: string;
  tabs: SearchParamTabOption<V>[];
  value: V;
  className?: string;
};

/** `SegmentedTab`을 URL `searchParams`에 묶습니다 — 새로고침·뒤로가기·공유가 공짜입니다. */
export function SearchParamTabs<V extends string>({ param, tabs, value, className }: SearchParamTabsProps<V>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const select = (next: V) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === tabs[0].value) params.delete(param);
    else params.set(param, next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <SegmentedTabs className={className}>
      {tabs.map((tab) => (
        <SegmentedTab key={tab.value} selected={tab.value === value} onClick={() => select(tab.value)}>
          {tab.label}
        </SegmentedTab>
      ))}
    </SegmentedTabs>
  );
}
