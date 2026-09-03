import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-subtle">
      <EmptyState
        icon="alert-triangle"
        title="페이지를 찾을 수 없어요"
        description="주소가 바뀌었거나 삭제된 경기일 수 있어요"
        action={
          <Button variant="secondary" size="medium" href="/games">
            경기 목록으로
          </Button>
        }
      />
    </div>
  );
}
