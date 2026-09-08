"use client";

import { useRouter } from "next/navigation";
import { PositionBoard, type PositionBoardProps } from "./position-board";
import { routes } from "@/lib/routes";

/** P-4 보드 — 빈 슬롯을 탭하면 그 포지션이 프리필된 P-5로 갑니다 (`?slot=선공-3루`). */
export function GameBoard({
  gameId,
  canReserve,
  ...rest
}: Omit<PositionBoardProps, "mode" | "onEmptyClick"> & { gameId: string; canReserve: boolean }) {
  const router = useRouter();
  return (
    <PositionBoard
      {...rest}
      mode="view"
      onEmptyClick={canReserve ? (slot) => router.push(routes.gameReserve(gameId, slot.id)) : undefined}
    />
  );
}
