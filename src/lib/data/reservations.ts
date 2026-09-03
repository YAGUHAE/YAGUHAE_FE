import { NOTIFICATIONS, PROFILE, RESERVATIONS } from "@/mocks/data";
import type { Notification, Profile, Reservation, ReviewTarget } from "@/lib/types";
import type { ReservationStatus } from "@/lib/reservation-status";
import { GAMES } from "@/mocks/data";

export type ReservationTab = "ongoing" | "done" | "closed";

export const RESERVATION_TAB_STATUSES: Record<ReservationTab, ReservationStatus[]> = {
  ongoing: ["RESERVED", "PAYMENT_SUBMITTED", "APPROVED"],
  done: ["ATTENDED"],
  closed: ["EXPIRED", "CANCELLED", "REJECTED", "NO_SHOW"],
};

/** `GET /reservations/me` */
export async function listMyReservations(tab: ReservationTab): Promise<Reservation[]> {
  const statuses = RESERVATION_TAB_STATUSES[tab];
  return RESERVATIONS.filter((r) => statuses.includes(r.status)).sort((a, b) =>
    tab === "ongoing" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getReservation(id: string): Promise<Reservation | undefined> {
  return RESERVATIONS.find((r) => r.id === id);
}

export function reservationTotal(r: { slots: { fee: number }[] }) {
  return r.slots.reduce((sum, s) => sum + s.fee, 0);
}

export async function getProfile(): Promise<Profile> {
  return PROFILE;
}

export async function listNotifications(): Promise<Notification[]> {
  return [...NOTIFICATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUnreadCount(): Promise<number> {
  return NOTIFICATIONS.filter((n) => !n.read).length;
}

/** P-9 평가 대상 — 같은 경기의 ATTENDED 참가자 중 본인 제외, 계정 있는 사람만 (§3.2) */
export async function listReviewTargets(reservation: Reservation): Promise<ReviewTarget[]> {
  const game = GAMES.find((g) => g.id === reservation.gameId);
  if (!game) return [];
  return game.slots
    .filter((s) => s.participantName && !s.isMine && !s.proxy)
    .map((s) => ({
      id: s.id,
      name: s.participantName!,
      team: s.team,
      position: s.position,
      reviewed: false,
    }));
}
