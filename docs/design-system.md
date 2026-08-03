# 야구해 디자인 시스템 v1

> **최종 수정일:** 2026-08-02
> **기반 문서:** `docs/screen-design-player.md` (용병 화면설계서 v1)
> **Figma 파일:** https://www.figma.com/design/FlB17wV6KQbQCHNEp32mbR
> **빌드 RUN_ID:** `yaguhae-ds-2026-08-01`

---

## 0. 현재 상태

| 항목 | 상태 |
|---|---|
| Figma 변수 162개 (4개 컬렉션, Light/Dark 2모드) | ✅ |
| Figma 텍스트 스타일 13종 / 이펙트 스타일 4종 | ✅ |
| Figma 페이지 22개 (Cover · Foundations · 구분자 · 컴포넌트 18 · Screens) | ✅ |
| Figma 컴포넌트 18종 / variant 총 92개 (`TeamSlot` 4개는 폐기 상태로 잔존) | ✅ |
| 코드 토큰 (`src/app/globals.css`) — 다크모드 포함 | ✅ |
| 코드 폰트 (`src/app/layout.tsx`) | ✅ |
| 접근성 대비 감사 (Light/Dark 21쌍) | ✅ 전부 AA 통과 |
| 화면 목업 (P-1~P-11) | ✅ 11개 전부 |
| Code Connect 매핑 | ⬜ 미착수 |
| React 컴포넌트 구현 | ⬜ 미착수 |

---

## 1. 브랜드 · 제약

- **비주얼 방향:** 야구 그라운드 그린. 잔디 그린(`green/500 #17854F`)이 주색, 내야 흙(`clay`)이 보조 악센트.
- **타깃:** 모바일 우선 (360dp 기준), 하단 탭 4개 구조.
- **폰트:** **Noto Sans KR** (Regular 400 / Medium 500 / Bold 700) + 숫자 전용 **Roboto Mono**.
  - Pretendard가 Figma에 설치돼 있지 않아 Noto Sans KR을 정본으로 사용합니다. 코드의 `--font-family-sans`는 Pretendard를 폴백으로 포함합니다.
  - Noto Sans KR에 **Semi Bold가 없습니다.** semibold가 필요한 자리는 전부 **Bold**를 씁니다.
- **다크모드:** Light/Dark 2모드 지원. Figma는 `Color` 컬렉션의 모드로, 코드는 `prefers-color-scheme` 미디어 쿼리로 구현.
  - 클래스 기반 토글(`.dark`)은 테마 스위처를 만들 때 `@custom-variant`로 추가하면 됩니다. 지금은 OS 설정만 따릅니다.

---

## 2. 토큰 구조

Figma 변수와 CSS 변수 이름이 **1:1로 일치**합니다. Dev Mode에서 나오는 `var(--...)`를 그대로 코드에 붙여 쓸 수 있습니다.

| 컬렉션 | 모드 | 개수 | 내용 |
|---|---|---|---|
| `Primitives` | Value | 57 | green 10 · clay 5 · gray 12 · red 10 · amber 10 · blue 10 |
| `Color` | **Light / Dark** | 57 | bg 11 · text 9 · border 6 · icon 5 · status 16 · feedback 8 · accent 2 |
| `Dimension` | Value | 27 | spacing 11 · radius 7 · size 7 · border-width 2 |
| `Typography` | Value | 21 | family 2 · weight 3 · size 8 · line-height 8 |

### 규칙

1. **Primitives는 직접 쓰지 않습니다.** Figma에서 `scopes = []`로 피커에서 숨겨 뒀습니다. 코드에서도 `--color-green-500`이 아니라 `--color-bg-brand`를 쓰세요.
2. **상태 색은 status 토큰 쌍으로만.** 예약 8상태는 `--color-status-{state}-bg` + `--color-status-{state}-text` 쌍으로 고정입니다.
3. **터치 타겟 44px.** `--size-touch-min: 44px`. 탭 가능한 요소는 이보다 작게 만들지 않습니다.
4. **다크모드는 primitive 참조만 바뀝니다.** semantic 토큰 이름은 그대로이므로 컴포넌트 코드에는 다크모드 분기가 없어야 합니다.

