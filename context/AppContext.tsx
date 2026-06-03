"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Worker, WorkShift, Workplace, UserProfile } from "@/types";

interface AppState {
  workers: Worker[];
  shifts: WorkShift[];
  workplaces: Workplace[];
  profile: UserProfile | null;
  isLoaded: boolean;
}

type Action =
  | {
      type: "HYDRATE";
      workers: Worker[];
      shifts: WorkShift[];
      workplaces: Workplace[];
      profile: UserProfile | null;
    }
  | { type: "ADD_WORKER"; worker: Worker }
  | { type: "UPDATE_WORKER"; worker: Worker }
  | { type: "DELETE_WORKER"; id: string }
  | { type: "ADD_SHIFT"; shift: WorkShift }
  | { type: "UPDATE_SHIFT"; shift: WorkShift }
  | { type: "DELETE_SHIFT"; id: string }
  | { type: "ADD_WORKPLACE"; workplace: Workplace }
  | { type: "UPDATE_WORKPLACE"; workplace: Workplace }
  | { type: "SET_ACTIVE_WORKPLACE"; id: string }
  | { type: "SET_PROFILE"; profile: UserProfile }
  | { type: "RESET_PROFILE" };

const initialState: AppState = {
  workers: [],
  shifts: [],
  workplaces: [],
  profile: null,
  isLoaded: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        workers: action.workers,
        shifts: action.shifts,
        workplaces: action.workplaces,
        profile: action.profile,
        isLoaded: true,
      };
    case "ADD_WORKER":
      return { ...state, workers: [...state.workers, action.worker] };
    case "UPDATE_WORKER":
      return {
        ...state,
        workers: state.workers.map((w) =>
          w.id === action.worker.id ? action.worker : w
        ),
      };
    case "DELETE_WORKER":
      return {
        ...state,
        workers: state.workers.filter((w) => w.id !== action.id),
        shifts: state.shifts.filter((s) => s.workerId !== action.id),
      };
    case "ADD_SHIFT":
      return { ...state, shifts: [...state.shifts, action.shift] };
    case "UPDATE_SHIFT":
      return { ...state, shifts: state.shifts.map((s) => s.id === action.shift.id ? action.shift : s) };
    case "DELETE_SHIFT":
      return { ...state, shifts: state.shifts.filter((s) => s.id !== action.id) };
    case "ADD_WORKPLACE":
      return {
        ...state,
        workplaces: [...state.workplaces, action.workplace],
        profile: state.profile
          ? { ...state.profile, activeWorkplaceId: action.workplace.id }
          : state.profile,
      };
    case "UPDATE_WORKPLACE":
      return {
        ...state,
        workplaces: state.workplaces.map((w) =>
          w.id === action.workplace.id ? action.workplace : w
        ),
      };
    case "SET_ACTIVE_WORKPLACE":
      return {
        ...state,
        profile: state.profile
          ? { ...state.profile, activeWorkplaceId: action.id }
          : state.profile,
      };
    case "SET_PROFILE":
      return { ...state, profile: action.profile };
    case "RESET_PROFILE":
      return { ...state, workplaces: [], profile: null };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const workers = JSON.parse(localStorage.getItem("alba_workers") || "[]");
      const shifts = JSON.parse(localStorage.getItem("alba_shifts") || "[]");
      const workplaces = JSON.parse(localStorage.getItem("alba_workplaces") || "[]");
      const profile = JSON.parse(localStorage.getItem("alba_profile") || "null");
      dispatch({ type: "HYDRATE", workers, shifts, workplaces, profile });
    } catch {
      dispatch({ type: "HYDRATE", workers: [], shifts: [], workplaces: [], profile: null });
    }
  }, []);

  useEffect(() => {
    if (!state.isLoaded) return;
    localStorage.setItem("alba_workers", JSON.stringify(state.workers));
    localStorage.setItem("alba_shifts", JSON.stringify(state.shifts));
    localStorage.setItem("alba_workplaces", JSON.stringify(state.workplaces));
    if (state.profile)
      localStorage.setItem("alba_profile", JSON.stringify(state.profile));
    else
      localStorage.removeItem("alba_profile");
  }, [state.workers, state.shifts, state.workplaces, state.profile, state.isLoaded]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
