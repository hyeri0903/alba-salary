export interface Worker {
  id: string;
  name: string;
  position: string;
  hourlyRate: number;
  createdAt: string;
}

export interface WorkShift {
  id: string;
  workerId: string;
  workplaceId?: string; // 근무지 (기존 데이터 호환을 위해 optional)
  date: string;        // "YYYY-MM-DD"
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
  totalHours: number;
  breakMinutes: number;
  note: string;
  createdAt: string;
}

export interface WorkerMonthlySummary {
  worker: Worker;
  totalHours: number;
  totalSalary: number;
  shiftCount: number;
}

export interface Workplace {
  id: string;
  name: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: "boss" | "part-timer";
  activeWorkplaceId: string | null;
  workerId?: string;   // part-timer의 Worker id
  hourlyRate?: number; // part-timer 시급 (Worker 생성 전 임시 저장용)
  createdAt: string;
}