### 예약 상태 ↔ 색 매핑

화면설계서 §P-8 상태 테이블과 1:1입니다.

| 상태 | 배지 문구 | Light bg / text | Dark bg / text |
|---|---|---|---|
| `RESERVED` | 입금 대기 | amber-50 / amber-700 | amber-900 / amber-300 |
| `PAYMENT_SUBMITTED` | 승인 대기 | blue-50 / blue-600 | blue-900 / blue-300 |
| `APPROVED` | 승인 완료 | green-50 / green-600 | green-900 / green-300 |
| `ATTENDED` | 참가 완료 | gray-100 / gray-700 | gray-700 / gray-200 |
| `EXPIRED` | 기간 만료 | gray-100 / gray-600 | gray-700 / gray-300 |
| `CANCELLED` | 취소함 | gray-100 / gray-600 | gray-700 / gray-300 |
| `REJECTED` | 거절됨 | red-50 / red-600 | red-900 / red-300 |
| `NO_SHOW` | 노쇼 처리 | red-600 / white | red-600 / white *(경고성이라 동일 유지)* |

---

## 3. 코드에서 쓰는 법

`src/app/globals.css`에 `@theme static`으로 정의돼 있습니다. `static`을 쓴 이유는 Tailwind v4가 기본적으로 **미사용 토큰을 트리셰이킹**해서 `var(--color-bg-brand)`를 직접 참조할 수 없게 되기 때문입니다.

### Tailwind 유틸리티

토큰 이름이 그대로 유틸리티 접미사가 됩니다. `bg-bg-brand`처럼 카테고리가 겹쳐 보이지만, Figma 변수명과의 1:1 대응을 깨지 않기 위한 의도적 선택입니다.

```tsx
<button className="bg-bg-brand text-text-on-brand rounded-md p-lg shadow-card">
  신청하기
</button>
```

| 토큰 그룹 | 유틸리티 예시 |
|---|---|
| color | `bg-bg-brand` · `text-text-secondary` · `border-border-default` |
| status | `bg-status-approved-bg` · `text-status-approved-text` |
| spacing | `p-lg` · `gap-sm` · `m-2xl` |
| radius | `rounded-md` · `rounded-full` |
| shadow | `shadow-card` · `shadow-nav` · `shadow-sheet` · `shadow-dialog` |
| font-size | `text-md` · `text-2xl` |

### 텍스트 스타일

Figma 텍스트 스타일 13종은 `@utility`로 정의된 `type-*` 클래스와 1:1입니다.

| Figma 스타일 | 클래스 | 값 |
|---|---|---|
| Display/Large | `type-display-lg` | 28/36 Bold |
| Heading/Large | `type-heading-lg` | 22/30 Bold |
| Heading/Medium | `type-heading-md` | 18/26 Bold |
| Heading/Small | `type-heading-sm` | 16/24 Bold |
| Body/Large | `type-body-lg` | 16/24 Regular |
| Body/Medium | `type-body-md` | 14/22 Regular |
| Body/Small | `type-body-sm` | 13/20 Regular |
| Label/Large | `type-label-lg` | 16/20 Bold |
| Label/Medium | `type-label-md` | 14/18 Medium |
| Label/Small | `type-label-sm` | 12/16 Medium |
| Caption | `type-caption` | 12/18 Regular |
| Numeric/Countdown | `type-numeric-countdown` | 24/28 Mono Bold, tabular |
| Numeric/Price | `type-numeric-price` | 16/22 Mono Medium, tabular |

---

## 4. Figma 파일 구조

```
📕 Cover & Guide        커버 + 사용 규칙 5개
🎨 Foundations          컬러 · 타이포 · 스페이싱 · 라운드 · Elevation + Dark Mode 미리보기
——— COMPONENTS ———
Icon · Button · StatusBadge · TextField · SelectField · FilterChip · SegmentedTab ·
BottomNav · GameCard · ReservationRow · Toast · Dialog · EmptyState · Countdown ·
RatingScale · PositionSlot · RosterStrip · TeamSlot (deprecated)
📱 Screens              화면 목업 P-1 ~ P-11 (360×780)
```

