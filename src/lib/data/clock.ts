/**
 * 서버 시각. 컴포넌트 렌더 중 `Date.now()`를 직접 부르면 React 순수성 규칙에 걸리므로
 * 데이터 계층의 "요청 1건"으로 감쌉니다 — API가 붙으면 응답 헤더의 서버 시각으로 바뀝니다.
 */
export async function getServerNow(): Promise<number> {
  return Date.now();
}
