/** A-2 홈 (대시보드) — screen-design-admin.md §A-2. `/admin` 자체가 홈입니다 (routing.md §6). */
import Link from "next/link";
import { cn } from "@/lib/cn";
import { AdminRow } from "@/components/data/admin-row";
import { StatTile } from "@/components/data/stat-tile";
import { Split } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { SectionBand } from "@/components/ui/section-band";
import { TextLink } from "@/components/ui/text-link";
import { PageHeader } from "@/components/navigation/page-header";
import { ConsoleHeader } from "@/features/admin/console-header";
import { reservationAmount } from "@/features/admin/payment-card";
import { countPendingByGame, getDashboard, getLeague } from "@/lib/data/admin";
import { getServerNow } from "@/lib/data/clock";
import { capacityLabel } from "@/lib/data/games";
import { formatDateTime, formatFullDate, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";

function PendingRow({ label, value, unit, href }: { label: string; value: number; unit: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md bg-bg-subtle px-lg py-lg transition-colors hover:bg-bg-hover"
    >
      <span className="type-body-lg text-text-default">{label}</span>
      <span className="flex items-center gap-xs">
        {/* 0건도 숨기지 않습니다 — "할 일이 없는 것"과 "기능이 없는 것"이 구분돼야 합니다 (§A-2) */}
        <span className={cn("type-numeric-countdown", value > 0 ? "text-text-brand" : "text-text-default")}>{value}</span>
        <span className="type-body-md text-text-secondary">{unit}</span>
        <Icon name="chevron-right" size="lg" className="text-icon-default" />
      </span>
    </Link>
  );
}

export default async function AdminHomePage() {
  const [league, dashboard, now] = await Promise.all([getLeague(), getDashboard(), getServerNow()]);
  const pendingByGame = await Promise.all(dashboard.upcoming.map((g) => countPendingByGame(g.id)));
  const today = formatFullDate(new Date(now).toISOString());

  return (
    <>
      <ConsoleHeader>
        <PageHeader title={league.name} meta={today} className="lg:hidden" />
        <PageHeader title="홈" meta={`${league.name} · ${today}`} className="hidden lg:flex" />
      </ConsoleHeader>

      {dashboard.totalGames === 0 ? (
        <EmptyState
          title="등록된 경기가 없어요"
          description="첫 경기를 올리면 여기에 할 일이 보여요"
          action={<Button href="/admin/games/new">경기 등록하기</Button>}
        />
      ) : (
        <>
          <section className="flex flex-col gap-md px-lg pb-2xl lg:hidden">
            <h2 className="type-heading-md text-text-default">처리 대기</h2>
            <PendingRow label="입금 확인 대기" value={dashboard.pendingPayments} unit="건" href="/admin/payments" />
            <PendingRow label="오늘 · 내일 경기" value={dashboard.todayTomorrow} unit="개" href="/admin/games" />
          </section>
          <div className="hidden gap-lg pb-3xl lg:grid lg:grid-cols-3">
            <StatTile label="입금 확인 대기" value={dashboard.pendingPayments} href="/admin/payments" />
            <StatTile label="오늘·내일 경기" value={dashboard.todayTomorrow} unit="개" href="/admin/games" />
            <StatTile label="모집중 경기" value={dashboard.openGames} unit="개" href="/admin/games" />
          </div>
          <SectionBand className="lg:hidden" />

          <Split variant="side" className="gap-0 lg:gap-3xl">
            <section className="flex flex-col">
              <h2 className="px-lg pt-2xl pb-md type-heading-md text-text-default lg:px-0 lg:pt-0">다가오는 경기</h2>
              {dashboard.upcoming.map((g, i) => (
                <AdminRow
                  key={g.id}
                  href={routes.adminGame(g.id)}
                  title={formatDateTime(g.startsAt)}
                  badge={pendingByGame[i] > 0 ? `입금 ${pendingByGame[i]}건` : undefined}
                  description={g.venue}
                  meta={capacityLabel(g)}
                />
              ))}
            </section>
            {/* 우측 열은 데스크톱 전용 — "오늘 할 일"의 실물 (responsive-design.md §6 A-2) */}
            <section className="hidden flex-col gap-md lg:flex">
              <h2 className="type-heading-md text-text-default">확인 대기 건</h2>
              {dashboard.pendingPreview.length === 0 ? (
                <p className="type-body-md text-text-secondary">확인할 입금이 없어요</p>
              ) : (
                <div className="rounded-lg border border-border-default">
                  {dashboard.pendingPreview.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border-b border-border-subtle px-lg py-md last:border-b-0"
                    >
                      <span className="type-heading-sm text-text-default">{r.depositorName}</span>
                      <span className="type-numeric-price text-text-default">{formatPrice(reservationAmount(r))}</span>
                    </div>
                  ))}
                </div>
              )}
              <TextLink href="/admin/payments" className="self-start text-text-brand">
                전체 보기
              </TextLink>
            </section>
          </Split>
        </>
      )}
    </>
  );
}