Foundations 하단의 **Dark Mode** 섹션은 컬러 섹션을 복제해 `Color` 컬렉션 모드를 Dark로 고정한 것입니다. 같은 토큰이 다크 값으로 렌더되는지 눈으로 확인할 수 있습니다.

---

## 5. 컴포넌트 17종

| # | 컴포넌트 | Variant | 개수 | 사용처 |
|---|---|---|---|---|
| 1 | `Icon` | 개별 컴포넌트 12종 | 12 | 전역 |
| 2 | `Button` | Variant(Primary/Secondary/Ghost/Danger) × Size(Large/Medium) × State(Default/Pressed/Disabled) | 24 | P-4 신청하기 비활성 분기 |
| 3 | `StatusBadge` | Status 8종 | 8 | P-7, P-8 상태 배지 |
| 4 | `TextField` | State(Default/Focus/Error/Disabled) | 4 | P-2 닉네임, P-5 입금자명 |
| 5 | `SelectField` | State(Default/Focus/Error/Disabled) | 4 | P-2 지역·포지션·급수, P-3 필터 |
| 6 | `FilterChip` | Selected × State | 4 | P-3 필터 바 |
| 7 | `SegmentedTab` | Selected(T/F) | 2 | P-7 진행중/완료/종료 탭 |
| 8 | `BottomNav` | Active 4탭 | 4 | 하단 탭 |
| 9 | `GameCard` | Status(Open/Closed/Cancelled) | 3 | P-3 리스트 카드 (선공/후공 모집 인원) |
| 10 | `ReservationRow` | HasAction(T/F) | 2 | P-7 리스트 아이템 |
| 11 | `Toast` | Type(Success/Warning/Danger/Info) | 4 | P-1 로그인 실패, P-9 최대 2명 |
| 12 | `Dialog` | Actions(One/Two) | 2 | P-5 제출 실패 다이얼로그 |
| 13 | `EmptyState` | — (액션 표시 BOOLEAN) | 1 | P-3, P-7, P-11 빈 상태 |
| 14 | `Countdown` | Urgency(Normal/Warning/Critical) | 3 | P-6 만료 타이머 (12h/1h 강조) |
| 15 | `RatingScale` | Value(0~5) | 6 | P-9 매너/실력/시간 점수 |
| 16 | ~~`TeamSlot`~~ | ~~State(Available/Selected/Full/Readonly)~~ | ~~4~~ | **폐기** → `PositionSlot` (§5) |
| 17 | `RosterStrip` | 칸별 BOOLEAN 10개 | 1 | P-1 히어로 (그래픽 용도) |
| 18 | `PositionSlot` | State(Empty/Selected/Filled) × `내 신청 표시` BOOLEAN | 3 | P-4 포지션 보드, P-5 슬롯 **다중** 선택 |

**아이콘 13종:** calendar · clock · map-pin · banknote · users · bell · user · chevron-right · chevron-left · chevron-down · check · close · alert-triangle

### 알려진 제한

- **INSTANCE_SWAP 프로퍼티 미적용.** 로컬 미게시 컴포넌트는 `key`가 비어 있어 `addComponentProperty(..., 'INSTANCE_SWAP', key)`가 거부됩니다. 라이브러리를 게시한 뒤 추가하면 됩니다. 그 전에도 인스턴스 교체 자체는 Figma UI에서 가능합니다.
- **TEXT 프로퍼티는 variant 전체가 기본값을 공유합니다.** 그래서 TextField의 Error variant가 에러 문구 대신 일반 안내 문구를 보여줍니다. 인스턴스에서 값을 넣으면 됩니다.

### 정원 모델 — 포지션 슬롯 단위 (2026-08-02 재확정, **Figma 반영 완료**)

화면설계서 §3이 **팀 단위 → 팀 × 포지션 슬롯 단위**로 되돌려졌습니다. 그에 맞춰 아래를 반영했습니다.

