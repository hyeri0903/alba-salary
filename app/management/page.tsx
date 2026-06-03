"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import BossManagement from "@/components/management/BossManagement";
import PartTimerManagement from "@/components/management/PartTimerManagement";

export default function ManagementPage() {
  const { profile, isLoaded, isBoss } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !profile) router.replace("/onboarding");
  }, [isLoaded, profile, router]);

  if (!isLoaded) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return null;

  return isBoss ? <BossManagement /> : <PartTimerManagement />;
}
