/** P-7 내 예약 목록 — screen-design-player.md §P-7 */
import Link from "next/link";
import { ReservationRow } from "@/components/data/reservation-row";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/features/shared/screen-header";
import { SearchParamTabs } from "@/features/shared/search-param-tabs";
import { pickTab } from "@/lib/search-params";
import { listMyReservations, type ReservationTab } from "@/lib/data/reservations";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";

const TABS = [
  { value: "ongoing", label: "진행중" },
  { value: "done", label: "완료" },
  { value: "closed", label: "종료·취소" },
] as const satisfies { value: ReservationTab; label: string }[];

const EMPTY_TEXT: Record<ReservationTab, string> = {
  ongoing: "아직 진행중인 예약이 없어요",
  done: "참가 완료한 경기가 없어요",
  closed: "종료되거나 취소된 예약이 없어요",
};

const PILL_CLASS =
  "inline-flex h-(--size-control-sm) items-center justify-center rounded-full border border-border-brand bg-bg-brand-subtle px-md type-label-md text-text-brand whitespace-nowrap transition-colors hover:bg-bg-brand-hover hover:text-text-on-brand";

export default async function ReservationsPage(props: PageProps<"/reservations">) {
  const sp = await props.searchParams;
  const tab = pickTab(sp.tab, TABS.map((t) => t.value));
  // 카드에 필요한 경기 정보는 예약에 조인돼 옵니다 — 카드마다 경기를 따로 조회하지 않습니다 (명세 §6)
  const reservations = await listMyReservations(tab);

  return (
    <>
      <ScreenHeader title="내 예약" />
      <SearchParamTabs param="tab" tabs={[...TABS]} value={tab} />
      {reservations.length === 0 ? (
        <EmptyState icon="check" title={EMPTY_TEXT[tab]} />
      ) : (
        <div className="flex flex-col">
          {reservations.map((r) => {
            // RESERVED는 P-6로 바로, 나머지는 P-8 (§P-7)
            const href = r.status === "RESERVED" ? routes.reservationPayment(r.id) : routes.reservation(r.id);
            const action =
              r.status === "RESERVED" ? (
                <Link href={href} className={PILL_CLASS}>
                  입금하기
                </Link>
              ) : r.status === "ATTENDED" && !r.reviewed ? (
                <Link href={routes.reservationReview(r.id)} className={PILL_CLASS}>
                  평가하기
                </Link>
              ) : undefined;
            return (
              <ReservationRow
                key={r.id}
                href={href}
                venue={r.game.venue}
                datetime={formatDateTime(r.game.startsAt)}
                status={r.status}
                action={action}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
