"use client";

import { useState } from "react";
import { Worker, WorkShift } from "@/types";
import { computeHours } from "@/lib/salary";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ShiftFormProps {
  workers: Worker[];
  onSubmit: (data: Omit<WorkShift, "id" | "createdAt">) => void;
  onCancel: () => void;
}

type InputMode = "time" | "manual";

export default function ShiftForm({ workers, onSubmit, onCancel }: ShiftFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [mode, setMode] = useState<InputMode>("time");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [breakMinutes, setBreakMinutes] = useState("60");
  const [manualHours, setManualHours] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!workerId) e.workerId = "알바생을 선택해주세요";
    if (!date) e.date = "날짜를 선택해주세요";
    if (mode === "time") {
      const hrs = computeHours(startTime, endTime, Number(breakMinutes) || 0);
      if (hrs <= 0) e.time = "근무 시간이 올바르지 않습니다";
    } else {
      const h = Number(manualHours);
      if (!manualHours || isNaN(h) || h <= 0) e.manualHours = "근무 시간을 입력해주세요";
    }
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const breakMin = Number(breakMinutes) || 0;
    const totalHours =
      mode === "time"
        ? computeHours(startTime, endTime, breakMin)
        : Number(manualHours);

    onSubmit({
      workerId,
      date,
      startTime: mode === "time" ? startTime : "",
      endTime: mode === "time" ? endTime : "",
      totalHours,
      breakMinutes: mode === "time" ? breakMin : 0,
      note: note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">알바생</label>
        <select
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.position})
            </option>
          ))}
        </select>
        {errors.workerId && (
          <span className="text-xs text-red-500">{errors.workerId}</span>
        )}
      </div>

      <Input
        label="날짜"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">입력 방식</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("time")}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              mode === "time"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            시작/종료 시간
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              mode === "manual"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            시간 직접 입력
          </button>
        </div>
      </div>

      {mode === "time" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="시작 시간"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="종료 시간"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Input
            label="휴게 시간 (분)"
            type="number"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
            min={0}
          />
          {errors.time && (
            <span className="text-xs text-red-500">{errors.time}</span>
          )}
        </>
      ) : (
        <Input
          label="근무 시간 (시간 단위, 예: 4.5)"
          type="number"
          value={manualHours}
          onChange={(e) => setManualHours(e.target.value)}
          step="0.5"
          min={0}
          placeholder="4.5"
          error={errors.manualHours}
        />
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">메모 (선택)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={2}
          placeholder="특이사항 등"
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">추가하기</Button>
      </div>
    </form>
  );
}
