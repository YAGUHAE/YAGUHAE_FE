/** P-4 경기 상세 — screen-design-player.md §P-4 */
import { notFound } from "next/navigation";
import { Split } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { InfoItem } from "@/components/ui/info-item";
import { SectionBand } from "@/components/ui/section-band";
import { TextLink } from "@/components/ui/text-link";
import { FeeSummary } from "@/features/games/fee-summary";
import { GameBoard } from "@/features/games/game-board";
import { CopyLink } from "@/features/shared/copy-link";
import { ScreenHeader } from "@/features/shared/screen-header";
import { emptySlots, getGame, hasMyReservation, teamSlots } from "@/lib/data/games";
import { getProfile } from "@/lib/data/reservations";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";

export default async function GamePage(props: PageProps<"/games/[gameId]">) {
  const { gameId } = await props.params;
  const game = await getGame(gameId);
  if (!game) notFound();
  const profile = await getProfile();
  const empties = emptySlots(game).length;

  // 신청 버튼 분기 — 여러 조건이 겹치면 위쪽 사유 하나만 (§P-4)
  const cta =
    game.status !== "OPEN"
      ? { label: "마감된 경기입니다", disabled: true }
      : profile.isSuspended
        ? { label: "신청할 수 없어요", disabled: true, note: "노쇼 누적으로 신청이 제한되었습니다", contact: true }
        : hasMyReservation(game)
          ? { label: "이미 신청한 경기예요", disabled: true, note: "진행 상태는 내 예약에서 확인할 수 있어요" }
          : empties === 0
            ? { label: "모든 포지션이 마감됐어요", disabled: true }
            : { label: "신청하기", disabled: false, href: routes.gameReserve(game.id) };

  const statusPill =
    game.status === "OPEN"
      ? { label: `모집중 · ${empties}자리 남음`, className: "bg-bg-brand-subtle text-text-brand" }
      : game.status === "CLOSED"
        ? { label: "마감", className: "bg-bg-muted text-text-secondary" }
        : { label: "취소된 경기", className: "bg-feedback-danger-bg text-feedback-danger-text" };

  return (
    <div data-shell-width="wide" className="flex flex-col">
      <ScreenHeader title="" backHref="/games" className="border-b-0" />
      <div className="lg:px-3xl lg:pb-2xl">
        <Split variant="info">
          <div className="flex flex-col">
            <section className="flex flex-col gap-sm px-lg pb-2xl">
              <span className="type-body-md text-text-secondary">{formatDateTime(game.startsAt)}</span>
              <h2 className="type-heading-lg text-text-default">{game.venue}</h2>
              <p className="flex flex-wrap items-center gap-x-md type-body-md text-text-secondary">
                <span>{game.address}</span>
                <CopyLink text={game.address}>주소 복사</CopyLink>
                <TextLink href={`https://map.naver.com/v5/search/${encodeURIComponent(game.venue)}`}>지도 보기</TextLink>
              </p>
              <span className={`self-start rounded-sm px-sm py-2xs type-label-sm ${statusPill.className}`}>
                {statusPill.label}
              </span>
            </section>
            <SectionBand />
            <section className="flex flex-col gap-sm px-lg py-2xl">
              <h2 className="type-heading-md text-text-default">포지션별 참가비</h2>
              <FeeSummary fees={game.fees} />
              <p className="type-caption text-text-tertiary">단위: 원 · 포수는 참가비를 받지 않습니다</p>
            </section>
            <SectionBand />
            <section className="flex flex-col gap-md px-lg py-2xl">
              <h2 className="type-heading-md text-text-default">경기 정보</h2>
              <div className="grid grid-cols-2 gap-md">
                <InfoItem icon="clock">{game.durationHours}시간 경기</InfoItem>
                <InfoItem icon="users">팀당 {teamSlots(game, "FIRST").length}자리</InfoItem>
                <InfoItem icon="calendar">{game.recommendedLevel ? `권장 ${game.recommendedLevel}` : "급수 무관"}</InfoItem>
                <InfoItem icon="user">{game.leagueName}</InfoItem>
              </div>
              {game.notice ? <p className="type-body-md text-text-secondary">{game.notice}</p> : null}
            </section>
            <SectionBand />
            <div className="px-lg py-2xl lg:hidden">
              <GameBoard gameId={game.id} game={game} canReserve={!cta.disabled} layout="tabs" title="포지션 보드" />
            </div>
            <SectionBand className="lg:hidden" />
            <div className="flex flex-col gap-sm px-lg py-2xl">
              {"note" in cta && cta.note ? (
                <p className="type-body-sm text-text-secondary">
                  {cta.note}
                  {"contact" in cta && cta.contact ? (
                    <>
                      {" "}
                      <TextLink href="/my">문의하기</TextLink>
                    </>
                  ) : null}
                </p>
              ) : null}
              {cta.disabled ? (
                <Button fullWidth disabled>
                  {cta.label}
                </Button>
              ) : (
                <Button fullWidth href={cta.href}>
                  {cta.label}
                </Button>
              )}
            </div>
          </div>
          <div className="hidden lg:block">
            <GameBoard gameId={game.id} game={game} canReserve={!cta.disabled} layout="split" title="포지션 보드" />
          </div>
        </Split>
      </div>
    </div>
  );
}
