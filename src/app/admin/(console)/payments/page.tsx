/** A-6 입금 확인 ★ — screen-design-admin.md §A-6. 은행 앱과 번갈아 보며 대조하는 화면. */
import { Fragment } from "react";
import { PAYMENT_TABLE_COLUMNS, Table, TableCell, TablePrimaryCell, TableRow, TableStatusText } from "@/components/data/table";
import { PageHeader } from "@/components/navigation/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConsoleHeader } from "@/features/admin/console-header";
import { PaymentActions } from "@/features/admin/payment-actions";
import { PaymentCard, slotSummary } from "@/features/admin/payment-card";
import { PaymentFilters } from "@/features/admin/payment-filters";
import { SearchParamTabs } from "@/features/shared/search-param-tabs";
import { first, pickTab } from "@/lib/search-params";
import { listPaymentGames, listPayments, type PaymentTab } from "@/lib/data/admin";
import { getServerNow } from "@/lib/data/clock";
import { formatPrice, formatShortDate, formatShortDateTime, formatShortTimestamp } from "@/lib/format";
import { isPending } from "@/lib/reservation-status";
import type { AdminReservation } from "@/lib/types";

const TABS = [
  { value: "pending", label: "확인 대기" },
  { value: "done", label: "확인 완료" },
] as const satisfies { value: PaymentTab; label: string }[];


type Section = { key: string; title?: string; items: AdminReservation[] };

/** 확인 대기 = 입금 불필요(0원) → 입금했다고 알려온 건 → 아직 입금 전. 각 섹션 안은 신청 시각 오름차순 (§A-6). */
function group(tab: PaymentTab, items: AdminReservation[]): Section[] {
  if (tab === "done") return [{ key: "done", items }];
  return [
    { key: "zero", title: "입금 불필요", items: items.filter((r) => r.totalFee === 0) },
    { key: "submitted", title: "입금했다고 알려온 건", items: items.filter((r) => r.totalFee > 0 && r.status === "PAYMENT_SUBMITTED") },
    { key: "reserved", title: "아직 입금 전", items: items.filter((r) => r.totalFee > 0 && r.status === "RESERVED") },
  ];
}

export default async function PaymentsPage(props: PageProps<"/admin/payments">) {
  const sp = await props.searchParams;
  const tab = pickTab(sp.status, TABS.map((t) => t.value));
  const gameId = first(sp.gameId) || undefined;
  const q = first(sp.q) || undefined;
  // TODO: `nextCursor`로 「더 보기」 — 지금은 첫 페이지만 그립니다
  const [{ items: payments }, games, now] = await Promise.all([
    listPayments({ tab, gameId, q }),
    listPaymentGames(),
    getServerNow(),
  ]);
  const sections = group(tab, payments).filter((s) => s.items.length > 0);

  return (
    <>
      <ConsoleHeader>
        <PageHeader title="입금 확인" />
      </ConsoleHeader>
      <PaymentFilters
        games={games.map((g) => ({ id: g.id, label: `${formatShortDate(g.startsAt)} ${g.venue.split(" ")[0]}` }))}
        value={{ gameId, q }}
      />
      <SearchParamTabs param="status" tabs={[...TABS]} value={tab} className="lg:max-w-[280px]" />

      {sections.length === 0 ? (
        <EmptyState icon="banknote" title={tab === "pending" ? "확인할 입금이 없어요" : "처리한 건이 없어요"} />
      ) : (
        <>
          <div className="flex flex-col gap-2xl px-lg py-2xl lg:hidden">
            {sections.map((s) => (
              <section key={s.key} className="flex flex-col gap-md">
                {s.title ? (
                  <h2 className="flex items-center gap-sm type-heading-md text-text-default">
                    {s.title}
                    <span className="type-numeric-price text-text-secondary">{s.items.length}</span>
                  </h2>
                ) : null}
                {s.items.map((r) => (
                  <PaymentCard key={r.id} reservation={r} variant="payments" now={now} />
                ))}
              </section>
            ))}
          </div>

          <div className="hidden pt-lg lg:block">
            <Table columns={PAYMENT_TABLE_COLUMNS}>
              {sections.map((s) => (
                <Fragment key={s.key}>
                  {s.title ? (
                    <tr className="h-[40px] bg-bg-subtle">
                      <td colSpan={PAYMENT_TABLE_COLUMNS.length} className="px-lg type-label-md text-text-secondary">
                        {s.title} <span className="type-numeric-price text-text-default">{s.items.length}</span>
                      </td>
                    </tr>
                  ) : null}
                  {s.items.map((r) => {
                    const amount = r.totalFee;
                    const pending = isPending(r.status);
                    return (
                      <TableRow key={r.id}>
                        <TablePrimaryCell title={r.depositorName} sub={slotSummary(r.slots)} />
                        <TableCell align="right" className="type-numeric-price text-text-default">
                          {formatPrice(amount)}
                        </TableCell>
                        <TableCell className="type-body-sm text-text-secondary">{formatShortDateTime(r.game.startsAt)}</TableCell>
                        <TableCell className="type-body-sm text-text-secondary">{formatShortTimestamp(r.createdAt)}</TableCell>
                        <TableCell>
                          {amount === 0 && pending ? <TableStatusText>입금 불필요</TableStatusText> : <StatusBadge status={r.status} />}
                        </TableCell>
                        <TableCell align="right">
                          {pending ? (
                            <PaymentActions reservationId={r.id} depositorName={r.depositorName} amount={amount} rejectable={amount > 0} />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Fragment>
              ))}
            </Table>
          </div>
        </>
      )}
    </>
  );
}
