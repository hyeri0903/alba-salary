"use client";

import { useState } from "react";
import { UserProfile } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface StepProfileProps {
  onComplete: (profile: UserProfile) => void;
}

type Role = "boss" | "part-timer";

export default function StepProfile({ onComplete }: StepProfileProps) {
  const [role, setRole] = useState<Role>("boss");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("이름을 입력해주세요"); return; }

    onComplete({
      id: crypto.randomUUID(),
      name: name.trim(),
      role,
      activeWorkplaceId: null,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">프로필 설정</h2>
        <p className="text-sm text-gray-500 mt-1">역할과 이름을 입력해주세요</p>
      </div>

      <div className="flex gap-2">
        {(["boss", "part-timer"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold border-2 transition-all ${
              role === r
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            <span className="block text-lg mb-1">{r === "boss" ? "👔" : "👋"}</span>
            {r === "boss" ? "사장님" : "알바생"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="이름"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          placeholder="홍길동"
          error={error}
        />
        <Button type="submit" className="w-full justify-center py-3 text-base">
          시작하기 →
        </Button>
      </form>
    </div>
  );
}
