"use client";

import { useRouter } from "next/navigation";
import { TableRow, type TableRowProps } from "@/components/data/table";

/** 행 전체가 링크인 `TableRow` — `MatchRow`와 같은 계약 (responsive-design.md §6 A-3). */
export function LinkTableRow({ href, ...rest }: TableRowProps & { href: string }) {
  const router = useRouter();
  return (
    <TableRow
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      {...rest}
    />
  );
}
