/** A-3 경기 목록 — screen-design-admin.md §A-3. base·md는 `MatchRow`, lg는 테이블 (responsive-design.md §6). */
import { Fragment } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { MatchRow } from "@/components/data/match-row";
import { Table, TableCell, TablePrimaryCell, TableStatusText, type TableColumn } from "@/components/data/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/navigation/page-header";
import { ConsoleHeader } from "@/features/admin/console-header";
import { LinkTableRow } from "@/features/admin/link-table-row";
import { SearchParamTabs } from "@/features/shared/search-param-tabs";
import { pickTab } from "@/lib/search-params";
import { listAdminGames, type AdminGameTab } from "@/lib/data/admin";
import { capacityLabel, emptyChips } from "@/lib/data/games";
import { formatAmount, formatDate, formatDateTime, formatTime } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { GameStatus } from "@/components/data/match-row";

const TABS = [
  { value: "open", label: "모집중" },
  { value: "upcoming", label: "예정" },
  { value: "ended", label: "종료" },
] as const satisfies { value: AdminGameTab; label: string }[];

const EMPTY_TEXT: Record<AdminGameTab, string> = {
  open: "모집중인 경기가 없어요",
  upcoming: "예정된 경기가 없어요",
  ended: "종료된 경기가 없어요",
};

const STATUS_TEXT: Record<GameStatus, string> = { OPEN: "모집중", CLOSED: "마감", CANCELLED: "취소" };

/** A-6과 열 폭을 공유합니다 — 그래야 `TableHeader`·`TableRow`가 재사용됩니다 (responsive-design.md §6 A-3). */
const GAME_TABLE_COLUMNS: TableColumn[] = [
  { key: "datetime", label: "일시", width: 260 },
  { key: "first", label: "선공", width: 100, align: "right" },
  { key: "second", label: "후공", width: 160, align: "right" },
  { key: "pending", label: "입금 대기", width: 100, align: "right" },
  { key: "status", label: "상태", width: 94 },
  { key: "tail", width: 170, align: "right" },
];

export default async function AdminGamesPage(props: PageProps<"/admin/games">) {
  const sp = await props.searchParams;
  const tab = pickTab(sp.status, TABS.map((t) => t.value));
  // 항목마다 입금 미처리 건수가 붙어 옵니다 (명세 §5)
  const games = await listAdminGames(tab);

  return (
    <>
      <ConsoleHeader>
        <PageHeader
          title="경기"
          actions={
            <Button size="medium" href="/admin/games/new">
              경기 등록
            </Button>
          }
        />
      </ConsoleHeader>
      <SearchParamTabs param="status" tabs={[...TABS]} value={tab} className="lg:max-w-[420px]" />

      {games.length === 0 ? (
        <EmptyState
          title={EMPTY_TEXT[tab]}
          action={
            <Button variant="secondary" size="medium" href="/admin/games/new">
              경기 등록
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col lg:hidden">
            {games.map((g) => (
              <Fragment key={g.id}>
                <MatchRow
                  href={routes.adminGame(g.id)}
                  time={formatTime(g.startsAt)}
                  venue={g.venue}
                  capacity={capacityLabel(g)}
                  price={`${formatAmount(g.minFee)}원부터`}
                  meta={formatDate(g.startsAt)}
                  chips={emptyChips(g)}
                  status={tab === "ended" ? "CLOSED" : g.status}
                />
                {g.pendingPayments ? (
                  <Link
                    href={`/admin/payments?gameId=${g.id}`}
                    className="flex items-center justify-between bg-bg-brand-subtle px-lg py-md type-label-md text-text-brand transition-colors hover:bg-bg-hover"
                  >
                    입금 확인 {g.pendingPayments}건
                    <Icon name="chevron-right" size="lg" className="text-icon-brand" />
                  </Link>
                ) : null}
              </Fragment>
            ))}
          </div>

          <div className="hidden pt-lg lg:block">
            <Table columns={GAME_TABLE_COLUMNS}>
              {games.map((g) => {
                const { FIRST: first, SECOND: second } = g.capacity;
                const pending = g.pendingPayments ?? 0;
                return (
                  <LinkTableRow key={g.id} href={routes.adminGame(g.id)}>
                    <TablePrimaryCell title={formatDateTime(g.startsAt)} sub={g.venue} />
                    <TableCell align="right" className="type-numeric-price text-text-default">
                      {first.filled}/{first.total}
                    </TableCell>
                    <TableCell align="right" className="type-numeric-price text-text-default">
                      {second.filled}/{second.total}
                    </TableCell>
                    <TableCell
                      align="right"
                      className={cn(pending > 0 ? "type-numeric-price text-text-brand" : "type-body-sm text-text-tertiary")}
                    >
                      {pending > 0 ? `${pending}건` : "–"}
                    </TableCell>
                    <TableCell>
                      <TableStatusText>{tab === "ended" ? "종료" : STATUS_TEXT[g.status]}</TableStatusText>
                    </TableCell>
                    <TableCell align="right">
                      <Icon name="chevron-right" size="lg" className="inline-block text-icon-secondary" />
                    </TableCell>
                  </LinkTableRow>
                );
              })}
            </Table>
          </div>
        </>
      )}
    </>
  );
}
