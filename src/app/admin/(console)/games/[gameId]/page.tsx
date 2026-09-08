/** A-5 경기 상세 (신청 현황) — screen-design-admin.md §A-5. 보드와 예약이 한 화면에 있는 것이 lg 레이아웃의 요점. */
import { notFound } from "next/navigation";
import { Split } from "@/components/layout/container";
import { PageHeader } from "@/components/navigation/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionBand } from "@/components/ui/section-band";
import { ConsoleHeader } from "@/features/admin/console-header";
import { PaymentCard } from "@/features/admin/payment-card";
import { PositionBoard } from "@/features/games/position-board";
import { SearchParamTabs } from "@/features/shared/search-param-tabs";
import { pickTab } from "@/lib/search-params";
import { getAdminGame, listGameReservations, type AdminReservationTab } from "@/lib/data/admin";
import { getServerNow } from "@/lib/data/clock";
import { capacityLabel, isAttendanceOpen } from "@/lib/data/games";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";

const TABS = [
  { value: "pending", label: "입금 대기" },
  { value: "approved", label: "확정" },
  { value: "rejected", label: "취소·거절" },
] as const satisfies { value: AdminReservationTab; label: string }[];

const EMPTY_TEXT: Record<AdminReservationTab, string> = {
  pending: "입금 대기 중인 신청이 없어요",
  approved: "확정된 신청이 없어요",
  rejected: "취소·거절된 신청이 없어요",
};

export default async function AdminGamePage(props: PageProps<"/admin/games/[gameId]">) {
  const [{ gameId }, sp] = await Promise.all([props.params, props.searchParams]);
  const game = await getAdminGame(gameId);
  if (!game) notFound();
  const tab = pickTab(sp.tab, TABS.map((t) => t.value));
  const [reservations, approved, now] = await Promise.all([
    listGameReservations(game.id, tab),
    listGameReservations(game.id, "approved"),
    getServerNow(),
  ]);
  const attendanceOpen = isAttendanceOpen(game, now);

  const attendance = attendanceOpen ? (
    <div className="flex flex-col gap-xs px-lg pb-2xl lg:px-0 lg:pb-0">
      {approved.length > 0 ? (
        <Button variant="secondary" fullWidth href={routes.adminGameAttendance(game.id)} className="lg:w-auto">
          출석 체크
        </Button>
      ) : (
        <>
          <Button variant="secondary" fullWidth disabled className="lg:w-auto">
            출석 체크
          </Button>
          <p className="type-caption text-text-tertiary">확정된 참가자가 없어요</p>
        </>
      )}
    </div>
  ) : null;

  return (
    <>
      <ConsoleHeader>
        <PageHeader
          backHref="/admin/games"
          title={game.venue}
          meta={`${formatDateTime(game.startsAt)} · ${capacityLabel(game)}`}
          actions={
            <Button variant="secondary" size="medium" href={routes.adminGameEdit(game.id)}>
              수정
            </Button>
          }
        />
      </ConsoleHeader>

      <Split variant="side" className="gap-0 lg:gap-3xl">
        <div className="flex flex-col lg:gap-2xl">
          <SectionBand className="lg:hidden" />
          <div className="px-lg py-2xl lg:px-0 lg:py-0">
            {/* 빈 슬롯은 어드민에서 탭 불가 — `비어 있음` + text/tertiary (design-system.md §6.1) */}
            <PositionBoard game={game} mode="admin" layout="responsive" title="포지션 보드" />
          </div>
          <div className="hidden lg:block">{attendance}</div>
        </div>

        <div className="flex flex-col">
          <SectionBand className="lg:hidden" />
          <h2 className="px-lg pt-2xl pb-md type-heading-md text-text-default lg:px-0 lg:pt-0">신청 현황</h2>
          <SearchParamTabs param="tab" tabs={[...TABS]} value={tab} />
          <div className="flex flex-col gap-md px-lg py-2xl lg:px-0">
            {reservations.length === 0 ? (
              <EmptyState icon="banknote" title={EMPTY_TEXT[tab]} />
            ) : (
              reservations.map((r) => <PaymentCard key={r.id} reservation={r} game={game} variant="game" now={now} />)
            )}
          </div>
          <div className="lg:hidden">{attendance}</div>
        </div>
      </Split>
    </>
  );
}
