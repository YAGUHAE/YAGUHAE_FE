# 라우팅 설계 v1 — App Router 규칙

> **최종 수정일:** 2026-09-03
> **기반 문서:** `docs/screen-design-player.md` (v1) · `docs/screen-design-admin.md` (v2) · `docs/responsive-design.md` (v1)
> **기준 버전:** Next.js 16.2.10 (App Router) · React 19.2.4
> **범위:** URL 체계, 폴더 구조, 셸(layout) 배치, 쿼리 파라미터 계약, 인증 가드. 화면 내부 구성은 화면설계서, 레이아웃 수치는 반응형 설계 문서가 정본입니다

---

## 0. 전제 — 이미 확정된 것

라우팅을 새로 정하는 게 아니라, **이미 코드에 박혀 있는 것을 문서로 고정**합니다.

1. **URL의 정본은 `src/components/navigation/nav-items.ts`입니다.** 용병 4탭(`/games` · `/reservations` · `/notifications` · `/my`)과 어드민 3탭(`/admin/games` · `/admin/payments` · `/admin/league`)이 여기 상수로 있고, Figma `BottomNav`·`TopNav`·`SideNav`의 항목 순서와 1:1입니다. 이 파일을 고치지 않고 URL을 바꾸면 내비게이션이 조용히 어긋납니다.
2. **활성 탭은 컴포넌트가 스스로 찾습니다.** `resolveActiveKey(items, pathname)`가 가장 긴 prefix로 매칭하므로, `/games/12/reserve`도 `games` 탭이 활성입니다. `active` prop은 `dev/ui` 데모처럼 pathname이 없는 문맥에서만 씁니다.
3. **셸은 두 개뿐입니다.** `PlayerShell`(TopNav/BottomNav 전환) · `AdminShell`(SideNav/BottomNav 전환). 반응형 분기는 이 안에서 끝나 있으므로 라우팅이 브레이크포인트를 알 필요가 없습니다.
4. **용병과 어드민은 세션이 다릅니다.** 용병은 카카오 OAuth, 리그 어드민은 ID/PW입니다(어드민 §0 계정 모델). 같은 브라우저에서 둘 다 로그인된 상태가 성립합니다.

---

## 1. 라우트 표

### 1.1 용병 (P-1 ~ P-11)

| 화면 | URL | 파일 | 연동 API |
|---|---|---|---|
| P-1 카카오 로그인 | `/login` | `(auth)/login/page.tsx` | OAuth 콜백 |
| P-2 프로필 설정 | `/onboarding` | `(auth)/onboarding/page.tsx` | 프로필 저장 (미정) |
| P-3 경기 목록 | `/games` | `(player)/games/page.tsx` | `GET /games` |
| P-4 경기 상세 | `/games/[gameId]` | `(player)/games/[gameId]/page.tsx` | `GET /games/:gameId` |
| P-5 예약 신청 폼 | `/games/[gameId]/reserve` | `(player)/games/[gameId]/reserve/page.tsx` | `POST /games/:gameId/reservations` |
| P-6 입금 안내 | `/reservations/[reservationId]/payment` | `(player)/reservations/[reservationId]/payment/page.tsx` | `PATCH /reservations/:id/payment-submitted` |
| P-7 내 예약 목록 | `/reservations` | `(player)/reservations/page.tsx` | `GET /reservations/me` |
| P-8 예약 상세 | `/reservations/[reservationId]` | `(player)/reservations/[reservationId]/page.tsx` | 미정 |
| P-9 평가 작성 | `/reservations/[reservationId]/review` | `(player)/reservations/[reservationId]/review/page.tsx` | 미정 |
| P-10 마이페이지 | `/my` | `(player)/my/page.tsx` | 미정 |
| P-11 알림함 | `/notifications` | `(player)/notifications/page.tsx` | 미정 |

### 1.2 리그 어드민 (A-1 ~ A-8)

