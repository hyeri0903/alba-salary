"use client";

import { useState } from "react";
import { useWorkers } from "@/hooks/useWorkers";
import { useShifts } from "@/hooks/useShifts";
import { useProfile } from "@/hooks/useProfile";
import { useAppContext } from "@/context/AppContext";
import { Workplace } from "@/types";
import { buildMonthlySummaries, getMonthlyShifts } from "@/lib/salary";
import { toYearMonth, formatYearMonth, prevMonth, nextMonth, formatCurrency } from "@/lib/dateUtils";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import WorkplaceCardMenu from "./WorkplaceCardMenu";

export default function BossHome() {
  const { workplaces, activeWorkplace, setActiveWorkplace } = useProfile();
  const { workers } = useWorkers();
  const { shifts } = useShifts();
  const { dispatch } = useAppContext();
  const [yearMonth, setYearMonth] = useState(toYearMonth());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const isCurrentMonth = yearMonth === toYearMonth();

  // 근무지별 월 집계 계산
  const getWorkplaceStats = (wpId: string) => {
    const wpShifts = getMonthlyShifts(
      shifts.filter((s) =>
        s.workplaceId === wpId || (!s.workplaceId && wpId === workplaces[0]?.id)
      ),
      yearMonth
    );
    const summaries = buildMonthlySummaries(workers, wpShifts, yearMonth);
    const totalSalary = summaries.reduce((s, x) => s + x.totalSalary, 0);
    const totalHours = summaries.reduce((s, x) => s + x.totalHours, 0);
    return { totalSalary, totalHours, summaries };
  };

  const handleAddWorkplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setNameError("근무지 이름을 입력해주세요"); return; }
    const wp: Workplace = { id: crypto.randomUUID(), name: newName.trim(), createdAt: new Date().toISOString() };
    dispatch({ type: "ADD_WORKPLACE", workplace: wp });
    setNewName(""); setNameError("");
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">사업장 현황</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setYearMonth(prevMonth(yearMonth))} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">‹</button>
          <span className="text-xs font-semibold text-gray-700 w-20 text-center">{formatYearMonth(yearMonth)}</span>
          <button onClick={() => setYearMonth(nextMonth(yearMonth))} disabled={isCurrentMonth} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">›</button>
        </div>
      </div>

      {workplaces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-10 text-center">
          <p className="text-gray-400 text-sm">등록된 근무지가 없습니다</p>
          <p className="text-gray-400 text-xs mt-1">아래 버튼으로 근무지를 추가해보세요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {workplaces.map((wp) => {
            const isActive = wp.id === activeWorkplace?.id;
            const { totalSalary, totalHours, summaries } = getWorkplaceStats(wp.id);
            return (
              <div
                key={wp.id}
                onClick={() => setActiveWorkplace(wp.id)}
                className={`w-full text-left rounded-2xl border p-5 transition-all cursor-pointer ${
                  isActive
                    ? "border-indigo-500 bg-white shadow-sm ring-1 ring-indigo-200"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{wp.name}</span>
                    {isActive && (
                      <span className="bg-indigo-100 text-indigo-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">현재</span>
                    )}
                  </div>
                  <WorkplaceCardMenu workplace={wp} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-[10px] text-indigo-400 font-medium">예상 총 급여</p>
                    <p className="text-sm font-bold text-indigo-700 mt-0.5">{formatCurrency(totalSalary)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-medium">총 근무시간</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{totalHours.toFixed(1)}h</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-medium">알바생</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{summaries.length}명</p>
                  </div>
                </div>

                {summaries.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                    {summaries.map(({ worker, totalHours, totalSalary }) => (
                      <div key={worker.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-700">{worker.name}</span>
                          <span className="text-gray-400">{worker.position}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>{totalHours.toFixed(1)}h</span>
                          <span className="font-semibold text-indigo-600">{formatCurrency(totalSalary)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setIsAddOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors text-gray-500 font-medium text-sm"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
        </svg>
        근무지 추가
      </button>

      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setNameError(""); }} title="근무지 추가">
        <form onSubmit={handleAddWorkplace} className="flex flex-col gap-4">
          <Input label="근무지 이름" value={newName} onChange={(e) => { setNewName(e.target.value); setNameError(""); }} placeholder="예: 스타벅스 강남점" error={nameError} />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => { setIsAddOpen(false); setNameError(""); }}>취소</Button>
            <Button type="submit">추가하기</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
