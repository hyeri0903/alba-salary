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
