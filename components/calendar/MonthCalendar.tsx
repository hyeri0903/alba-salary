"use client";

import React from "react";

interface MonthCalendarProps {
  yearMonth: string;
  cellContent: (date: string) => React.ReactNode;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function MonthCalendar({ yearMonth, cellContent }: MonthCalendarProps) {
  const [year, month] = yearMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const cells: { date: string | null; day: number | null }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ date: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    cells.push({ date: `${year}-${mm}-${dd}`, day: d });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`py-2 text-center text-xs font-semibold ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"
            }`}
          >
            {label}
          </div>
        ))}
        {cells.map((cell, i) => {
          const isToday = cell.date === today;
          const isSun = i % 7 === 0;
          const isSat = i % 7 === 6;
          return (
            <div
              key={i}
              className={`min-h-[64px] p-1 border-t border-gray-50 ${cell.date ? "" : "bg-gray-50/50"}`}
            >
              {cell.day !== null && (
                <>
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${
                      isToday
                        ? "bg-indigo-600 text-white"
                        : isSun
                        ? "text-red-400"
                        : isSat
                        ? "text-blue-400"
                        : "text-gray-700"
                    }`}
                  >
                    {cell.day}
                  </span>
                  <div className="mt-0.5">{cell.date && cellContent(cell.date)}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
