"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useShifts } from "@/hooks/useShifts";
import { useWorkers } from "@/hooks/useWorkers";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import { toYearMonth, formatYearMonth, prevMonth, nextMonth } from "@/lib/dateUtils";

export default function CalendarPage() {
  const { profile, isLoaded, isBoss } = useProfile();
  const { shifts } = useShifts();
  const { workers } = useWorkers();
  const router = useRouter();
  const [yearMonth, setYearMonth] = useState(toYearMonth());

  useEffect(() => {
    if (isLoaded && !profile) router.replace("/onboarding");
  }, [isLoaded, profile, router]);

  if (!isLoaded) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return null;

  const workerMap = Object.fromEntries(workers.map((w) => [w.id, w]));

  const bossCell = (date: string) => {
    const dayShifts = shifts.filter((s) => s.date === date);
    if (dayShifts.length === 0) return null;
    const shown = dayShifts.slice(0, 2);
    const rest = dayShifts.length - shown.length;
    return (
      <div className="flex flex-col gap-0.5">
        {shown.map((s) => (
          <span key={s.id} className="text-[9px] bg-indigo-100 text-indigo-700 rounded px-1 leading-4 truncate block">
            {workerMap[s.workerId]?.name ?? "?"}
          </span>
        ))}
        {rest > 0 && <span className="text-[9px] text-gray-400">+{rest}</span>}
      </div>
    );
  };

  const ptCell = (date: string) => {
    const dayShifts = shifts.filter(
      (s) => s.date === date && s.workerId === profile.workerId
    );
    if (dayShifts.length === 0) return null;
    const hrs = dayShifts.reduce((s, x) => s + x.totalHours, 0);
    return (
      <span className="text-[9px] bg-indigo-100 text-indigo-700 rounded px-1 leading-4 block text-center">
        {hrs.toFixed(1)}h
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">달력</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYearMonth(prevMonth(yearMonth))}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >‹</button>
          <span className="text-xs font-semibold text-gray-700 w-20 text-center">
            {formatYearMonth(yearMonth)}
          </span>
          <button
            onClick={() => setYearMonth(nextMonth(yearMonth))}
            disabled={yearMonth === toYearMonth()}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >›</button>
        </div>
      </div>

      <MonthCalendar
        yearMonth={yearMonth}
        cellContent={isBoss ? bossCell : ptCell}
      />
    </div>
  );
}
