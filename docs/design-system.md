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
| Figma 컴포넌트 18종 / variant 총 95개 (`TeamSlot` 4개는 폐기 상태로 잔존) | ✅ |
| 코드 토큰 (`src/app/globals.css`) — 다크모드 포함 | ✅ |
| 코드 폰트 (`src/app/layout.tsx`) | ✅ |
| 접근성 대비 감사 (Light/Dark 21쌍) | ✅ 전부 AA 통과 |
| 화면 목업 (P-1~P-11) | ✅ 11개 전부 |
| 리그 어드민 목업 (A-1~A-8) | ✅ 8개 전부 (2026-08-04 v2 재작업) |
| 브랜드 로고 (`🏷 Logo` 페이지 — 컴포넌트 4종) | ✅ 워드마크 `야구해` + 마크 「Y」 확정 → `docs/logo.md` |
| 로고 코드 자산 (`public/*.svg` · `src/app/icon.svg` · `apple-icon.png`) | ✅ 내보내기·연결 완료 |
| **plab 참조 패턴 레이어** (컴포넌트 5종 신규 · 토큰 2종 추가) | ✅ 완료 (2026-08-12) → §6.2 |
| **v2 목업** (`📱 Screens v2` P-1~P-11 · `📱 Admin Screens v2` A-1~A-8) | ✅ 19개 전부. v1은 비교용으로 보존 |
| Code Connect 매핑 | ⬜ 미착수 |
| React 컴포넌트 구현 | ⬜ 미착수 |

---

## 1. 브랜드 · 제약

