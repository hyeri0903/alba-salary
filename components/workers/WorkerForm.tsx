"use client";

import { useState, useEffect } from "react";
import { Worker } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface WorkerFormProps {
  initial?: Worker;
  onSubmit: (data: Omit<Worker, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export default function WorkerForm({ initial, onSubmit, onCancel }: WorkerFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [hourlyRate, setHourlyRate] = useState(
    initial ? String(initial.hourlyRate) : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "이름을 입력해주세요";
    if (!position.trim()) e.position = "직책을 입력해주세요";
    const rate = Number(hourlyRate);
    if (!hourlyRate || isNaN(rate) || rate < 10030)
      e.hourlyRate = "시급은 10,030원 이상이어야 합니다";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({ name: name.trim(), position: position.trim(), hourlyRate: Number(hourlyRate) });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="홍길동"
        error={errors.name}
      />
      <Input
        label="직책 / 포지션"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="홀, 주방, 카운터 등"
        error={errors.position}
      />
      <Input
        label="시급 (원)"
        type="number"
        value={hourlyRate}
        onChange={(e) => setHourlyRate(e.target.value)}
        placeholder="10030"
        min={10030}
        error={errors.hourlyRate}
      />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">
          {initial ? "수정하기" : "추가하기"}
        </Button>
      </div>
    </form>
  );
}
