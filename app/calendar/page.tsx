"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useShifts } from "@/hooks/useShifts";
import { useWorkers } from "@/hooks/useWorkers";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import { toYearMonth, formatYearMonth, prevMonth, nextMonth } from "@/lib/dateUtils";
import { getWorkplaceColor } from "@/lib/workplaceColors";

export default function CalendarPage() {
  const { profile, isLoaded, isBoss, workplaces } = useProfile();
  const { shifts } = useShifts();
  const { workers } = useWorkers();
  const router = useRouter();
  const [yearMonth, setYearMonth] = useState(toYearMonth());

  useEffect(() => {
    if (isLoaded && !profile) router.replace("/onboarding");
  }, [isLoaded, profile, router]);

  if (!isLoaded) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!profile) return null;

  const workerMap = Object.fromEntries(workers.map((w) => [w.id, w]));

  // 근무지 index → 색상 매핑
  const workplaceColorMap: Record<string, { bg: string; text: string }> = {};
  workplaces.forEach((wp, i) => {
    workplaceColorMap[wp.id] = getWorkplaceColor(i);
  });
  const defaultColor = getWorkplaceColor(0);

  const getColor = (workplaceId?: string) =>
    workplaceId ? (workplaceColorMap[workplaceId] ?? defaultColor) : defaultColor;

  // 사장님: 날짜별 근무한 알바생 (근무지별 색상)
  const bossCell = (date: string) => {
    const dayShifts = shifts.filter((s) => s.date === date);
    if (dayShifts.length === 0) return null;
    const shown = dayShifts.slice(0, 3);
    const rest = dayShifts.length - shown.length;
    return (
      <div className="flex flex-col gap-0.5">
        {shown.map((s) => {
          const { bg, text } = getColor(s.workplaceId);
          return (
            <span key={s.id} className={`text-[9px] ${bg} ${text} rounded px-1 leading-4 truncate block`}>
              {workerMap[s.workerId]?.name ?? "?"}
            </span>
          );
        })}
        {rest > 0 && <span className="text-[9px] text-gray-400">+{rest}</span>}
      </div>
    );
  };

  // 알바생: 날짜별 근무지별 시간 (근무지별 색상)
  const ptCell = (date: string) => {
    const myWorkerIds = workers
      .filter((w) => w.id === profile.workerId || (!profile.workerId && w.name === profile.name))
      .map((w) => w.id);

    const dayShifts = shifts.filter(
      (s) => s.date === date && myWorkerIds.includes(s.workerId)
    );
    if (dayShifts.length === 0) return null;

    // 근무지별 그룹핑
    const byWorkplace: Record<string, number> = {};
    dayShifts.forEach((s) => {
      const key = s.workplaceId ?? workplaces[0]?.id ?? "__none__";
      byWorkplace[key] = (byWorkplace[key] ?? 0) + s.totalHours;
    });

    const entries = Object.entries(byWorkplace);

    if (entries.length === 1) {
      const [[wpId, hrs]] = entries;
      const { bg, text } = getColor(wpId === "__none__" ? undefined : wpId);
      return (
        <span className={`text-[9px] ${bg} ${text} rounded px-1 leading-4 block text-center`}>
          {hrs.toFixed(1)}h
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-0.5">
        {entries.map(([wpId, hrs]) => {
          const realId = wpId === "__none__" ? undefined : wpId;
          const { bg, text } = getColor(realId);
          return (
            <span key={wpId} className={`text-[9px] ${bg} ${text} rounded px-1 leading-4 block text-center`}>
              {hrs.toFixed(1)}h
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">달력</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setYearMonth(prevMonth(yearMonth))} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">‹</button>
          <span className="text-xs font-semibold text-gray-700 w-20 text-center">{formatYearMonth(yearMonth)}</span>
          <button onClick={() => setYearMonth(nextMonth(yearMonth))} disabled={yearMonth === toYearMonth()} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">›</button>
        </div>
      </div>

      {/* 근무지 색상 범례 */}
      {workplaces.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {workplaces.map((wp, i) => {
            const { bg, text } = getWorkplaceColor(i);
            return (
              <span key={wp.id} className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${bg} ${text}`}>
                {wp.name}
              </span>
            );
          })}
        </div>
      )}

      <MonthCalendar
        yearMonth={yearMonth}
        cellContent={isBoss ? bossCell : ptCell}
      />
    </div>
  );
}