| 화면 | URL | 파일 | 연동 API |
|---|---|---|---|
| A-1 어드민 로그인 | `/admin/login` | `admin/login/page.tsx` | 미정 |
| A-2 홈 (대시보드) | `/admin` | `admin/(console)/page.tsx` | 미정 |
| A-3 경기 목록 | `/admin/games` | `admin/(console)/games/page.tsx` | 미정 |
| A-4 경기 등록 | `/admin/games/new` | `admin/(console)/games/new/page.tsx` | 미정 |
| A-4 경기 수정 | `/admin/games/[gameId]/edit` | `admin/(console)/games/[gameId]/edit/page.tsx` | 미정 |
| A-5 경기 상세 | `/admin/games/[gameId]` | `admin/(console)/games/[gameId]/page.tsx` | `GET /admin/games/:id`, `GET /admin/games/:id/reservations?status=` |
| A-6 입금 확인 | `/admin/payments` | `admin/(console)/payments/page.tsx` | `GET /admin/payments?status=&gameId=&q=` |
| A-7 출석 체크 | `/admin/games/[gameId]/attendance` | `admin/(console)/games/[gameId]/attendance/page.tsx` | `POST /admin/games/:id/attendance` |
| A-8 리그 설정 | `/admin/league` | `admin/(console)/league/page.tsx` | `GET /admin/league`, `PATCH /admin/league` |

입금 확정·거절(`PATCH /admin/reservations/:id/confirm-payment` · `:id/reject`)은 **화면이 아니라 액션**입니다. A-6과 A-5 두 곳에서 호출하지만 라우트는 만들지 않습니다(§3-6).

---

## 2. 폴더 구조

```
src/app/
├─ layout.tsx                       # 유일한 root layout (html/body/font)
├─ page.tsx                         # / → redirect("/games")
├─ not-found.tsx
├─ (auth)/                          # 셸 없음 — 탭 진입 전 화면
│  ├─ login/page.tsx                #   P-1
│  └─ onboarding/page.tsx           #   P-2
├─ (player)/                        # layout.tsx = <PlayerShell>
│  ├─ layout.tsx
│  ├─ loading.tsx
│  ├─ error.tsx
│  ├─ games/
│  │  ├─ page.tsx                   #   P-3
│  │  └─ [gameId]/
│  │     ├─ page.tsx                #   P-4
│  │     └─ reserve/page.tsx        #   P-5
│  ├─ reservations/
│  │  ├─ page.tsx                   #   P-7
│  │  └─ [reservationId]/
│  │     ├─ page.tsx                #   P-8
│  │     ├─ payment/page.tsx        #   P-6
│  │     └─ review/page.tsx         #   P-9
│  ├─ notifications/page.tsx        #   P-11
│  └─ my/page.tsx                   #   P-10
├─ admin/
│  ├─ login/page.tsx                #   A-1 (셸 밖)
│  └─ (console)/                    # layout.tsx = <AdminShell>
│     ├─ layout.tsx
│     ├─ loading.tsx
│     ├─ error.tsx
│     ├─ page.tsx                   #   A-2
│     ├─ games/
│     │  ├─ page.tsx                #   A-3
│     │  ├─ new/page.tsx            #   A-4 등록
│     │  └─ [gameId]/
│     │     ├─ page.tsx             #   A-5
│     │     ├─ edit/page.tsx        #   A-4 수정
│     │     └─ attendance/page.tsx  #   A-7
│     ├─ payments/page.tsx          #   A-6
│     └─ league/page.tsx            #   A-8
└─ dev/ui/…                         # 컴포넌트 데모 (기존)
```

`src/proxy.ts`가 `src/app`과 같은 층에 붙습니다(§6).

---

## 3. 규칙

### 3-1. 라우트 그룹은 셸 경계에만 씁니다

`(auth)` · `(player)` · `admin/(console)` 셋뿐이고, 괄호 폴더는 URL에 나타나지 않으므로 §1의 주소는 그대로입니다. 그룹을 나눈 기준은 **어떤 셸을 두르는가** 하나입니다.

