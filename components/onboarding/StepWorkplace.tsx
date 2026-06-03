"use client";

import { useState, useEffect } from "react";
import { Workplace } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface StepWorkplaceProps {
  onNext: (workplace: Workplace) => void;
}

export default function StepWorkplace({ onNext }: StepWorkplaceProps) {
  const [mode, setMode] = useState<"new" | "load">("new");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [existing, setExisting] = useState<Workplace | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("alba_workplace");
      if (saved) setExisting(JSON.parse(saved));
    } catch {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "new") {
      if (!name.trim()) {
        setError("근무지 이름을 입력해주세요");
        return;
      }
      onNext({
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      });
    } else {
      if (existing) onNext(existing);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">근무지 설정</h2>
        <p className="text-sm text-gray-500 mt-1">근무지를 설정해주세요</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            mode === "new"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300"
          }`}
        >
          새로 만들기
        </button>
        <button
          type="button"
          onClick={() => setMode("load")}
          disabled={!existing}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === "load"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300"
          }`}
        >
          불러오기
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "new" ? (
          <Input
            label="근무지 이름"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="예: 스타벅스 강남점"
            error={error}
          />
        ) : existing ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-xs text-indigo-500 font-medium mb-1">저장된 근무지</p>
            <p className="text-base font-semibold text-indigo-800">{existing.name}</p>
          </div>
        ) : null}

        <Button type="submit" className="w-full justify-center py-3">
          다음 →
        </Button>
      </form>
    </div>
  );
}
