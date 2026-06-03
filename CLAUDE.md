@AGENTS.md

# 알바 급여 관리 앱

역할 기반(사장님/알바생) 아르바이트 급여 관리 웹서비스. DB 없이 LocalStorage만 사용.

## 기술 스택

- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS v4
- LocalStorage (DB 대체)

## 개발 명령어

```bash
npm run dev    # 개발 서버 (localhost:3000)
npm run build  # 프로덕션 빌드
npm run lint   # ESLint
```

## 유저 플로우

```
앱 진입 (/) → 프로필 유무 체크
  → 없음: /onboarding (근무지 설정 → 프로필 설정)
  → 있음: /home (역할별 홈)
```

## 라우트 구조

```
/             # 스마트 리다이렉트
/onboarding   # 온보딩 (2단계: 근무지 → 프로필)
/home         # 역할별 홈 (이번달 급여/근무시간)
/calendar     # 역할별 달력
/management   # 역할별 근무관리
/settings     # 프로필 정보 + 초기화
```

## 파일 구조

```
context/AppContext.tsx      # 전역 상태 (useReducer + localStorage 동기화)
hooks/
  useProfile.ts             # profile, workplace, isBoss, isPartTimer
  useWorkers.ts             # 알바생 CRUD
  useShifts.ts              # 근무 기록 CRUD
  useLocalStorage.ts        # SSR-safe localStorage 훅
lib/
  salary.ts                 # 급여 계산 순수 함수
  dateUtils.ts              # 날짜/금액 포맷 유틸
types/index.ts              # 모든 타입 정의
components/
  layout/BottomNav.tsx      # 하단 탭 네비게이션 (고정)
  layout/ConditionalLayout.tsx  # 온보딩: 풀스크린 / 나머지: main+BottomNav
  onboarding/StepWorkplace.tsx  # 근무지 설정 단계
  onboarding/StepProfile.tsx    # 프로필 설정 단계
  home/BossHome.tsx         # 사장님 홈
  home/PartTimerHome.tsx    # 알바생 홈
  calendar/MonthCalendar.tsx    # 공통 월 캘린더 그리드 (외부 라이브러리 없음)
  management/BossManagement.tsx      # 사장님 근무관리 (알바생+근무 탭)
  management/PartTimerManagement.tsx # 알바생 근무관리 (내 근무만)
  ui/                       # Modal, Button, Input, ConfirmDialog
  workers/WorkerForm.tsx
  shifts/ShiftForm.tsx
```

## 데이터 모델

```ts
Workplace    { id, name, createdAt }
UserProfile  { id, name, role: "boss"|"part-timer", workplaceId, workerId?, hourlyRate?, createdAt }
Worker       { id, name, position, hourlyRate, createdAt }
WorkShift    { id, workerId, date, startTime, endTime, totalHours, breakMinutes, note, createdAt }
```

LocalStorage 키: `alba_workplace`, `alba_profile`, `alba_workers`, `alba_shifts`

## 역할별 뷰 차이

| 메뉴 | 사장님 | 알바생 |
|---|---|---|
| 홈 | 전체 알바생 총 급여 + 개별 카드 | 내 예상 급여 + 근무시간 |
| 달력 | 날짜별 근무한 알바생 뱃지 | 날짜별 내 근무시간 |
| 근무관리 | 알바생 목록 탭 + 근무기록 탭 | 내 근무기록만 |
| 환경설정 | 프로필 정보 + 초기화 | 프로필 정보 + 초기화 |

## 핵심 규칙

- **SSR 안전**: localStorage는 반드시 `useEffect` 안에서만 읽기. `isLoaded: false`일 때 스피너 렌더
- **역할 조건 렌더링**: 모든 페이지에서 `isBoss ? <BossView /> : <PartTimerView />` 패턴
- **알바생 데이터 격리**: `shifts.filter(s => s.workerId === profile.workerId)`
- **알바생 삭제**: `DELETE_WORKER` 액션은 해당 workerId의 shifts도 함께 삭제
- **자정 근무**: `computeHours`에서 `endMin < startMin`이면 `endMin += 1440`
- **시급 최저선**: 2025년 기준 10,030원 이상 강제