- `(auth)` — 내비를 그리지 않는 화면. P-1은 딥 그린 전면, P-2는 640 열만(반응형 §7.2). 탭 진입 전이라 내비를 그릴 근거가 없습니다
- `(player)` — `PlayerShell`
- `admin/(console)` — `AdminShell`

**어드민 로그인(A-1)만 `(console)` 밖에 둡니다.** `/admin/login`이 URL로는 어드민 아래지만 셸을 받으면 안 되기 때문입니다. 그룹 없이 `admin/layout.tsx`에 셸을 두면 로그인 화면에도 사이드바가 붙습니다.

용병 로그인을 `/login`, 어드민 로그인을 `/admin/login`으로 갈라 둔 것도 의도적입니다. 계정 모델이 다르고(§0-4) 실수로 서로의 로그인에 도달할 이유가 없습니다.

### 3-2. 셸은 layout에서 한 번만 두릅니다

페이지 컴포넌트가 `<PlayerShell>`을 직접 그리지 않습니다. `active`도 넘기지 않습니다 — 내비가 pathname으로 해결하므로(§0-2) 화면을 추가할 때 셸을 손댈 일이 없습니다.

```tsx
// src/app/(player)/layout.tsx
export default async function PlayerLayout({ children }: LayoutProps<'/'>) {
  const unreadCount = await getUnreadCount();
  return <PlayerShell unreadCount={unreadCount}>{children}</PlayerShell>;
}
```

```tsx
// src/app/admin/(console)/layout.tsx
export default async function ConsoleLayout({ children }: LayoutProps<'/admin'>) {
  const { name, pendingPayments } = await getLeagueSummary();
  return (
    <AdminShell leagueName={name} badges={{ payments: pendingPayments }}>
      {children}
    </AdminShell>
  );
}
```

`width="wide"`(P-4·P-5의 lg split)는 화면마다 다르므로 layout에서 정할 수 없습니다. **해당 페이지에서 `Split variant="info"`로 처리**하고, 셸 폭이 꼭 필요하면 그 두 화면만 별도 그룹으로 빼는 대신 `PlayerShell`에 폭을 넘기는 얇은 래퍼를 페이지에 둡니다. 그룹을 늘려 셸을 두 번 정의하지 않습니다.

> **⚠️ layout은 네비게이션마다 다시 실행되지 않습니다.** 알림 배지·입금 미처리 배지가 여기서 fetch되므로, 읽음 처리·입금 확정 서버 액션에서 `revalidatePath('/admin', 'layout')` 같은 무효화를 반드시 걸어야 합니다. 걸지 않으면 처리했는데 배지 숫자가 그대로입니다.

### 3-3. 폴더 하나 = 화면 하나, 파일 상단에 화면 ID를 적습니다

```tsx
/** P-4 경기 상세 — screen-design-player.md §P-4 */
```

화면설계서가 ID로 서로를 참조하고(§4 "용병 화면설계서와의 연결") 문서 사이 링크가 ID로만 걸려 있어서, 코드에서 ID를 떼면 대조가 끊깁니다.

### 3-4. 깊이는 2단, 동사는 마지막 세그먼트

`PageHeader`가 breadcrumb 없이 `backHref` chevron 하나로 뒤로 가는 설계라(컴포넌트 주석: "목록 → 상세 2단 깊이에서만"), 라우트도 **목록 → 상세**까지가 한계입니다. 그 아래 동작 화면은 명사 컬렉션 + 동사 하나로 끝냅니다: `/reserve` `/payment` `/review` `/new` `/edit` `/attendance`.

3단(`/admin/games/[id]/reservations/[id]/…` 같은 것)이 필요해 보이면 대개 화면이 아니라 액션입니다(§3-6).

### 3-5. P-6 입금 안내는 예약 하위에 둡니다

