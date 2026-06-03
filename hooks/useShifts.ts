"use client";

import { useAppContext } from "@/context/AppContext";
import { WorkShift } from "@/types";

export function useShifts() {
  const { state, dispatch } = useAppContext();

  const addShift = (data: Omit<WorkShift, "id" | "createdAt">) => {
    const shift: WorkShift = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_SHIFT", shift });
  };

  const updateShift = (shift: WorkShift) => {
    dispatch({ type: "UPDATE_SHIFT", shift });
  };

  const deleteShift = (id: string) => {
    dispatch({ type: "DELETE_SHIFT", id });
  };

  return {
    shifts: state.shifts,
    isLoaded: state.isLoaded,
    addShift,
    updateShift,
    deleteShift,
  };
}
