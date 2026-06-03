"use client";

import { useState, useMemo } from "react";
import { WorkShift, Worker } from "@/types";
import { useShifts } from "@/hooks/useShifts";
import { useWorkers } from "@/hooks/useWorkers";
import { useProfile } from "@/hooks/useProfile";
import { useAppContext } from "@/context/AppContext";
import { formatDate, formatCurrency, toYearMonth, formatYearMonth } from "@/lib/dateUtils";
import { computeSalary } from "@/lib/salary";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ShiftForm from "@/components/shifts/ShiftForm";
import Button from "@/components/ui/Button";

export default function PartTimerManagement() {
  const { profile, workplaces } = useProfile();
  const { shifts, addShift, updateShift, deleteShift } = useShifts();
  const { workers, updateWorker } = useWorkers();
  const { dispatch } = useAppContext();

  const defaultWorkplaceId = workplaces[0]?.id ?? "";
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(defaultWorkplaceId);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WorkShift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkShift | null>(null);
  const [monthFilter, setMonthFilter] = useState(toYearMonth());
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState("");
  const [modalWorker, setModalWorker] = useState<Worker | null>(null);

  const myWorker = workers.find((w) => w.id === profile?.workerId);
  const hourlyRate = myWorker?.hourlyRate ?? profile?.hourlyRate ?? 0;

  const myShifts = useMemo(() =>
    shifts.filter((s) => {
      if (s.workerId !== myWorker?.id) return false;
      return selectedWorkplaceId
        ? (s.workplaceId === selectedWorkplaceId || (!s.workplaceId && selectedWorkplaceId === defaultWorkplaceId))
        : true;
    }), [shifts, myWorker?.id, selectedWorkplaceId, defaultWorkplaceId]);

  const months = Array.from(new Set(myShifts.map((s) => s.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  const allMonths = months.includes(toYearMonth()) ? months : [toYearMonth(), ...months];
  const filtered = myShifts
    .filter((s) => s.date.startsWith(monthFilter))
    .sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      const aTime = a.startTime || a.createdAt;
      const bTime = b.startTime || b.createdAt;
      return bTime.localeCompare(aTime);
    });

  const handleOpenAdd = () => {
    if (myWorker) {
      setModalWorker(myWorker);
    } else {
      const newWorker: Worker = {
        id: crypto.randomUUID(),
        name: profile?.name ?? "나",
        position: "알바생",
        hourlyRate: profile?.hourlyRate ?? 10030,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_WORKER", worker: newWorker });
      if (profile) dispatch({ type: "SET_PROFILE", profile: { ...profile, workerId: newWorker.id } });
      setModalWorker(newWorker);
    }
    setIsAddOpen(true);
  };

  const saveRate = () => {
    const rate = Number(rateInput);
    if (!rateInput || isNaN(rate) || rate < 10030) return;
    if (myWorker) updateWorker({ ...myWorker, hourlyRate: rate });
    setEditingRate(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">내 근무 기록</h1>
        <Button size="sm" onClick={handleOpenAdd}>+ 근무 추가</Button>
      </div>

      {/* 근무지 + 월 필터 */}
      <div className="flex gap-2">
        <select
          value={selectedWorkplaceId}
          onChange={(e) => setSelectedWorkplaceId(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {workplaces.length === 0
            ? <option value="">근무지 없음</option>
            : workplaces.map((wp) => (
              <option key={wp.id} value={wp.id}>{wp.name}</option>
            ))
          }
        </select>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {allMonths.map((m) => (
            <option key={m} value={m}>{formatYearMonth(m)}</option>
          ))}
        </select>
      </div>

      {/* 월별 총 예상 급여 */}
      {(() => {
        const monthTotal = filtered.reduce((sum, s) => sum + computeSalary(s.totalHours, hourlyRate), 0);
        return (
          <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-indigo-600 font-medium">{formatYearMonth(monthFilter)} 총 예상 급여</span>
            <span className="text-base font-bold text-indigo-700">{formatCurrency(monthTotal)}</span>
          </div>
        );
      })()}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-400 text-sm">근무 기록이 없습니다</p>
        </div>
      ) : filtered.map((shift) => {
        const salary = computeSalary(shift.totalHours, hourlyRate);
        return (
          <div key={shift.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900">{formatDate(shift.date)}</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {shift.totalHours.toFixed(1)}시간
                  {shift.startTime && ` · ${shift.startTime}~${shift.endTime}`}
                </p>
                {shift.note && <p className="text-xs text-gray-400">{shift.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-indigo-600">{formatCurrency(salary)}</span>
                <Button variant="ghost" size="sm" onClick={() => { setModalWorker(myWorker ?? null); setEditTarget(shift); }}>수정</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(shift)}>삭제</Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* 근무 추가 모달 */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setEditingRate(false); setModalWorker(null); }} title="근무 추가">
        <div className="flex flex-col gap-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">시급</p>
              {editingRate ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-28 border border-indigo-400 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="10030"
                    min={10030}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") saveRate(); if (e.key === "Escape") setEditingRate(false); }}
                  />
                  <button onClick={saveRate} className="text-xs text-indigo-600 font-semibold">저장</button>
                  <button onClick={() => setEditingRate(false)} className="text-xs text-gray-400">취소</button>
                </div>
              ) : (
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {hourlyRate > 0 ? formatCurrency(hourlyRate) : "미설정"}
                </p>
              )}
            </div>
            {!editingRate && (
              <button
                onClick={() => { setRateInput(String(hourlyRate || "")); setEditingRate(true); }}
                className="text-xs text-indigo-500 font-medium px-3 py-1.5 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                수정
              </button>
            )}
          </div>
          {modalWorker && (
            <ShiftForm
              workers={[modalWorker]}
              onSubmit={(data) => { addShift({ ...data, workplaceId: selectedWorkplaceId }); setIsAddOpen(false); setEditingRate(false); setModalWorker(null); }}
              onCancel={() => { setIsAddOpen(false); setEditingRate(false); setModalWorker(null); }}
            />
          )}
        </div>
      </Modal>

      {/* 근무 수정 모달 */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="근무 수정">
        {editTarget && modalWorker && (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 font-medium">시급</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">
                {hourlyRate > 0 ? formatCurrency(hourlyRate) : "미설정"}
              </p>
            </div>
            <ShiftForm
              workers={[modalWorker]}
              initial={editTarget}
              onSubmit={(data) => { updateShift({ ...editTarget, ...data, workplaceId: selectedWorkplaceId }); setEditTarget(null); }}
              onCancel={() => setEditTarget(null)}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteShift(deleteTarget.id); setDeleteTarget(null); }}
        message="이 근무 기록을 삭제하시겠습니까?"
      />
    </div>
  );
}