`/reservations/[id]/payment`입니다. 진입점이 셋이기 때문입니다.

| 진입 | 출처 |
|---|---|
| P-5 제출 성공 직후 | 화면설계서 §P-5 "성공: P-6으로 이동" |
| P-7에서 `RESERVED` 항목 클릭 | §P-7 "RESERVED 상태 아이템은 P-6로 바로 이동" |
| 만료 임박 알림(12h/1h) 클릭 | §P-11 |

셋 다 예약 1건을 가리키므로 예약 id가 경로에 있어야 합니다. `/games/[id]/payment`로 두면 예약 id를 쿼리로 끌고 다녀야 하고, 한 경기에 예약이 하나뿐이라는 (지금은 맞지만 §2-5에서 흔들릴 수 있는) 전제에 기댑니다.

### 3-6. 다이얼로그는 라우트가 아닙니다

`Dialog` 컴포넌트가 이미 있습니다. 아래는 전부 컴포넌트 상태로 처리하고 URL을 만들지 않습니다.

- A-6 `입금 완료` 확인(입금자명·금액 재확인) · `거절` 사유 선택 4종
- A-7 제출 전 경고
- P-5 `INSUFFICIENT_SLOTS` 되묻기, `GAME_NOT_OPEN`·`USER_SUSPENDED` 실패 다이얼로그
- P-4 정지 유저 안내

**intercepting / parallel routes(`@modal`)는 도입하지 않습니다.** Next 16부터 모든 병렬 슬롯에 `default.js`가 없으면 빌드가 실패해 관리 비용이 늘고, 이 앱에는 "링크로 공유되는 모달"이 하나도 없습니다.

### 3-7. 탭·필터·검색은 세그먼트가 아니라 `searchParams`

라우트를 쪼개면 화면 수가 배로 늘고, 쿼리로 두면 새로고침·뒤로가기·공유가 공짜입니다.

| 화면 | 쿼리 키 | 값 |
|---|---|---|
| P-3 경기 목록 | `region` · `date` · `level` | 단일 선택 (§P-3) |
| P-5 예약 신청 | `slot` | P-4 빈 슬롯 탭 진입 시 프리필. 예: `선공-3루` |
| P-7 내 예약 | `tab` | `ongoing` \| `done` \| `closed` |
| A-3 경기 목록 | `status` | 경기 상태 |
| A-5 경기 상세 | `tab` | `pending` \| `approved` \| `rejected` |
| A-6 입금 확인 | `status` · `gameId` · `q` | API 파라미터와 동일. 기본은 전체 경기 합산 (§A-6) |

**예외 — 클라이언트 state로 두는 것:** P-4·P-5의 선공/후공 `SegmentedTab`. 데이터를 다시 불러오지 않는 표시 토글이고, 특히 P-5는 팀을 오가도 선택이 유지돼야 하므로(§P-5) URL에 얹으면 오히려 방해가 됩니다.

값이 없을 때의 기본값은 페이지에서 정하고, 잘못된 값이 오면 기본값으로 떨어뜨립니다(404를 내지 않습니다).

### 3-8. 동적 경로는 `src/lib/routes.ts`로 생성합니다

정적 경로는 `nav-items.ts`를 그대로 씁니다. 동적 경로만 빌더를 둡니다.

```ts
export const routes = {
  game: (id: string) => `/games/${id}`,
  gameReserve: (id: string, slot?: string) =>
    slot ? `/games/${id}/reserve?slot=${encodeURIComponent(slot)}` : `/games/${id}/reserve`,
  reservation: (id: string) => `/reservations/${id}`,
  reservationPayment: (id: string) => `/reservations/${id}/payment`,
  reservationReview: (id: string) => `/reservations/${id}/review`,
  adminGame: (id: string) => `/admin/games/${id}`,
  adminGameEdit: (id: string) => `/admin/games/${id}/edit`,
  adminGameAttendance: (id: string) => `/admin/games/${id}/attendance`,
} as const;
```

