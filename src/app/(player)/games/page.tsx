/** P-3 경기 목록 — screen-design-player.md §P-3 */
import { MatchRow } from "@/components/data/match-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GameFilters } from "@/features/games/game-filters";
import { LogoHeader } from "@/features/shared/screen-header";
import { getServerNow } from "@/lib/data/clock";
import { capacityLabel, emptyChips, listGames } from "@/lib/data/games";
import { formatAmount, formatTime, toDateKey } from "@/lib/format";
import { routes } from "@/lib/routes";
import { first } from "@/lib/search-params";
import { REGIONS } from "@/lib/constants";
import { LEVEL_LABEL, LEVELS, type Level } from "@/lib/types";

const LEVEL_OPTIONS = LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] }));

export default async function GamesPage(props: PageProps<"/games">) {
  const sp = await props.searchParams;
  const today = toDateKey(new Date(await getServerNow()));
  const rawDate = first(sp.date);
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : today;
  const region = first(sp.region) || undefined;
  const rawLevel = first(sp.level);
  const level = LEVELS.includes(rawLevel as Level) ? (rawLevel as Level) : undefined;
  const hideClosed = first(sp.hideClosed) === "1";

  const games = await listGames({ date, region, level, hideClosed });

  return (
    <>
      <LogoHeader />
      <GameFilters
        regions={REGIONS}
        levels={LEVEL_OPTIONS}
        startDate={today}
        value={{ date, region, level, hideClosed }}
      />
      {games.length === 0 ? (
        <EmptyState
          title="조건에 맞는 경기가 없어요"
          description="날짜나 지역을 바꿔 보세요"
          action={
            <Button variant="secondary" size="medium" href="/games">
              필터 초기화
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col">
          {games.map((g) => (
            <MatchRow
              key={g.id}
              href={routes.game(g.id)}
              time={formatTime(g.startsAt)}
              venue={g.venue}
              capacity={capacityLabel(g)}
              price={`${formatAmount(g.minFee)}원부터`}
              meta={g.recommendedLevel ?? "급수 무관"}
              chips={emptyChips(g)}
              status={g.status}
            />
          ))}
        </div>
      )}
    </>
  );
}
