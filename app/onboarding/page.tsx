"use client";

import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import StepProfile from "@/components/onboarding/StepProfile";

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useProfile();

  const handleComplete = (profile: UserProfile) => {
    setProfile(profile);
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">💼</p>
          <h1 className="text-xl font-bold text-gray-900">알바 급여 관리</h1>
          <p className="text-sm text-gray-400 mt-1">시작하기 전에 프로필을 설정해주세요</p>
        </div>
        <StepProfile onComplete={handleComplete} />
      </div>
    </div>
  );
}
