/** `searchParams` 헬퍼 — 서버 페이지에서 씁니다 (routing.md §3-7). */

/** 배열로 오면 첫 값만 */
export function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** 잘못된 값이 오면 첫 옵션(기본값)으로 떨어뜨립니다 — 404를 내지 않습니다. */
export function pickTab<V extends string>(raw: string | string[] | undefined, values: readonly V[]): V {
  const v = first(raw);
  return (values as readonly string[]).includes(v ?? "") ? (v as V) : values[0];
}
