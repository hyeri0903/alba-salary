"use client";

import { useState, useRef, useEffect } from "react";
import { Workplace } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface WorkplaceCardMenuProps {
  workplace: Workplace;
  /** 알바생이면 시급 수정 필드도 표시 */
  hourlyRate?: number;
  onRateChange?: (rate: number) => void;
}

export default function WorkplaceCardMenu({ workplace, hourlyRate, onRateChange }: WorkplaceCardMenuProps) {
  const { updateWorkplace, isPartTimer } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(workplace.name);
  const [rate, setRate] = useState(String(hourlyRate ?? ""));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleEdit = () => {
    setName(workplace.name);
    setRate(String(hourlyRate ?? ""));
    setErrors({});
    setMenuOpen(false);
    setEditOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "근무지 이름을 입력해주세요";
    if (isPartTimer) {
      const r = Number(rate);
      if (!rate || isNaN(r) || r < 10030) errs.rate = "시급은 10,030원 이상이어야 합니다";
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    updateWorkplace({ ...workplace, name: name.trim() });
    if (isPartTimer && onRateChange) onRateChange(Number(rate));
    setEditOpen(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* 세로 땡땡이 아이콘 */}
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg viewBox="0 0 4 20" fill="currentColor" className="w-1 h-5">
            <circle cx="2" cy="2" r="2" />
            <circle cx="2" cy="10" r="2" />
            <circle cx="2" cy="18" r="2" />
          </svg>
        </button>

        {/* 드롭다운 메뉴 */}
        {menuOpen && (
          <div className="absolute right-0 top-8 z-30 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-28">
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              수정하기
            </button>
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="근무지 수정">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="근무지 이름"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors({}); }}
            error={errors.name}
          />
          {isPartTimer && (
            <Input
              label="시급 (원)"
              type="number"
              value={rate}
              onChange={(e) => { setRate(e.target.value); setErrors({}); }}
              placeholder="10030"
              min={10030}
              error={errors.rate}
            />
          )}
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>취소</Button>
            <Button type="submit">저장하기</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
