"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const { profile, activeWorkplace, workplaces, isLoaded, resetProfile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !profile) router.replace("/onboarding");
  }, [isLoaded, profile, router]);

  if (!isLoaded) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return null;

  const handleReset = () => {
    resetProfile();
    router.replace("/onboarding");
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-gray-900">환경설정</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">내 프로필</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
              {profile.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                profile.role === "boss"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-indigo-50 text-indigo-600"
              }`}>
                {profile.role === "boss" ? "사장님" : "알바생"}
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">현재 근무지</span>
            <span className="font-medium text-gray-800">{activeWorkplace?.name ?? "없음"}</span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">등록된 근무지</span>
            <span className="font-medium text-gray-800">{workplaces.length}곳</span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">가입일</span>
            <span className="font-medium text-gray-800">
              {new Date(profile.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-medium text-gray-700 mb-1">프로필 초기화</p>
        <p className="text-xs text-gray-400 mb-4">모든 데이터가 삭제되고 온보딩으로 돌아갑니다</p>
        <Button variant="danger" onClick={handleReset} className="w-full justify-center">
          초기화하고 다시 시작
        </Button>
      </div>
    </div>
  );
}
