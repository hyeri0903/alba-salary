"use client";

import { useState } from "react";
import { useWorkers } from "@/hooks/useWorkers";
import { useShifts } from "@/hooks/useShifts";
import { buildMonthlySummaries } from "@/lib/salary";
import {
  toYearMonth,
  formatYearMonth,
  prevMonth,
  nextMonth,
  formatCurrency,
} from "@/lib/dateUtils";

export default function DashboardPage() {
  const { workers, isLoaded } = useWorkers();
  const { shifts } = useShifts();
  const [yearMonth, setYearMonth] = useState(toYearMonth());

  const summaries = buildMonthlySummaries(workers, shifts, yearMonth);
  const totalSalary = summaries.reduce((s, x) => s + x.totalSalary, 0);
  const totalHours = summaries.reduce((s, x) => s + x.totalHours, 0);

  const isCurrentMonth = yearMonth === toYearMonth();

  if (!isLoaded) {
    return <div className="text-center text-gray-400 py-20">불러오는 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYearMonth(prevMonth(yearMonth))}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-gray-800 w-24 text-center">
            {formatYearMonth(yearMonth)}
          </span>
          <button
            onClick={() => setYearMonth(nextMonth(yearMonth))}
            disabled={isCurrentMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            예상 총 급여
          </p>
          <p className="text-2xl font-bold text-indigo-600">
            {formatCurrency(totalSalary)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            총 근무 시간
          </p>
          <p className="text-2xl font-bold text-gray-800">
            {totalHours.toFixed(1)}시간
          </p>
        </div>
      </div>

      {workers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">
            알바생을 먼저 등록해주세요
          </p>
        </div>
      ) : summaries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">
            {formatYearMonth(yearMonth)}의 근무 기록이 없습니다
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">이름</th>
                <th className="px-5 py-3">직책</th>
                <th className="px-5 py-3 text-center">근무 횟수</th>
                <th className="px-5 py-3 text-center">총 시간</th>
                <th className="px-5 py-3 text-right">시급</th>
                <th className="px-5 py-3 text-right">예상 급여</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {summaries.map(({ worker, totalHours, totalSalary, shiftCount }) => (
                <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {worker.name}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-medium">
                      {worker.position}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 text-center">
                    {shiftCount}회
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 text-center">
                    {totalHours.toFixed(1)}시간
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 text-right">
                    {formatCurrency(worker.hourlyRate)}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-indigo-600 text-right">
                    {formatCurrency(totalSalary)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50">
                <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-gray-700">
                  합계
                </td>
                <td />
                <td className="px-5 py-3 text-sm font-bold text-indigo-700 text-right">
                  {formatCurrency(totalSalary)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
