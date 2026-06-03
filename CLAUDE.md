@AGENTS.md

# 알바 급여 관리 앱

LocalStorage 기반 아르바이트 급여 관리 웹서비스. DB 없음.

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

## 프로젝트 구조

```
app/
  dashboard/page.tsx   # 월별 급여 요약 대시보드
  workers/page.tsx     # 알바생 CRUD
  shifts/page.tsx      # 근무 기록 CRUD
  layout.tsx           # AppProvider + Navbar 래핑

context/AppContext.tsx  # 전역 상태 (useReducer + localStorage 동기화)
hooks/
  useWorkers.ts        # 알바생 CRUD 훅
  useShifts.ts         # 근무 기록 CRUD 훅
  useLocalStorage.ts   # SSR-safe localStorage 훅
lib/
  salary.ts            # 급여 계산 순수 함수
  dateUtils.ts         # 날짜/금액 포맷 유틸
types/index.ts         # Worker, WorkShift, WorkerMonthlySummary
components/
  ui/                  # Modal, Button, Input, ConfirmDialog
  layout/Navbar.tsx
  workers/WorkerForm.tsx
  shifts/ShiftForm.tsx
```

## 데이터 모델

```ts
Worker       { id, name, position, hourlyRate, createdAt }
WorkShift    { id, workerId, date, startTime, endTime, totalHours, breakMinutes, note, createdAt }
```

LocalStorage 키: `alba_workers`, `alba_shifts`

## 핵심 규칙

- **SSR 안전**: localStorage는 반드시 `useEffect` 안에서만 읽기. `isLoaded: false`일 때 스켈레톤 렌더
- **알바생 삭제**: `DELETE_WORKER` 액션은 해당 workerId의 shifts도 함께 삭제
- **자정 근무**: `computeHours`에서 `endMin < startMin`이면 `endMin += 1440`
- **시급 최저선**: 2025년 기준 10,030원 이상 입력 강제
- **totalHours**: 시작/종료 시간 또는 직접 입력 모두 최종값을 shift에 저장 (재계산 불필요)
