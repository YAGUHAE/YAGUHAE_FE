"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function PlayerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      icon="alert-triangle"
      title="화면을 불러오지 못했어요"
      description="잠시 후 다시 시도해주세요"
      action={
        <Button variant="secondary" size="medium" onClick={reset}>
          다시 시도
        </Button>
      }
    />
  );
}
