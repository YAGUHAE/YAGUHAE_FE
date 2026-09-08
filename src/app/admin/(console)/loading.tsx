export default function ConsoleLoading() {
  return (
    <div className="flex flex-col gap-md px-lg pt-lg md:px-0 md:pt-0" aria-busy aria-label="불러오는 중">
      <div className="h-[30px] w-[140px] animate-pulse rounded-sm bg-bg-muted" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-[88px] w-full animate-pulse rounded-lg bg-bg-subtle" />
      ))}
    </div>
  );
}
