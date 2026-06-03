"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useWorkers } from "@/hooks/useWorkers";
import { useAppContext } from "@/context/AppContext";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface WorkplaceHeaderProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function WorkplaceHeader({ open, onOpenChange }: WorkplaceHeaderProps) {
  const { workplaces, activeWorkplace, addWorkplace, setActiveWorkplace, isPartTimer, profile } = useProfile();
  const { workers, updateWorker } = useWorkers();
  const { dispatch } = useAppContext();
  const [internalOpen, setInternalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHourlyRate, setNewHourlyRate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newName.trim()) errs.name = "근무지 이름을 입력해주세요";
    if (isPartTimer) {
      const rate = Number(newHourlyRate);
      if (!newHourlyRate || isNaN(rate) || rate < 10030)
        errs.hourlyRate = "시급은 10,030원 이상이어야 합니다";
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    addWorkplace(newName);

    if (isPartTimer && newHourlyRate) {
      const rate = Number(newHourlyRate);
      // Worker가 있으면 시급 업데이트, 없으면 profile에 임시 저장
      if (profile?.workerId) {
        const myWorker = workers.find((w) => w.id === profile.workerId);
        if (myWorker) updateWorker({ ...myWorker, hourlyRate: rate });
      }
      if (profile) {
        dispatch({ type: "SET_PROFILE", profile: { ...profile, hourlyRate: rate } });
      }
    }

    setNewName("");
    setNewHourlyRate("");
    setErrors({});
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 group">
        <span className="text-sm font-semibold text-gray-800">
          {activeWorkplace ? activeWorkplace.name : "근무지 없음"}
        </span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-gray-600">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="근무지 관리">
        <div className="flex flex-col gap-4">
          {workplaces.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-gray-500 mb-1">저장된 근무지</p>
              {workplaces.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => { setActiveWorkplace(wp.id); setIsOpen(false); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    wp.id === activeWorkplace?.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {wp.name}
                  {wp.id === activeWorkplace?.id && (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-500">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className={workplaces.length > 0 ? "border-t border-gray-100 pt-4" : ""}>
            <p className="text-xs font-medium text-gray-500 mb-2">새 근무지 추가</p>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <Input
                label="근무지 이름"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setErrors({}); }}
                placeholder="예: 스타벅스 강남점"
                error={errors.name}
              />
              {isPartTimer && (
                <Input
                  label="시급 (원)"
                  type="number"
                  value={newHourlyRate}
                  onChange={(e) => { setNewHourlyRate(e.target.value); setErrors({}); }}
                  placeholder="10030"
                  min={10030}
                  error={errors.hourlyRate}
                />
              )}
              <Button type="submit" className="w-full justify-center">추가하기</Button>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