`MatchRow` · `ReservationRow` · `PositionSlot`이 전부 `href`를 받는 구조라 템플릿 리터럴이 흩어지기 쉽습니다. 경로를 한 번 바꾸는 일이 grep 작업이 되지 않게 합니다.

---

## 4. 인증 가드 — `proxy.ts` + 데이터 계층 2단

### 4-1. `proxy.ts` (낙관적 체크)

**Next.js 16에서 `middleware`가 `proxy`로 이름이 바뀌었습니다.** 파일은 프로젝트당 하나이고 `src/proxy.ts`에 둡니다.

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login' || pathname === '/admin/login';
  const session = req.cookies.get(isAdmin ? 'admin_session' : 'player_session');

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin/login' : '/login', req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|.*\\..*).*)'],
};
```

여기서는 **쿠키 존재 여부만 봅니다.** proxy는 prefetch를 포함해 모든 요청에서 돌기 때문에 DB 조회를 넣으면 그대로 지연이 됩니다. 서명 검증·권한 판단은 아래 4-2입니다.

### 4-2. 실제 검증은 데이터 접근 계층에서

**layout에서 세션을 검사하지 않습니다.** partial rendering 때문에 layout은 라우트 이동 시 재실행되지 않고, 따라서 가드가 첫 진입에만 걸립니다. 검증은 데이터를 가져오는 함수(`verifySession()`)에 붙여 두고, 페이지·서버 액션이 그 함수를 통해서만 데이터에 닿게 합니다. 어드민은 여기서 **리그 소유권까지** 봅니다 — `league_admin`은 자기 리그 데이터만 볼 수 있습니다(어드민 §0).

정지 유저(`is_suspended`)는 라우팅으로 막지 않습니다. P-3 목록은 그대로 보이고 P-4에서 안내하는 것이 명세입니다(§P-3 정지 유저 처리).

### 4-3. 온보딩 분기

P-1 성공 후 신규 유저는 `/onboarding`, 기존 유저는 `/games`입니다. **이 분기는 로그인 콜백 처리부에서 `redirect()`로 합니다.** proxy에서 "프로필 미완성이면 /onboarding" 규칙을 돌리려면 매 요청마다 프로필을 봐야 해서 4-1의 원칙과 충돌합니다.

### 4-4. `/` 루트

`app/page.tsx`에서 `redirect('/games')`. proxy가 이미 로그인 여부로 갈라 주므로 루트는 용병 홈만 가리키면 됩니다. 어드민은 `/admin`을 북마크합니다.

---

## 5. Next.js 16에서 달라진 것 (구현 시 주의)

`AGENTS.md`의 경고대로, 아래는 이전 버전 기억과 다릅니다.

1. **`params` · `searchParams`는 Promise입니다.** 반드시 `await` 합니다.
2. **타입은 전역 헬퍼를 씁니다.** `PageProps<'/games/[gameId]'>` · `LayoutProps<'/admin'>` — import가 필요 없고 `next dev` · `next build` · `next typegen`이 생성합니다. `typecheck` 스크립트에 `next typegen`이 이미 들어 있습니다.
   ```tsx
   export default async function Page(props: PageProps<'/games/[gameId]'>) {
     const { gameId } = await props.params;
   }
   ```
3. **`middleware.ts` → `proxy.ts`** (§4-1).
4. **병렬 라우트 슬롯은 `default.js` 필수** — 없으면 빌드 실패. 그래서 §3-6에서 도입하지 않습니다.
5. **스크롤 동작 오버라이드가 기본에서 빠졌습니다.** `scroll-behavior: smooth`를 전역으로 쓰면서 라우트 이동은 즉시 이동하길 원하면 `<html data-scroll-behavior="smooth">`를 붙여야 합니다.
6. **PPR은 `experimental_ppr`이 아니라 `cacheComponents`** 로 옮겨 갔습니다. 지금은 켜지 않습니다 — 데이터 계층이 붙기 전에 캐시 전략을 정할 근거가 없습니다.

---

## 6. 만들지 않는 것

| 후보 | 뺀 이유 |
|---|---|
| `@modal` 병렬 라우트 | §3-6. 공유되는 모달 URL이 없고 `default.js` 관리 비용만 남습니다 |
| `/admin/home` | A-2는 `/admin` 자체입니다. 탭 3개가 모두 `/admin/*`이라 홈만 한 단계 더 들어갈 이유가 없습니다 |
| `/games/[id]/reserve/confirm` 같은 단계 라우트 | P-5는 한 화면 폼입니다. 부분 실패도 화면을 유지한 채 되묻는 것이 명세입니다(§P-5) |
| 어드민용 별도 root layout | `<html>`을 두 벌 관리하게 됩니다. 폰트·토큰이 같으므로 root는 하나로 두고 셸에서 갈립니다 |
| i18n 세그먼트 | 한국어 단일 서비스입니다 |
| Route Handlers (`app/api/*`) | 백엔드가 NestJS로 따로 있습니다. BFF가 필요해지면 그때 근거와 함께 추가합니다 |

---

## 7. 확인이 필요한 항목

1. **P-9 평가 작성의 단위** — 지금은 `/reservations/[id]/review`로 예약에 매달아 뒀습니다. 명세상 평가 대상은 "같은 경기의 ATTENDED 참가자 전원"이므로 실제로는 경기 단위(`/games/[id]/review`)가 맞을 수 있습니다. §P-9의 제출 방식(개별 vs 일괄, 화면설계서 §2-1)이 정해지면 같이 확정합니다.
2. **참가비 0원 예약의 P-6 통과 여부** — 화면설계서 §2-2가 미결입니다. "P-6를 건너뛴다"로 정해지면 P-5 제출 후 redirect 대상이 `/reservations/[id]`로 갈라집니다.
3. **쿠키 이름과 세션 방식** — `player_session` · `admin_session`은 이 문서에서 임시로 정한 이름입니다. 서버(NestJS)가 JWT를 어떻게 내려주는지에 맞춰 확정해야 §4-1이 완성됩니다.
4. **알림 딥링크 규칙** — P-11 아이템 클릭 시 `reservation_id`가 있으면 P-8로 간다고만 돼 있습니다. 만료 임박 알림은 P-6이 맞아 보이는데(§3-5), 알림 유형별 목적지 표가 필요합니다.
5. **프로필 수정 라우트** — P-10 「프로필 수정」이 닿을 주소가 §1에 없습니다. 지금은 P-2 온보딩 폼(`/onboarding`)을 재사용해 두었습니다. `/my/edit`를 둘지, 온보딩 폼을 그대로 쓸지 정해야 합니다.
6. **문의하기 목적지** — P-4 · P-10의 「문의하기」는 서비스 운영자 역할이 확정되기 전까지 닿을 곳이 없습니다(어드민 §6-1). 지금은 `mailto:` 자리표시자입니다.

---

## 8. 다음 작업

| # | 작업 | 상태 |
|---|---|---|
| 1 | §2 폴더 구조 스캐폴딩 (page 껍데기 + 두 layout) | ✅ #16 |
| 2 | `src/lib/routes.ts` (§3-8) | ✅ #16 |
| 3 | `src/proxy.ts` (§4-1) — 세션 방식 확정 후 | ⬜ |
| 4 | P-3 → P-4 → P-5 → P-6 순 구현 (용병 핵심 흐름) | ✅ #16 — UI + 목 데이터. API 연동은 `src/lib/data/*` 본문 교체 |
| 5 | A-6 → A-5 → A-3 순 구현 (어드민 핵심 흐름) | ✅ #16 — 동상 |
| 6 | 데이터 계층 API 연동 (`src/lib/data/*` → NestJS) · 서버 액션 + `revalidatePath` | ⬜ |
