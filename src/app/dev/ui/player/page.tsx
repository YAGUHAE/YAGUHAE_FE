import { Container, Split } from "@/components/layout/container";
import { PlayerShell } from "@/components/layout/player-shell";
import { MatchRow } from "@/components/data/match-row";
import { PositionSlot } from "@/components/data/position-slot";
import { Button } from "@/components/ui/button";
import { SectionBand } from "@/components/ui/section-band";

/** 용병 셸 확인용 — base BottomNav · md 640 중앙 · lg TopNav + P-4형 split. */
export default function PlayerShellDemoPage() {
  return (
    <PlayerShell active="games" unreadCount={2} width="wide">
      <Container className="py-lg">
        <h1 className="type-heading-lg text-text-default">경기 목록</h1>
      </Container>
      {Array.from({ length: 4 }, (_, i) => (
        <MatchRow
          key={i}
          href="/dev/ui/player"
          time={`${18 + i}:00`}
          venue="상암 유소년 야구장"
          capacity="선공 4/11 · 후공 6/11"
          price="13,000원부터"
          meta="3~5급"
          chips={i === 0 ? ["포수 모집"] : undefined}
          status={i === 3 ? "CLOSED" : "OPEN"}
        />
      ))}
      <SectionBand />
      <Container className="py-2xl">
        <Split variant="info">
          <div className="flex flex-col gap-lg">
            <h2 className="type-heading-md text-text-default">경기 정보</h2>
            <p className="type-body-md text-text-secondary">
              lg에서는 좌측 360 정보 열 + 우측 보드 열로 갈립니다.
            </p>
            <Button fullWidth>신청하기</Button>
          </div>
          <Split variant="even" className="gap-3xl">
            {["선공 (3루 덕아웃) · 1/3", "후공 (1루 덕아웃) · 0/3"].map((team) => (
              <div key={team} className="flex flex-col">
                <span className="pb-sm type-label-md text-text-secondary">{team}</span>
                <PositionSlot index={1} position="선발" state="filled" participant="김도현" />
                <PositionSlot index={2} position="구원" state="empty" />
                <PositionSlot index={3} position="포수" state="empty" />
              </div>
            ))}
          </Split>
        </Split>
      </Container>
    </PlayerShell>
  );
}
