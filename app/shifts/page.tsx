"use client";

import { useState } from "react";
import { WorkShift } from "@/types";
import { useShifts } from "@/hooks/useShifts";
import { useWorkers } from "@/hooks/useWorkers";
import { formatDate, formatCurrency, toYearMonth, formatYearMonth } from "@/lib/dateUtils";
import { computeSalary } from "@/lib/salary";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ShiftForm from "@/components/shifts/ShiftForm";
import Button from "@/components/ui/Button";

export default function ShiftsPage() {
  const { shifts, isLoaded, addShift, deleteShift } = useShifts();
  const { workers } = useWorkers();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkShift | null>(null);
  const [monthFilter, setMonthFilter] = useState(toYearMonth());

  const workerMap = Object.fromEntries(workers.map((w) => [w.id, w]));

  const filtered = shifts
    .filter((s) => s.date.startsWith(monthFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const months = Array.from(
    new Set(shifts.map((s) => s.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  if (!isLoaded) {
    return <div className="text-center text-gray-400 py-20">불러오는 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">근무 기록</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatYearMonth(monthFilter)} · {filtered.length}건</p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {(months.includes(toYearMonth()) ? months : [toYearMonth(), ...months]).map((m) => (
              <option key={m} value={m}>
                {formatYearMonth(m)}
              </option>
            ))}
          </select>
          <Button
            onClick={() => setIsAddOpen(true)}
            disabled={workers.length === 0}
          >
            + 근무 추가
          </Button>
        </div>
      </div>

      {workers.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700 mb-4">
          먼저 알바생을 등록해주세요.
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">이 달의 근무 기록이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">날짜</th>
                <th className="px-5 py-3">알바생</th>
                <th className="px-5 py-3">근무 시간</th>
                <th className="px-5 py-3">급여</th>
                <th className="px-5 py-3">메모</th>
                <th className="px-5 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((shift) => {
                const worker = workerMap[shift.workerId];
                const salary = worker
                  ? computeSalary(shift.totalHours, worker.hourlyRate)
                  : 0;
                return (
                  <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {formatDate(shift.date)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {worker?.name ?? "삭제된 알바생"}
                      {worker && (
                        <span className="ml-1.5 text-xs text-gray-400">
                          {worker.position}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {shift.totalHours.toFixed(1)}시간
                      {shift.startTime && (
                        <span className="ml-1 text-xs text-gray-400">
                          ({shift.startTime}~{shift.endTime})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-indigo-600">
                      {formatCurrency(salary)}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 max-w-[120px] truncate">
                      {shift.note || "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(shift)}
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="근무 추가"
      >
        <ShiftForm
          workers={workers}
          onSubmit={(data) => {
            addShift(data);
            setIsAddOpen(false);
          }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteShift(deleteTarget.id);
          setDeleteTarget(null);
        }}
        message="이 근무 기록을 삭제하시겠습니까?"
      />
    </div>
  );
}
