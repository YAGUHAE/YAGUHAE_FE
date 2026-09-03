/** 용병 화면 공통 스켈레톤 — 행 4개. 데이터 계층이 붙으면 화면별로 나눕니다. */
export default function PlayerLoading() {
  return (
    <div className="flex flex-col gap-md p-lg" aria-busy aria-label="불러오는 중">
      <div className="h-[28px] w-[160px] animate-pulse rounded-sm bg-bg-muted" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-[96px] w-full animate-pulse rounded-md bg-bg-subtle" />
      ))}
    </div>
  );
}