| 대상 | 이전 (팀 단위) | 반영 결과 |
|---|---|---|
| `TeamSlot` | 팀 1행 = 정원 1블록 | **폐기.** `TeamSlot (deprecated)` 페이지로 이름만 바꿔 남겨 뒀습니다. 참조 인스턴스 0개 — 확인 후 삭제해도 됩니다 |
| `PositionSlot` | — | **신규.** 1행 = 포지션 1슬롯. `Empty`/`Selected`/`Filled` 3 variant |
| `GameCard` | `선공 4/10 · 후공 6/10`, 참가비 단일 금액 | 분모를 슬롯 수(11)로. **빈 포지션 칩 2개** 추가, 참가비는 `13,000원부터`(최저가 표기) |
| P-4 목업 | `TeamSlot` `Readonly` 2행 | **포지션 보드 11행 + 팀 탭.** 프레임 높이 780 → 1120 |
| P-5 목업 | 팀 3지선다 | 같은 보드를 선택 모드로 재사용. "무관" 삭제, 선택 슬롯 금액 요약 추가 |

#### `PositionSlot` 설계 근거

- **행의 우측 값이 상태에 따라 바뀝니다.** 빈자리는 **"신청 가능"**(`Label/Medium` + `text/brand` + chevron), 신청된 자리는 **참가자 이름**(`Body/Large` + `text/secondary`, 회색 배경), 선택된 자리는 **"선택함"** + check.
- **스캔 방향이 하나입니다.** 초록 + chevron = 신청 가능, 회색 = 찼음. 11행을 훑을 때 눈이 초록만 따라가면 됩니다.
- **보드에 금액을 넣지 않습니다.** 초안에서는 빈 슬롯 우측에 참가비를 뒀지만, 11행에 금액이 반복되면 "자리가 남았는가"라는 보드의 유일한 질문이 흐려집니다. 금액은 P-4 상단 티어 요약 → P-5 선택 요약 → P-6 입금액으로, 결정에 가까워질수록 한 번씩만 나옵니다.
- **`Selected`는 라디오가 아니라 체크박스입니다.** 여러 행을 동시에 `Selected`로 둘 수 있고, 실제로 P-5가 그렇게 씁니다(§5.1). 상호배타성을 강제하는 장치는 컴포넌트에 없습니다 — 애초에 상호배타가 아닙니다.
- **`내 신청 표시` 배지**(BOOLEAN, 기본 꺼짐 / 라벨은 TEXT 프로퍼티, 기본값 `내 신청`)는 내 예약에 속한 행 표시용입니다. 대리로 잡아준 자리도 내 예약이라 본인 자리와 구분하지 않습니다. P-4·P-5 목업은 신청 전 상태라 꺼져 있습니다.

### 5.1 다중 슬롯 예약 (2026-08-02, 화면설계서 §3.2)

**예약 1건이 슬롯 여러 개를 잡습니다.** 한 사람이 동행자 몫까지 신청하는 실제 운영을 반영한 것으로, 화면에는 아래처럼 나타납니다.

| 화면 | 반영 |
|---|---|
| P-5 | 보드에서 슬롯 **다중 선택**(3자리) → 선택한 자리마다 **참가자 이름 입력**(`TextField` 재사용, Helper 숨김) → **합계 금액** |
| P-6 | `입금액 합계 34,000원` + 슬롯별 내역 3줄을 `bg/subtle` 블록으로 |
| P-8 | 슬롯 목록 3행 + 구분선 + 합계 + 입금자명 |
| P-4 | 변화 없음 — 보드는 원래 슬롯마다 이름을 보여주고 있었고, 그 이름이 대리 신청분일 수 있게 된 것뿐입니다 |

**설계상 중요한 점 두 가지**

- **금액이 처음으로 "합계"가 됩니다.** 슬롯마다 티어가 다르므로 P-6에서 합계만 보여주면 검산이 불가능합니다. 그래서 내역을 접지 않고 펼쳐 뒀습니다. 슬롯이 1개면 내역 없이 한 줄입니다.
- **참가자 이름은 보드에 그대로 나갑니다.** P-5의 안내 문구("보드에 그대로 표시돼요")가 그 계약을 명시합니다. 입력 시점에 알려주지 않으면 남의 이름을 공개 화면에 올리는 셈이 됩니다.

