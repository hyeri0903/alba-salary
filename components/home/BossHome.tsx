"use client";

import { useState } from "react";
import { useWorkers } from "@/hooks/useWorkers";
import { useShifts } from "@/hooks/useShifts";
import { useProfile } from "@/hooks/useProfile";
import { buildMonthlySummaries } from "@/lib/salary";
import { toYearMonth, formatYearMonth, prevMonth, nextMonth, formatCurrency } from "@/lib/dateUtils";
import WorkplaceHeader from "./WorkplaceHeader";

export default function BossHome() {
  const { activeWorkplace } = useProfile();
  const { workers } = useWorkers();
  const { shifts } = useShifts();
  const [yearMonth, setYearMonth] = useState(toYearMonth());
  const [workplaceModalOpen, setWorkplaceModalOpen] = useState(false);

  const summaries = buildMonthlySummaries(workers, shifts, yearMonth);
  const totalSalary = summaries.reduce((s, x) => s + x.totalSalary, 0);
  const totalHours = summaries.reduce((s, x) => s + x.totalHours, 0);
  const isCurrentMonth = yearMonth === toYearMonth();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <WorkplaceHeader open={workplaceModalOpen} onOpenChange={setWorkplaceModalOpen} />
          <h1 className="text-lg font-bold text-gray-900 mt-0.5">이번 달 현황</h1>
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
          <p className="text-xs font-medium opacity-80">예상 총 급여</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(totalSalary)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-medium text-gray-500">총 근무시간</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{totalHours.toFixed(1)}h</p>
        </div>
      </div>

      {workers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-400 text-sm">근무관리 메뉴에서 알바생을 추가해주세요</p>
        </div>
      ) : summaries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-400 text-sm">{formatYearMonth(yearMonth)} 근무 기록이 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-700">알바생별 현황</h2>
          {summaries.map(({ worker, totalHours, totalSalary, shiftCount }) => (
            <div key={worker.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{worker.name}</span>
                  <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full font-medium">
                    {worker.position}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{shiftCount}회 · {totalHours.toFixed(1)}시간</p>
              </div>
              <p className="text-sm font-bold text-indigo-600">{formatCurrency(totalSalary)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