- **비주얼 방향:** 야구 그라운드 그린. 잔디 그린(`green/500 #17854F`)이 주색, 내야 흙(`clay`)이 보조 악센트.
- **로고:** 자산이 둘입니다 — **워드마크 `야구해`**(글자가 드러나야 하는 곳)와 **마크 「Y」**(정사각·원형에 갇히는 곳). 조형 사양·사용 규격·재현 좌표·코드 자산은 [docs/logo.md](logo.md).
  - 둘 다 **폰트를 기울인 것이 아니라 좌표로 그린 벡터**입니다. 폰트 의존성이 없고 같은 조형(오블리크 10° · 라운드 캡)을 공유합니다.
  - 로고에 쓰는 색은 `green/500` · `green/800` · `gray/0` · `gray/900` 4개뿐입니다. 마크의 야구공·실밥은 흰색의 불투명도 변형이라 새 색이 아닙니다.
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
| `Color` | **Light / Dark** | 59 | bg 11 · text **11** · border 6 · icon 5 · status 16 · feedback 8 · accent 2 |
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
📱 Screens              화면 목업 v1 P-1 ~ P-11 (360×780)   ← 보존용
📱 Screens v2           화면 목업 v2 P-1 ~ P-11             ← 정본 (plab 참조 재설계)
📱 Admin Screens        리그 어드민 목업 v1 A-1 ~ A-8        ← 보존용
📱 Admin Screens v2     리그 어드민 목업 v2 A-1 ~ A-8        ← 정본
🏷 Logo                 로고 + 사용 규격 + 컴포넌트 4종 + 적용 미리보기 + 미채택 아카이브
——— plab 패턴 레이어 ———
DateCell · MatchRow · InfoItem · TextLink · SectionBand
```

**v1을 지우지 않았습니다.** v2가 무엇을 바꿨는지 나란히 놓고 볼 수 있어야 하고, 되돌릴 판단이 남아 있기 때문입니다. v2가 확정되면 v1 두 페이지와 `GameCard (deprecated)`를 함께 정리하세요.

`🏷 Logo` 페이지의 로고 컴포넌트 4종(`Logo/Wordmark`·`Wordmark-Reversed`·`AppIcon`·`Lockup-Horizontal`)은 **컴포넌트 1종 = 페이지 1개 관례를 따르지 않습니다.** 로고는 UI 컴포넌트가 아니라 브랜드 자산이고 규격 문서와 같은 자리에 있어야 하기 때문입니다. 페이지 왼쪽(`x = -1400`)의 `🔩 Masters` 프레임에 원본 벡터가 있고, 모든 시안이 그것의 복제입니다.

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
| 8 | `BottomNav` | Active 7종 — 용병 4탭 + **어드민 3탭**(`Admin-Games`·`Admin-Payments`·`Admin-League`) | 7 | 하단 탭 (역할별) |
| 9 | ~~`GameCard`~~ | ~~Status(Open/Closed/Cancelled)~~ | ~~3~~ | **폐기** → `MatchRow` (§6.2) |
| 10 | `ReservationRow` | HasAction(T/F) | 2 | P-7 리스트 아이템 |
| 11 | `Toast` | Type(Success/Warning/Danger/Info) | 4 | P-1 로그인 실패, P-9 최대 2명 |
| 12 | `Dialog` | Actions(One/Two) | 2 | P-5 제출 실패 다이얼로그 |
| 13 | `EmptyState` | — (액션 표시 BOOLEAN) | 1 | P-3, P-7, P-11 빈 상태 |
| 14 | `Countdown` | Urgency(Normal/Warning/Critical) | 3 | P-6 만료 타이머 (12h/1h 강조) |
| 15 | `RatingScale` | Value(0~5) | 6 | P-9 매너/실력/시간 점수 |
| 16 | ~~`TeamSlot`~~ | ~~State(Available/Selected/Full/Readonly)~~ | ~~4~~ | **폐기** → `PositionSlot` (§5) |
| 17 | `RosterStrip` | 칸별 BOOLEAN 10개 | 1 | P-1 히어로 (그래픽 용도) |
| 18 | `PositionSlot` | State(Empty/Selected/Filled) × `내 신청 표시` BOOLEAN | 3 | P-4 포지션 보드, P-5 슬롯 **다중** 선택 |
| 19 | `AdminRow` | 단일 (배지/메타/화살표 BOOLEAN 3개) | 1 | A-2 홈의 다가오는 경기 목록 |
| 20 | `MatchRow` | Status(Open/Closed/Cancelled) | 3 | P-3 · A-3 경기 목록 행 — `GameCard` 대체 |
| 21 | `DateCell` | State(Default/Selected) × Day(Weekday/Sat/Sun) | 6 | P-3 가로 날짜 피커 |
| 22 | `InfoItem` | 단일 (아이콘 + 라벨 TEXT) | 1 | P-4 경기 정보 2열 그리드 |
| 23 | `TextLink` | 단일 | 1 | P-4 주소 복사·지도 보기, P-6 계좌 복사 |
| 24 | `SectionBand` | 단일 | 1 | 전 화면 섹션 구분 (헤어라인 대체) |

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

## 6.1 리그 어드민 목업 (A-1~A-8)

`📱 Admin Screens` 페이지. 명세는 `docs/screen-design-admin.md` (v2)입니다.

> **2026-08-04 v2 재작업.** 명세가 HOST/ADMIN 2역할에서 **리그당 1계정인 리그 어드민 단일 역할**로 바뀌면서 목업도 다시 만들었습니다. 문의함·문의 상세·유저 관리·유저 상세 4개 화면은 리그 권한을 넘어서므로 **삭제**했고, 로그인과 입금 확인 2개를 새로 만들었습니다. 나머지는 재번호·재구성했습니다.

**같은 디자인 시스템을 그대로 씁니다.** 360dp·44px 터치 타겟·같은 토큰. 데스크톱 콘솔을 만들지 않았으므로 Table·Sidebar 같은 신규 패턴이 없고, **새 토큰은 0개**입니다.

| 화면 | 높이 | 요점 |
|---|---|---|
| A-1 어드민 로그인 | 780 | **카카오 버튼이 없습니다.** 계정이 사람이 아니라 리그에 귀속돼 운영자 교체 시 넘겨받아야 하므로 ID/PW로 분리 |
| A-2 홈 | 780 | 처리 대기 2줄(입금 확인·오늘·내일 경기)이 그대로 진입점. **0건도 숨기지 않고 `0`으로 표시** — 자리가 사라지면 "할 일이 없는 것"과 "기능이 없는 것"이 구분되지 않음 |
| A-3 경기 목록 | 780 | `GameCard` 재사용 + 카드 아래 `입금 확인 N건`을 `text/brand`로. 루트 탭이므로 **뒤로가기 없음** |
| A-4 경기 등록 | 1329 | **일시가 첫 필드.** "며칠에 할 건지"가 이 화면의 첫 질문입니다. 상단에 `직전 경기와 동일하게` — 리그는 같은 구장에서 정기적으로 도는데 매번 11×2 슬롯을 확인시키면 등록 자체가 부담이 됨 |
| A-5 경기 상세 | 1495 | 용병 P-4의 **포지션 보드를 그대로 재사용**. 아래에 예약 카드(= 예약 1건, 슬롯 목록 펼침). 하단 `출석 체크` |
| A-6 입금 확인 ★ | 1568 | **이 페이지의 중심.** 아래 별도 항목 |
| A-7 출석 체크 | 1000 | **슬롯 순서대로** 나열 — 현장에서 보는 건 라인업이므로. 대리 신청분에 `대리` 배지 |
| A-8 리그 설정 | 1005 | 입금 계좌(용병 P-6에 그대로 나가는 값) + 티어별 참가비 4종의 정본 + 계정 |

### A-6 입금 확인의 레이아웃 근거

은행 앱과 **번갈아 보며 대조하는** 화면입니다. 그 전제가 레이아웃을 전부 결정했습니다.

- **카드 제목이 닉네임이 아니라 입금자명입니다.** 은행 내역에 닉네임은 없습니다. 입금자명과 금액을 첫 행 양 끝에 두고, 금액은 `Numeric/Price`(모노 + tabular)로 자릿수를 맞춥니다
- **기본 필터가 전체 경기 합산, 정렬은 신청 시각순.** 은행 내역은 경기 단위로 오지 않으므로, 이름 하나를 찾자고 경기를 옮겨 다니게 하면 안 됩니다
- **`RESERVED`(아직 입금 전)도 같은 화면에 있습니다.** 입금은 했는데 앱에서 체크를 잊은 사람을 찾을 데가 있어야 합니다. `아직 입금 전` 섹션으로 분리하고 만료 임박 건은 `feedback/warning/text`로
- **버튼이 `승인`이 아니라 `입금 완료`입니다.** 어드민의 판단은 돈이 들어왔는지 하나뿐이고, 확인되면 곧 확정입니다. 사람을 심사하는 화면이 아니라 장부를 맞추는 화면이라는 게 문구에서 드러나야 합니다
- **0원 예약**(포수 무료)은 `입금 불필요` 배지 + `거절` 버튼 없이 최상단에. 배지는 `feedback/info` 쌍을 쓰는 소형 프레임으로, A-7의 `대리` 배지와 같은 패턴입니다

### `PositionSlot` Empty 변형의 어드민 오버라이드

용병 화면에서 `Empty`는 **"신청 가능"(brand + chevron)** 입니다 — 탭하면 신청으로 가는 진입점이니까요. 어드민은 빈 슬롯을 탭할 수 없으므로 그대로 쓰면 있지도 않은 액션을 광고하게 됩니다. A-5에서는 인스턴스 단위로:

- 값 → `비어 있음`, 텍스트 fill을 `text/tertiary`로 오버라이드
- 내부 chevron 노드를 `visible = false`

컴포넌트에 `Readonly` variant를 추가하지 않은 이유: 상태가 늘어나는 게 아니라 **같은 상태를 다른 역할이 다르게 볼 뿐**이고, 지금 쓰이는 곳이 A-5 한 곳입니다. 어드민 화면이 더 늘면 variant로 승격하세요.

### 하단 탭

**v1의 "라벨만 덮어쓰기"를 폐기하고 `BottomNav`에 정식 변형 3개를 추가했습니다.** 어드민은 경기 · 입금 확인 · 리그 3탭이고 아이콘은 `calendar` · `banknote` · `users`입니다.

`Role`(Player/Admin) 프로퍼티를 새로 만들지 않고 **`Active` 단일 프로퍼티에 값 3개를 더한** 이유: Active 값이 역할마다 다르므로 두 프로퍼티로 쪼개면 `Role=Admin, Active=MyPage` 같은 존재하지 않는 조합이 생기고 변형 피커가 "이 조합은 없습니다" 상태에 빠집니다. 단일 프로퍼티 7변형이면 유효하지 않은 조합 자체가 없습니다.

---

## 6.2 plab 참조 재설계 (v2, 2026-08-12)

플랩풋볼 **실제 앱**(App Store 스크린샷)을 레퍼런스로 19개 화면을 다시 만들었습니다. **레이아웃·패턴만 가져오고 컬러는 야구해 그린을 유지**했습니다 — 로고·162개 토큰·접근성 감사가 전부 그린 위에 서 있어서, 파랑으로 가면 브랜드 전체를 되돌려야 합니다.

### 가져온 것

| plab 패턴 | 우리 반영 | 대체한 v1 방식 |
|---|---|---|
| 섹션을 헤어라인이 아니라 **회색 띠**로 끊음 | `SectionBand` (높이 `spacing/sm`, `bg/subtle`) | 헤어라인 구분선 |
| 목록 상단 **가로 날짜 피커** | `DateCell` 6변형 + P-3 스트립 | P-3 날짜 그룹 구분선 |
| 행 좌측에 **시간이 주인공**, 우측에 상태 pill | `MatchRow` | `GameCard` (카드 + 그림자) |
| **드롭다운형 필터 칩** (`내 지역▾`) | 기존 `FilterChip` 그대로 — 이미 `Chevron` 자식이 있었음 | 변경 없음 |
| 상세 상단 **일시 → 구장명 → 주소 + 텍스트 링크** | P-4 블록 1 + `TextLink` | 표 형태 정보 나열 |
| **2열 아이콘 정보 그리드** (「매치 포인트」) | `InfoItem` × 4, P-4 | 세로 나열 |
| 그림자 없이 구분선·밴드로만 구조 | 전 화면 | `Elevation/Card` 사용 |

### 가져오지 않은 것 (의도적)

| plab 요소 | 뺀 이유 |
|---|---|
| **아이콘 카테고리 레일** (얼리버드·세미프로…) | 우리에겐 대응하는 분류 데이터가 없습니다. 빈 껍데기 컴포넌트를 만들면 화면이 레퍼런스를 흉내 내는 것 이상이 못 됩니다 |
| **프로모 배너** | 넣을 프로모 콘텐츠가 명세에 없습니다. 자리만 잡아 두면 목업이 실제보다 풍성해 보여 판단을 흐립니다 |
| **구장 사진 캐러셀** | 명세에 `구장 사진` 필드가 없습니다. plab 상세 화면을 시각적으로 규정하는 요소라 아쉽지만, **데이터 필드를 새로 만드는 건 제품 결정**이라 임의로 넣지 않았습니다 → 아래 |
| **파랑 액센트** | §6.2 서두 참고 |

> **⚠️ 구장 사진은 확인이 필요합니다.** plab 상세 화면의 인상은 절반이 사진에서 옵니다. 우리 P-4는 사진 없이 텍스트로 시작하므로 같은 밀도가 나오지 않습니다. `venue_image` 필드를 추가할지 결정해주세요 — 추가한다면 P-4 블록 1 위가 자리입니다.

### 신규 토큰 2종

`color/text/saturday`(Light `blue/500` / Dark `blue/300`) · `color/text/sunday`(Light `red/600` / Dark `red/300`).

**브랜드 색이 아니라 한국 달력 관례입니다**(토=파랑·일=빨강). 날짜를 표시하는 곳에만 쓰고, 그 외에는 쓰지 않습니다. `scopes = ['TEXT_FILL']`로 제한해 뒀습니다. 일요일에 `red/500`이 아니라 `red/600`을 쓴 것은 `red/500`이 흰 배경에서 4.44:1로 AA에 못 미치기 때문입니다 — `bg/danger`에 했던 조정과 같은 이유입니다.

### Button에 `Size=Small`을 추가하지 않은 이유

plab의 행 우측 pill(`신청가능`·`마감임박`)은 버튼처럼 보이지만 **별도 컨트롤이 아닙니다.** 행 전체가 탭 타깃이고 pill은 상태 표시입니다. 32px짜리 Small 버튼을 만들면 44px 터치 타깃 규칙(§2-3)을 깨면서 있지도 않은 액션을 광고하게 됩니다. 그래서 `MatchRow`가 pill을 직접 들고 갑니다.

**같은 이유로 `ReservationRow`의 `입금하기` 액션 표시는 손보지 않았습니다** — 다만 그쪽은 아직 아웃라인 버튼처럼 보입니다. P-7 행 전체가 P-6으로 가는 진입점이므로, 다음 손볼 때 pill로 바꾸는 게 맞습니다.

### v2에서 바뀐 화면 논지

- **P-3**: 행에서 날짜가 사라졌습니다. `DateCell` 스트립으로 하루를 고르고 들어오므로 행마다 날짜를 반복할 이유가 없습니다. 같은 폭에 카드 3장 대신 행 4개가 들어갑니다
- **P-4**: 참가비 티어 4종을 4열 그리드로 짰다가 **금액이 잘려서** 명세대로 한 줄(`투수 13,000 · 포수 무료 · …`)로 되돌렸습니다. `무료`만 `setRangeFills`로 부분 강조합니다
- **P-7**: `ReservationRow`의 카드 스타일(라운드 + 테두리)을 인스턴스에서 평탄화해 P-3의 행 언어와 통일했습니다

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

### v2 재감사 (2026-08-12, 19화면)

**자동 검사:** 부모 밖으로 넘친 노드 0 · 미바인딩 fill 0 · 텍스트 스타일 미적용 0. (눈으로 보면 놓칩니다 — P-4 참가비가 잘린 건 스크린샷으로, 나머지는 스크립트 검사로 잡았습니다.)

**대비 실측에서 3건이 AA 미달로 나와 고쳤습니다.**

| 조합 | 실측 | 조치 |
|---|---|---|
| `text/tertiary` / `bg/muted` (`MatchRow` 마감 pill) | 4.20 (L) · 4.19 (D) | pill 라벨을 `text/secondary`로 → **6.70 / 6.93** |
| `text/tertiary` / `bg/subtle` (회색 박스 안 라벨) | 4.44 (L) | 해당 텍스트 19곳을 `text/secondary`로 → **7.08 / 11.37** |

`text/tertiary` 토큰 자체는 건드리지 않았습니다. 흰 배경에서는 통과하고, 회색 면 위에서만 부족한 것이라 **토큰을 낮추면 v1 화면 전체가 흔들립니다.** 회색 면 위 라벨은 `text/secondary`를 쓰는 것으로 규칙을 정했습니다.

**신규 토큰 2종은 양 모드 전부 통과:** `text/saturday` 5.08 / 6.06 · `text/sunday` 6.10 / 5.23.

---

## 8. 다음 단계

1. **Figma 라이브러리 게시** → 그 후 INSTANCE_SWAP 프로퍼티 추가
2. ~~**화면 목업 P-1~P-11**~~ → 완료. v2로 재설계 (§6.2)
3. **Code Connect 매핑** — Figma 컴포넌트 ↔ React 컴포넌트 연결
4. **React 컴포넌트 구현** — 현재 `src/`에는 토큰만 있고 컴포넌트는 없음
5. ~~**주최자(Host) 화면설계서**~~ → 완료 (`docs/screen-design-admin.md` v2, 목업 A-1~A-8)
6. ~~**`BottomNav` 역할별 확장**~~ → 완료. `Active`에 어드민 3변형 추가 (§6.1)
7. **서비스 운영자(플랫폼 관리자) 화면** — 유저 정지 해제·문의 처리는 리그 어드민 권한 밖입니다. 역할이 확정되면 별도 페이지로 (어드민 명세 §6-1)
8. ~~**로고 확정 → SVG 내보내기 → 코드 반영**~~ → 완료. A안 확정, `public/` SVG 4종 + `src/app/icon.svg` + `apple-icon.png` 연결 ([docs/logo.md](logo.md) §5)
9. **로고 React 컴포넌트** — `currentColor` 인라인 SVG. `src/`에 컴포넌트 레이어가 생기는 시점에 4번과 함께
10. **구장 사진(`venue_image`) 도입 여부 결정** — P-4 상세의 밀도를 좌우합니다 (§6.2)
11. **v1 목업 정리** — v2 확정 후 `📱 Screens` · `📱 Admin Screens` · `GameCard (deprecated)` 삭제
12. **`ReservationRow` 액션 표시를 pill로** — 지금은 아웃라인 버튼처럼 보여 별도 탭 타깃으로 오독될 여지 (§6.2)

---

## 9. 작업 중 걸린 함정 (재작업 시 주의)

1. **`resize()`는 양축을 FIXED로 만듭니다.** auto-layout에 `resize(w, 10)`을 쓰면 높이가 10px로 고정돼 내용이 잘립니다. `resize()` 뒤에 `primaryAxisSizingMode = 'AUTO'`(또는 `layoutSizingVertical = 'HUG'`)를 반드시 다시 지정하세요. Foundations 스와치 94개와 TextField가 이 문제로 눌렸습니다.
2. **`figma.createFrame()` + `layoutMode` 설정만으로는 자식 프레임이 hug하지 않습니다.** 기본 100px 높이가 남아 행이 부풀어요. append 후 `layoutSizingVertical = 'HUG'`를 명시하세요. GameCard(324→182px), ReservationRow(156→80px)가 이 문제였습니다.
3. **`figma.createAutoLayout()`은 흰색 기본 fill을 가집니다.** 라이트모드에선 배경과 비슷해 안 보이다가 **다크모드에서 흰 카드로 드러납니다.** 구조용 컨테이너는 `fills = []`로 비우세요.
4. **Noto Sans KR에 "Semi Bold"가 없습니다.** `loadFontAsync`가 실패하므로 Bold를 쓰세요.
5. **`combineAsVariants` 후 variant가 전부 (0,0)에 겹칩니다.** 수동 그리드 배치가 필요합니다.
6. **`setBoundVariableForPaint`는 새 paint를 반환합니다.** 반환값을 다시 대입해야 적용됩니다.
7. **Tailwind v4 `@theme`는 미사용 토큰을 트리셰이킹합니다.** 디자인 시스템은 `@theme static`을 쓰고, 빌드 산출물 CSS를 grep해서 실제 방출을 확인하세요.
8. **`setTextStyleIdAsync` 직후 같은 스크립트에서 건 fill 변수 바인딩은 렌더에 반영되지 않습니다.** `node.boundVariables`에는 alias가 정상으로 들어가 있는데 화면에는 fallback 색(생성 시 넘긴 리터럴)이 그려집니다. `PositionSlot`의 "신청 가능"이 회색으로 나온 원인이었습니다. 데이터만 보면 정상이라 스크린샷 없이는 못 잡습니다. → **9번이 근본 해법입니다.**
9. **`setBoundVariableForPaint`에 넘기는 리터럴 색을 `{0,0,0}`으로 두지 마세요.** 8번의 fallback이 걸리는 순간 그 리터럴이 그대로 그려집니다. 변수의 현재 모드 값을 먼저 풀어서 리터럴로 넣으면 바인딩이 렌더되든 fallback이 걸리든 **양쪽 다 올바른 색**이 나옵니다. 어드민 v2 작업은 아래 헬퍼로 전 화면을 통과시켰습니다(미바인딩 fill 0개).

   ```js
   async function resolveColor(v) {                    // alias 체인을 끝까지 따라감
     let cur = v, guard = 0;
     while (guard++ < 10) {
       const col = await figma.variables.getVariableCollectionByIdAsync(cur.variableCollectionId);
       const val = cur.valuesByMode[col.defaultModeId];
       if (val && val.type === 'VARIABLE_ALIAS') { cur = await figma.variables.getVariableByIdAsync(val.id); continue; }
       return val;
     }
   }
   async function P(name) {                            // 리터럴 + 바인딩을 함께 가진 paint
     const c = await resolveColor(V[name]);
     return figma.variables.setBoundVariableForPaint(
       { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', V[name]);
   }
   ```

10. **`setSharedPluginData`의 네임스페이스는 3자 이상**이어야 합니다. 2자를 넘기면 `The namespace must be at least 3 characters`로 스크립트 전체가 실패합니다(`use_figma`는 원자적이라 아무것도 생성되지 않습니다).
11. **COMPONENT_SET에 variant를 `appendChild`해도 세트 경계가 자동으로 늘어나지 않습니다.** 새 변형이 세트 밖으로 삐져나가고 스크린샷에서 잘립니다. 자식들의 `x + width` / `y + height` 최댓값을 구해 `set.resize(maxR + 32, maxB + 32)`로 직접 맞추세요.
12. **`relativeTransform`으로 전단(shear)을 걸 수 없습니다.** Figma Plugin API는 회전·이동만 지원합니다. 오블리크 로고처럼 기울어진 형태는 경로 데이터에 좌표로 구워 넣어야 합니다. 베지어는 아핀 변환 하에서 제어점만 옮기면 정확히 변환되므로 라운드 코너·타원도 깨지지 않습니다. (로고 작업 — `docs/logo.md` §6)
13. **`counterAxisAlignItems`에 `'STRETCH'`가 없습니다.** `'MIN' | 'MAX' | 'CENTER' | 'BASELINE'`뿐입니다. 자식을 늘리려는 것이었다면 자식 쪽 `layoutAlign`/`layoutSizing*`을 씁니다.
15. **높이가 AUTO인 프레임에 `layoutSizingVertical = 'FILL'` 자식을 두면 측정이 깨집니다.** P-2에서 푸터가 프레임 높이 밖(y=805, 높이 892)으로 밀려 잘렸는데, 자식 좌표는 정상이라 스크린샷으로만 잡힙니다. 순서를 지키세요 — **먼저 AUTO로 측정 → 뷰포트보다 짧으면 `resize()`로 FIXED 전환 → 그때 스페이서를 FILL로.** 콘텐츠가 뷰포트보다 길면 스페이서를 아예 빼야 합니다.
16. **`query()` 셀렉터 값에 `/`를 넣을 수 없습니다.** `query('INSTANCE[name^=Row/]')`는 `unexpected character '/'`로 실패합니다. `findAll(n => n.name.startsWith('Row/'))`를 쓰세요.
17. **`setCurrentPageAsync` 전에는 그 페이지의 `children`이 비어 보일 수 있습니다.** 다른 페이지의 자식을 필터링해 지우는 코드가 조용히 아무것도 안 지웁니다(어드민 페이지의 떠돌이 프레임이 이렇게 살아남았습니다). 대상 페이지로 전환한 뒤에 조작하세요.
18. **`createAutoLayout`으로 만든 프레임을 어디에도 붙이지 않으면 현재 페이지의 최상위 자식으로 남습니다.** 화면 밖에 떠돌이 프레임이 생깁니다. 페이지 자식 목록을 한 번씩 검사하세요.
14. **`remove()`한 노드는 되살릴 수 없습니다.** 프레임 높이를 콘텐츠에 맞추려고 FILL Spacer를 잠깐 지웠다가 다시 넣는 건 불가능합니다(`insertChild`가 "node does not exist"로 실패). 대신 **Spacer를 접었다 펴세요** — `layoutSizingVertical = 'FIXED'` → `resize(w, 1)` → 부모를 `primaryAxisSizingMode = 'AUTO'`로 측정 → 다시 `'FIXED'` + `resize` → Spacer를 `'FILL'`로 복구.