**로스터 스트립은 P-1 히어로 전용으로 남습니다.** P-4·P-5에서는 보드 자체가 정원 시각화라 중복이라 뺐습니다. 히어로의 10칸은 데이터가 아니라 그래픽이므로 칸 수를 11로 맞추지 않았습니다.

과거 `TeamSlot`에서 "마감은 값이 아니라 상태이므로 TEXT 프로퍼티에서 분리한다"고 정한 원칙은 `PositionSlot`에도 그대로 적용했습니다 — 상태는 전부 variant가 들고, TEXT 프로퍼티는 `순번`·`포지션`·`값` 3개뿐입니다.

---

## 6. 화면 목업 (P-1~P-11)

`📱 Screens` 페이지에 11개 화면이 360×780 기준으로 있습니다. 전부 위 컴포넌트 인스턴스와 토큰으로만 조립했습니다.

### 구성 원칙

- **시그니처는 포지션 보드.** 실제 게스트 모집 공고의 포지션 명단을 그대로 화면 구조로 삼았습니다. P-4·P-5가 같은 보드를 읽기/선택 모드로 공유하므로, 사용자는 상세에서 본 화면 그대로 신청합니다. 로스터 스트립(10칸)은 P-1 히어로의 그래픽으로만 남습니다.
- **숫자는 전부 Roboto Mono.** 날짜·시간·인원·금액·카운트다운·타임스탬프. 단 **한글 값에는 쓰지 않습니다**(P-6의 은행명·예금주는 본문 서체).
- **진한 그라운드 그린은 P-1에만.** 나머지 화면의 헤더·리스트는 흰 배경 + 헤어라인으로 조용하게 둡니다.
- **구조 장치는 정보일 때만.** P-3의 날짜 구분선(경기는 실제 날짜순 묶음), P-8의 타임라인(상태 이력은 실제 순서)만 씁니다. 번호 매기기 같은 장치는 순서가 정보가 아닌 곳에 쓰지 않았습니다.

### 화면별 메모

| 화면 | 요점 |
|---|---|
| P-1 로그인 | 히어로가 로고가 아니라 **한 칸 비어 있는 로스터 스트립**. 서비스의 존재 이유를 그대로 보여줍니다 |
| P-2 프로필 설정 | 급수는 **제한이 아니라 정보**(명세 §3.3). 경고 블록을 걷어내고 필드 helper 한 줄로 낮췄습니다 |
| P-3 경기 목록 | 날짜 그룹 + 카드. 헤더에 이번 주 경기 수를 모노로 표기 |
| P-4 경기 상세 | **포지션 보드 11행** + 팀 탭(`SegmentedTab`). 상단에 티어 4종 참가비 요약. 프레임 1120 (스크롤 전제) |
| P-5 예약 신청 | 같은 보드를 **다중 선택** 모드로. 선택 3행 + 참가자 이름 3필드 + 합계 요약. 프레임 1418 |
| P-6 입금 안내 | 카운트다운이 주인공. 계좌는 옮겨 적는 정보라 모노 + 복사 버튼. 입금액은 **합계 + 슬롯별 내역** |
| P-7 내 예약 | 진행중 탭에 RESERVED/PAYMENT_SUBMITTED/APPROVED 3상태 |
| P-8 예약 상세 | 슬롯 목록 + 합계 → 상태 이력 타임라인. **APPROVED에는 취소 버튼을 노출하지 않음**(명세 §P-8). 슬롯 행에 개별 삭제 버튼을 두지 않음 — 부분 취소는 v1 범위 밖이라 가능해 보이면 안 됨 |
| P-9 평가 작성 | 1~5 척도 3개 + 베스트플레이어. 상단에 `1 / 8` 진행 표시 |
| P-10 마이페이지 | 노쇼·정지는 "나만 볼 수 있는 기록"으로 묶어 비공개 규칙을 화면에서도 드러냄. 메뉴에 **문의하기** 상시 노출 — 정지 구제가 어드민 수동이라 이의 제기 경로가 항상 있어야 함(명세 §3.3) |
| P-11 알림함 | 미읽음은 행 배경 대신 **점**으로 표시(배경 틴트가 아이콘 배지 색과 충돌) |

