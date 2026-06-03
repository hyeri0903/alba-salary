import { Worker, WorkShift, WorkerMonthlySummary } from "@/types";

export function computeHours(
  start: string,
  end: string,
  breakMinutes: number
): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin < startMin) endMin += 24 * 60; // 자정 넘김 처리
  const worked = endMin - startMin - breakMinutes;
  return Math.max(0, worked / 60);
}

export function computeSalary(hours: number, hourlyRate: number): number {
  return Math.round(hours * hourlyRate);
}

export function getMonthlyShifts(
  shifts: WorkShift[],
  yearMonth: string
): WorkShift[] {
  return shifts.filter((s) => s.date.startsWith(yearMonth));
}

export function buildMonthlySummaries(
  workers: Worker[],
  shifts: WorkShift[],
  yearMonth: string
): WorkerMonthlySummary[] {
  const monthly = getMonthlyShifts(shifts, yearMonth);
  return workers
    .map((worker) => {
      const workerShifts = monthly.filter((s) => s.workerId === worker.id);
      const totalHours = workerShifts.reduce((sum, s) => sum + s.totalHours, 0);
      return {
        worker,
        totalHours,
        totalSalary: computeSalary(totalHours, worker.hourlyRate),
        shiftCount: workerShifts.length,
      };
    })
    .filter((s) => s.shiftCount > 0);
}
