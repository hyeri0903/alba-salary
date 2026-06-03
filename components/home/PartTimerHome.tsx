"use client";

import { useState } from "react";
import { useShifts } from "@/hooks/useShifts";
import { useProfile } from "@/hooks/useProfile";
import { useWorkers } from "@/hooks/useWorkers";
import { useAppContext } from "@/context/AppContext";
import { Workplace } from "@/types";
import { getMonthlyShifts, computeSalary } from "@/lib/salary";
import { toYearMonth, formatYearMonth, prevMonth, nextMonth, formatCurrency } from "@/lib/dateUtils";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import WorkplaceCardMenu from "./WorkplaceCardMenu";

export default function PartTimerHome() {
  const { profile, workplaces, activeWorkplace, setActiveWorkplace } = useProfile();
  const { shifts } = useShifts();
  const { workers } = useWorkers();
  const { dispatch } = useAppContext();
  const [yearMonth, setYearMonth] = useState(toYearMonth());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const myWorker = workers.find((w) => w.id === profile?.workerId);
  const hourlyRate = myWorker?.hourlyRate ?? profile?.hourlyRate ?? 0;
  const isCurrentMonth = yearMonth === toYearMonth();

  // 근무지별 월 집계 계산
  const getWorkplaceStats = (wpId: string) => {
    const wpShifts = getMonthlyShifts(
      shifts.filter((s) =>
        s.workerId === profile?.workerId &&
        (s.workplaceId === wpId || (!s.workplaceId && wpId === workplaces[0]?.id))
      ),
      yearMonth
    );
    const totalHours = wpShifts.reduce((s, x) => s + x.totalHours, 0);
    return { totalHours, totalSalary: computeSalary(totalHours, hourlyRate) };
  };

  const handleAddWorkplace = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newName.trim()) errs.name = "근무지 이름을 입력해주세요";
    const rate = Number(newRate);
    if (!newRate || isNaN(rate) || rate < 10030) errs.rate = "시급은 10,030원 이상이어야 합니다";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const wp: Workplace = { id: crypto.randomUUID(), name: newName.trim(), createdAt: new Date().toISOString() };
    dispatch({ type: "ADD_WORKPLACE", workplace: wp });
    if (myWorker) dispatch({ type: "UPDATE_WORKER", worker: { ...myWorker, hourlyRate: rate } });
    if (profile) dispatch({ type: "SET_PROFILE", profile: { ...profile, hourlyRate: rate } });

    setNewName(""); setNewRate(""); setErrors({});
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">{profile?.name}님의 근무현황</h1>
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
            const { totalHours, totalSalary } = getWorkplaceStats(wp.id);
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">시급 {hourlyRate > 0 ? formatCurrency(hourlyRate) : "미설정"}</span>
                    <WorkplaceCardMenu
                      workplace={wp}
                      hourlyRate={hourlyRate}
                      onRateChange={(rate) => {
                        if (myWorker) dispatch({ type: "UPDATE_WORKER", worker: { ...myWorker, hourlyRate: rate } });
                        if (profile) dispatch({ type: "SET_PROFILE", profile: { ...profile, hourlyRate: rate } });
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-[10px] text-indigo-400 font-medium">예상 급여</p>
                    <p className="text-base font-bold text-indigo-700 mt-0.5">{formatCurrency(totalSalary)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-medium">총 근무시간</p>
                    <p className="text-base font-bold text-gray-700 mt-0.5">{totalHours.toFixed(1)}h</p>
                  </div>
                </div>
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

      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setErrors({}); }} title="근무지 추가">
        <form onSubmit={handleAddWorkplace} className="flex flex-col gap-4">
          <Input label="근무지 이름" value={newName} onChange={(e) => { setNewName(e.target.value); setErrors({}); }} placeholder="예: 스타벅스 강남점" error={errors.name} />
          <Input label="시급 (원)" type="number" value={newRate} onChange={(e) => { setNewRate(e.target.value); setErrors({}); }} placeholder="10030" min={10030} error={errors.rate} />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => { setIsAddOpen(false); setErrors({}); }}>취소</Button>
            <Button type="submit">추가하기</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
