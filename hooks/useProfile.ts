"use client";

import { useAppContext } from "@/context/AppContext";
import { UserProfile, Workplace } from "@/types";

export function useProfile() {
  const { state, dispatch } = useAppContext();

  const activeWorkplace = state.workplaces.find(
    (w) => w.id === state.profile?.activeWorkplaceId
  ) ?? null;

  const updateWorkplace = (workplace: Workplace) => {
    dispatch({ type: "UPDATE_WORKPLACE", workplace });
  };

  const addWorkplace = (name: string) => {
    const workplace: Workplace = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_WORKPLACE", workplace });
    return workplace;
  };

  const setActiveWorkplace = (id: string) => {
    dispatch({ type: "SET_ACTIVE_WORKPLACE", id });
  };

  const setProfile = (profile: UserProfile) => {
    dispatch({ type: "SET_PROFILE", profile });
  };

  const resetProfile = () => {
    dispatch({ type: "RESET_PROFILE" });
  };

  return {
    profile: state.profile,
    workplaces: state.workplaces,
    activeWorkplace,
    isLoaded: state.isLoaded,
    isBoss: state.profile?.role === "boss",
    isPartTimer: state.profile?.role === "part-timer",
    addWorkplace,
    updateWorkplace,
    setActiveWorkplace,
    setProfile,
    resetProfile,
  };
}