### 화면 작업에서 추가된 것

- 토큰 4개: `color/bg/brand-strong`, `color/bg/kakao`, `color/text/on-kakao`, `color/text/on-brand-strong`
  - 카카오 노랑은 외부 브랜드 규정값이라 primitive `kakao/yellow`·`kakao/label`로 고정 등록했습니다
  - `text/on-brand-strong`는 딥 그린 면이 라이트/다크 모두 어둡기 때문에 **양 모드 모두 흰색**입니다
- 컴포넌트 2개: `RosterStrip`(칸별 BOOLEAN 10개), `Icon/chevron-left`
- `GameCard`에 `일시`·`지역·급수` TEXT 프로퍼티 추가 (목록에서 카드마다 다른 날짜를 넣으려면 필요)
- `TeamSlot` 구조 변경: 정보 행 아래에 `RosterStrip`을 세로로 붙임 *(이후 폐기)*

### 포지션 슬롯 전환에서 추가된 것 (2026-08-02)

- 컴포넌트 1개: `PositionSlot` (variant 3, TEXT 프로퍼티 3 + BOOLEAN 1)
- `GameCard`에 `모집 포지션1`·`모집 포지션2` TEXT + `모집 포지션2 표시` BOOLEAN 추가 — 칩은 `Status=Open` variant에만 존재합니다(마감·취소 카드에 "모집" 칩이 뜨면 모순이므로)
- P-6 입금액에 근거 티어 병기 (`입금액 (야수)` / `17,000원`) — 같은 경기에서도 금액이 달라지므로
- P-8 `희망 팀`/`확정 팀` → `신청 포지션`/`확정 포지션`
- 새 토큰 없음. 기존 `accent/clay`(칩), `bg/brand-subtle`(선택 행·요약)로 해결했습니다

### 다중 슬롯 전환에서 추가된 것 (2026-08-02)

- `PositionSlot`에 `배지 라벨` TEXT 프로퍼티 추가, `나 표시` → `내 신청 표시`로 개명
- P-5에 `Participants` 섹션 — `TextField` 인스턴스 3개, 각 인스턴스에서 `Helper` 노드를 숨겨 96px → 66px로 줄였습니다(인스턴스 내부 노드 visible 토글은 BOOLEAN 프로퍼티 없이도 가능)
- P-6에 `Breakdown` 블록, P-8 `Assignment`를 슬롯 목록으로 전면 교체
- 새 컴포넌트 없음 — 참가자 입력은 `TextField`, 선택 상태는 기존 `PositionSlot` `Selected`를 그대로 씁니다

### 급수 제한 폐지 반영 (2026-08-03, 명세 §3.3)

- **P-2 `LevelNotice` 블록 삭제.** "실제보다 낮게 적으면 참가가 취소될 수 있어요"는 강제되지 않는 규칙을 경고하고 있었습니다. 급수 SelectField의 helper("참가를 막지는 않아요. 주최자가 팀을 짤 때 참고해요")로 대체하고 경고 톤(alert-triangle + warning bg)을 없앴습니다. 프레임 878 → 796
- **P-10 메뉴에 `문의하기` 추가**, `SuspendNote` 문구를 이의 제기 유도로 변경
- **유지:** P-3 급수 필터 칩, GameCard·P-4의 급수 표기. 제한이 아니라 탐색 보조라 남깁니다
- 컴포넌트 변경 없음 — 전부 화면 레벨 수정입니다

---

## 7. 접근성

Light/Dark 각 21쌍, 총 42조합의 명도 대비를 실측해 **전부 WCAG AA(4.5:1)를 통과**시켰습니다. 감사 중 아래 6개 토큰을 조정했습니다.

