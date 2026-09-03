import { Suspense } from "react";
import { Playground } from "./playground";

/** 공용 컴포넌트 플레이그라운드. props 조작 · 테마 · 뷰포트 전환. 개발 확인용이며 제품 라우트가 아닙니다. */
export default function PlaygroundPage() {
  return (
    <Suspense fallback={null}>
      <Playground />
    </Suspense>
  );
}
