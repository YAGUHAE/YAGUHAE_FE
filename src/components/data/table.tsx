import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type TableColumn = {
  key: string;
  label?: string;
  /** px. 기본 열 폭 260·100·160·100·94·170 (본문 976 기준, responsive-design.md §5) */
  width: number;
  align?: "left" | "right";
};

/** A-6 입금 확인 기본 열. A-3은 라벨만 바꿔 씁니다 (일시 · 선공 · 후공 · 입금 대기 · 상태 · ). */
export const PAYMENT_TABLE_COLUMNS: TableColumn[] = [
  { key: "name", label: "입금자명", width: 260 },
  { key: "amount", label: "금액", width: 100, align: "right" },
  { key: "game", label: "경기", width: 160 },
  { key: "submittedAt", label: "신청 시각", width: 100 },
  { key: "status", label: "상태", width: 94 },
  { key: "tail", width: 170, align: "right" },
];

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  columns: TableColumn[];
};

/**
 * Figma `TableHeader` + `TableRow`를 담는 콘솔 테이블. **lg 전용**입니다 —
 * base·md에서는 같은 데이터를 `MatchRow`·`ReservationRow`로 그리고 `lg:hidden` / `hidden lg:table`로 갈립니다.
 * 열 폭은 `<colgroup>`이 들고 있어 헤더와 행이 자동으로 맞습니다.
 */
export function Table({ columns, className, children, ...rest }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full table-fixed border-collapse", className)} {...rest}>
        <colgroup>
          {columns.map((col) => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="h-[40px] border-b border-border-strong">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-[6px] py-sm text-left type-label-sm font-medium text-text-secondary first:pl-lg last:pr-lg",
                  col.align === "right" && "text-right",
                )}
              >
                {col.label ?? <span className="sr-only">액션</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean;
};

/** Figma `TableRow` — State(Default/Hover/Selected). Hover는 `bg/hover`, Selected는 `bg/brand-subtle`. 높이 64. */
export function TableRow({ selected = false, className, onClick, ...rest }: TableRowProps) {
  return (
    <tr
      aria-selected={selected || undefined}
      onClick={onClick}
      className={cn(
        "h-[64px] border-b border-border-subtle transition-colors",
        selected ? "bg-bg-brand-subtle" : "bg-bg-default hover:bg-bg-hover",
        onClick && "cursor-pointer",
        className,
      )}
      {...rest}
    />
  );
}

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right";
};

export function TableCell({ align = "left", className, ...rest }: TableCellProps) {
  return (
    <td
      className={cn(
        "px-[6px] py-sm align-middle first:pl-lg last:pr-lg",
        align === "right" && "text-right",
        className,
      )}
      {...rest}
    />
  );
}

export type TableHeadCellProps = ThHTMLAttributes<HTMLTableCellElement>;

/** 첫 열(2행): 이름/일시 + 보조 문구. A-6은 입금자명 + 슬롯 요약, A-3은 일시 + 구장명. */
export function TablePrimaryCell({
  title,
  sub,
  className,
  ...rest
}: TableCellProps & { title: string; sub?: string }) {
  return (
    <TableCell className={className} {...rest}>
      <span className="flex flex-col gap-2xs">
        <span className="truncate type-heading-sm text-text-default">{title}</span>
        {sub ? <span className="truncate type-caption text-text-secondary">{sub}</span> : null}
      </span>
    </TableCell>
  );
}

/** 상태 칸의 평문 라벨 (경기 상태 모집중/마감/취소). 회색 면 위라 text/secondary. */
export function TableStatusText({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("type-label-sm text-text-secondary", className)} {...rest} />;
}
