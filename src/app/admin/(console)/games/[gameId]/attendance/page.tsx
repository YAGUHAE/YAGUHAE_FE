/** A-7 출석 체크 — screen-design-admin.md §A-7 (v2.1 선공/후공 팀 탭) */
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/navigation/page-header";
import { AttendanceSheet } from "@/features/admin/attendance-sheet";
import { ConsoleHeader } from "@/features/admin/console-header";
import { getAdminGame } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";

export default async function AttendancePage(props: PageProps<"/admin/games/[gameId]/attendance">) {
  const { gameId } = await props.params;
  const game = await getAdminGame(gameId);
  if (!game) notFound();
  // 양 팀 모두 APPROVED 0명이면 A-5가 버튼을 비활성화합니다 — 직접 진입만 되돌립니다
  if (!game.slots.some((s) => s.participantName)) redirect(routes.adminGame(game.id));

  return (
    <>
      <ConsoleHeader>
        <PageHeader backHref={routes.adminGame(game.id)} title="출석 체크" meta={`${formatDateTime(game.startsAt)} · ${game.venue}`} />
      </ConsoleHeader>
      <p className="px-lg pb-lg type-body-md text-text-secondary lg:hidden">
        팀별 라인업 순서대로 나열했어요. 선공·후공 두 팀 모두 체크해야 제출할 수 있어요.
      </p>
      <AttendanceSheet game={game} backHref={routes.adminGame(game.id)} />
    </>
  );
}
