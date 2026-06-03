"use client";

import { useState } from "react";
import { Worker } from "@/types";
import { useWorkers } from "@/hooks/useWorkers";
import { formatCurrency } from "@/lib/dateUtils";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import WorkerForm from "@/components/workers/WorkerForm";
import Button from "@/components/ui/Button";

export default function WorkersPage() {
  const { workers, isLoaded, addWorker, updateWorker, deleteWorker } = useWorkers();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Worker | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);

  if (!isLoaded) {
    return <div className="text-center text-gray-400 py-20">불러오는 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">알바생 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {workers.length}명</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>+ 알바생 추가</Button>
      </div>

      {workers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">등록된 알바생이 없습니다</p>
          <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
            첫 알바생 추가하기
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">이름</th>
                <th className="px-5 py-3">직책</th>
                <th className="px-5 py-3">시급</th>
                <th className="px-5 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {worker.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-medium">
                      {worker.position}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {formatCurrency(worker.hourlyRate)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTarget(worker)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(worker)}
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="알바생 추가"
      >
        <WorkerForm
          onSubmit={(data) => {
            addWorker(data);
            setIsAddOpen(false);
          }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="알바생 수정"
      >
        {editTarget && (
          <WorkerForm
            initial={editTarget}
            onSubmit={(data) => {
              updateWorker({ ...editTarget, ...data });
              setEditTarget(null);
            }}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteWorker(deleteTarget.id);
          setDeleteTarget(null);
        }}
        message={`${deleteTarget?.name}을(를) 삭제하면 해당 알바생의 모든 근무 기록도 함께 삭제됩니다.`}
      />
    </div>
  );
}