| 토큰 | 변경 전 → 후 | 사유 |
|---|---|---|
| `text/tertiary` (Light) | gray-400 → gray-500 | 2.59:1 |
| `text/disabled` (Light/Dark) | gray-300/gray-600 → gray-500/gray-400 | 1.25:1 — 사실상 판독 불가 |
| `bg/danger` | red-500 → red-600 | 흰 글씨 4.44:1 |
| `bg/danger-hover` | red-600 → red-700 | 위와 동일 |
| `status/no-show/bg` | red-500 → red-600 | 흰 글씨 4.44:1 |
| `status/expired·cancelled/text` | gray-500 → gray-600 (Light) / gray-400 → gray-300 (Dark) | 4.2:1 |

비활성 상태는 WCAG 예외 대상이지만 3.76:1(Light) / 4.19:1(Dark)까지 올렸습니다.

**전수 감사 결과 (컴포넌트 15종 / variant 83개):** 변수 미바인딩 fill 0 · 미바인딩 stroke 0 · 텍스트 스타일 미적용 0 · 44px 미만 터치 타겟 0 · 이름 없는 노드 0 · 깨진 alias 0 · `ALL_SCOPES` 위반 0 · code syntax 누락 0.

---

## 8. 다음 단계

1. **Figma 라이브러리 게시** → 그 후 INSTANCE_SWAP 프로퍼티 추가
2. **화면 목업 P-1~P-11** — 만든 컴포넌트를 조립
3. **Code Connect 매핑** — Figma 컴포넌트 ↔ React 컴포넌트 연결
4. **React 컴포넌트 구현** — 현재 `src/`에는 토큰만 있고 컴포넌트는 없음
5. **주최자(Host) 화면설계서** → 그에 맞는 컴포넌트 확장

---

## 9. 작업 중 걸린 함정 (재작업 시 주의)

1. **`resize()`는 양축을 FIXED로 만듭니다.** auto-layout에 `resize(w, 10)`을 쓰면 높이가 10px로 고정돼 내용이 잘립니다. `resize()` 뒤에 `primaryAxisSizingMode = 'AUTO'`(또는 `layoutSizingVertical = 'HUG'`)를 반드시 다시 지정하세요. Foundations 스와치 94개와 TextField가 이 문제로 눌렸습니다.
2. **`figma.createFrame()` + `layoutMode` 설정만으로는 자식 프레임이 hug하지 않습니다.** 기본 100px 높이가 남아 행이 부풀어요. append 후 `layoutSizingVertical = 'HUG'`를 명시하세요. GameCard(324→182px), ReservationRow(156→80px)가 이 문제였습니다.
3. **`figma.createAutoLayout()`은 흰색 기본 fill을 가집니다.** 라이트모드에선 배경과 비슷해 안 보이다가 **다크모드에서 흰 카드로 드러납니다.** 구조용 컨테이너는 `fills = []`로 비우세요.
4. **Noto Sans KR에 "Semi Bold"가 없습니다.** `loadFontAsync`가 실패하므로 Bold를 쓰세요.
5. **`combineAsVariants` 후 variant가 전부 (0,0)에 겹칩니다.** 수동 그리드 배치가 필요합니다.
6. **`setBoundVariableForPaint`는 새 paint를 반환합니다.** 반환값을 다시 대입해야 적용됩니다.
7. **Tailwind v4 `@theme`는 미사용 토큰을 트리셰이킹합니다.** 디자인 시스템은 `@theme static`을 쓰고, 빌드 산출물 CSS를 grep해서 실제 방출을 확인하세요.
8. **`setTextStyleIdAsync` 직후 같은 스크립트에서 건 fill 변수 바인딩은 렌더에 반영되지 않습니다.** `node.boundVariables`에는 alias가 정상으로 들어가 있는데 화면에는 fallback 색(생성 시 넘긴 리터럴)이 그려집니다. `PositionSlot`의 "신청 가능"이 회색으로 나온 원인이었습니다. **텍스트 스타일을 바꾼 뒤에는 다음 `use_figma` 호출에서 `fills`를 다시 대입**하세요. 데이터만 보면 정상이라 스크린샷 없이는 못 잡습니다.
