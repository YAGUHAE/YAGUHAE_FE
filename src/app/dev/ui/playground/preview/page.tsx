import { Suspense } from "react";
import { PreviewClient } from "./preview-client";

/** 플레이그라운드 미리보기 프레임. 직접 열어도 되지만 보통 iframe으로 쓰입니다. */
export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewClient />
    </Suspense>
  );
}
