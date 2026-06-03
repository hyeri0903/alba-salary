"use client";

import { useState } from "react";
import { useShifts } from "@/hooks/useShifts";
import { useProfile } from "@/hooks/useProfile";
import { useWorkers } from "@/hooks/useWorkers";
import { getMonthlyShifts, computeSalary } from "@/lib/salary";
import { toYearMonth, formatYearMonth, prevMonth, nextMonth, formatCurrency } from "@/lib/dateUtils";
import WorkplaceHeader from "./WorkplaceHeader";

export default function PartTimerHome() {
  const { profile, activeWorkplace } = useProfile();
  const { shifts } = useShifts();
  const { workers } = useWorkers();
  const [yearMonth, setYearMonth] = useState(toYearMonth());
  const [workplaceModalOpen, setWorkplaceModalOpen] = useState(false);

  const myShifts = getMonthlyShifts(
    shifts.filter((s) => s.workerId === profile?.workerId),
    yearMonth
  );

  const myWorker = workers.find((w) => w.id === profile?.workerId);
  const hourlyRate = myWorker?.hourlyRate ?? profile?.hourlyRate ?? 0;
  const totalHours = myShifts.reduce((s, x) => s + x.totalHours, 0);
  const totalSalary = computeSalary(totalHours, hourlyRate);
  const isCurrentMonth = yearMonth === toYearMonth();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <WorkplaceHeader open={workplaceModalOpen} onOpenChange={setWorkplaceModalOpen} />
          <h1 className="text-lg font-bold text-gray-900 mt-0.5">
            {profile?.name}님, 안녕하세요 👋
          </h1>
        </div>
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
            disabled={isCurrentMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >›</button>
        </div>
      </div>

      {!activeWorkplace && (
        <button
          onClick={() => setWorkplaceModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors text-gray-500 font-medium text-sm"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
          </svg>
          근무지 추가하기
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-indigo-600 rounded-2xl p-4 text-white">
          <p className="text-xs font-medium opacity-80">예상 급여</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(totalSalary)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-medium text-gray-500">총 근무시간</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{totalHours.toFixed(1)}h</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">시급</span>
          <span className="font-medium text-gray-800">
            {hourlyRate > 0 ? formatCurrency(hourlyRate) : "미설정"}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-500">근무 횟수</span>
          <span className="font-medium text-gray-800">{myShifts.length}회</span>
        </div>
      </div>

      {myShifts.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-400 text-sm">이번 달 근무 기록이 없습니다</p>
        </div>
      )}
    </div>
  );
}
