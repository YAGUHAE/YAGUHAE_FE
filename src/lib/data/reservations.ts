import { cache } from "react";
import { orUndefined, playerApi } from "@/lib/api/client";
import type {
  ListDto,
  MyReservationStatusQuery,
  NotificationListDto,
  ParticipantsDto,
  ReservationDetailDto,
  ReservationSummaryDto,
  UserDetailDto,
} from "@/lib/api/dto";
import { toNotification, toProfile, toReservation, toReservationSummary, toReviewTargets } from "@/lib/api/mappers";
import type { Notification, Profile, Reservation, ReservationSummary, ReviewTarget } from "@/lib/types";

export type ReservationTab = MyReservationStatusQuery;

/** `GET /reservations/me?status=` — 탭별 상태 묶음과 정렬은 서버가 정합니다 (명세 §6). */
export async function listMyReservations(tab: ReservationTab): Promise<ReservationSummary[]> {
  const { items } = await playerApi.get<ListDto<ReservationSummaryDto>>("/reservations/me", { status: tab });
  return items.map(toReservationSummary);
}

/** `GET /reservations/:id` — 경기·계좌까지 조인돼 옵니다. */
export const getReservation = cache(async (id: string): Promise<Reservation | undefined> => {
  const dto = await orUndefined(playerApi.get<ReservationDetailDto>(`/reservations/${encodeURIComponent(id)}`));
  return dto && toReservation(dto);
});

/** `GET /users/me` */
export const getProfile = cache(async (): Promise<Profile> => toProfile(await playerApi.get<UserDetailDto>("/users/me")));

/** `GET /notifications/me` */
export async function listNotifications(): Promise<Notification[]> {
  const { items } = await playerApi.get<NotificationListDto>("/notifications/me");
  return items.map(toNotification);
}

/** 셸 배지 — 매 화면 layout에서 부릅니다. */
export async function getUnreadCount(): Promise<number> {
  const { unreadCount } = await playerApi.get<NotificationListDto>("/notifications/me", { unreadOnly: true });
  return unreadCount;
}

/** `GET /games/:gameId/participants` — P-9 평가 대상. 본인·대리 신청분 제외는 서버가 합니다 (명세 §7). */
export async function listReviewTargets(gameId: string): Promise<ReviewTarget[]> {
  const dto = await playerApi.get<ParticipantsDto>(`/games/${encodeURIComponent(gameId)}/participants`);
  return toReviewTargets(dto);
}
