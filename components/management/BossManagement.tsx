"use client";

import { useState } from "react";
import { Worker, WorkShift } from "@/types";
import { useWorkers } from "@/hooks/useWorkers";
import { useShifts } from "@/hooks/useShifts";
import { formatDate, formatCurrency, toYearMonth, formatYearMonth } from "@/lib/dateUtils";
import { computeSalary } from "@/lib/salary";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import WorkerForm from "@/components/workers/WorkerForm";
import ShiftForm from "@/components/shifts/ShiftForm";
import Button from "@/components/ui/Button";

type Tab = "workers" | "shifts";

export default function BossManagement() {
  const { workers, addWorker, updateWorker, deleteWorker } = useWorkers();
  const { shifts, addShift, deleteShift } = useShifts();
  const [tab, setTab] = useState<Tab>("workers");
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Worker | null>(null);
  const [deleteWorkerTarget, setDeleteWorkerTarget] = useState<Worker | null>(null);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [deleteShiftTarget, setDeleteShiftTarget] = useState<WorkShift | null>(null);
  const [monthFilter, setMonthFilter] = useState(toYearMonth());

  const workerMap = Object.fromEntries(workers.map((w) => [w.id, w]));
  const months = Array.from(new Set(shifts.map((s) => s.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  const allMonths = months.includes(toYearMonth()) ? months : [toYearMonth(), ...months];
  const filteredShifts = shifts.filter((s) => s.date.startsWith(monthFilter)).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">근무관리</h1>
        <Button
          size="sm"
          onClick={() => tab === "workers" ? setIsAddWorkerOpen(true) : setIsAddShiftOpen(true)}
          disabled={tab === "shifts" && workers.length === 0}
        >
          + {tab === "workers" ? "알바생" : "근무"} 추가
        </Button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([["workers", "알바생 목록"], ["shifts", "근무 기록"]] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "workers" && (
        <div className="flex flex-col gap-2">
          {workers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
              <p className="text-gray-400 text-sm">등록된 알바생이 없습니다</p>
            </div>
          ) : workers.map((worker) => (
            <div key={worker.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{worker.name}</span>
                  <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{worker.position}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">시급 {formatCurrency(worker.hourlyRate)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditTarget(worker)}>수정</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteWorkerTarget(worker)}>삭제</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "shifts" && (
        <div className="flex flex-col gap-3">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {allMonths.map((m) => (
              <option key={m} value={m}>{formatYearMonth(m)}</option>
            ))}
          </select>
          {filteredShifts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
              <p className="text-gray-400 text-sm">근무 기록이 없습니다</p>
            </div>
          ) : filteredShifts.map((shift) => {
            const worker = workerMap[shift.workerId];
            const salary = worker ? computeSalary(shift.totalHours, worker.hourlyRate) : 0;
            return (
              <div key={shift.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{worker?.name ?? "삭제된 알바생"}</span>
                      <span className="text-xs text-gray-400">{formatDate(shift.date)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {shift.totalHours.toFixed(1)}시간
                      {shift.startTime && ` · ${shift.startTime}~${shift.endTime}`}
                    </p>
                    {shift.note && <p className="text-xs text-gray-400">{shift.note}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-indigo-600">{formatCurrency(salary)}</span>
                    <Button variant="danger" size="sm" onClick={() => setDeleteShiftTarget(shift)}>삭제</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isAddWorkerOpen} onClose={() => setIsAddWorkerOpen(false)} title="알바생 추가">
        <WorkerForm onSubmit={(data) => { addWorker(data); setIsAddWorkerOpen(false); }} onCancel={() => setIsAddWorkerOpen(false)} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="알바생 수정">
        {editTarget && (
          <WorkerForm initial={editTarget} onSubmit={(data) => { updateWorker({ ...editTarget, ...data }); setEditTarget(null); }} onCancel={() => setEditTarget(null)} />
        )}
      </Modal>
      <ConfirmDialog isOpen={!!deleteWorkerTarget} onClose={() => setDeleteWorkerTarget(null)} onConfirm={() => { if (deleteWorkerTarget) deleteWorker(deleteWorkerTarget.id); }} message={`${deleteWorkerTarget?.name}을(를) 삭제하면 모든 근무 기록도 삭제됩니다.`} />
      <Modal isOpen={isAddShiftOpen} onClose={() => setIsAddShiftOpen(false)} title="근무 추가">
        <ShiftForm workers={workers} onSubmit={(data) => { addShift(data); setIsAddShiftOpen(false); }} onCancel={() => setIsAddShiftOpen(false)} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteShiftTarget} onClose={() => setDeleteShiftTarget(null)} onConfirm={() => { if (deleteShiftTarget) deleteShift(deleteShiftTarget.id); }} message="이 근무 기록을 삭제하시겠습니까?" />
    </div>
  );
}
