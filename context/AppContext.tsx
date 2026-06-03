"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { Worker, WorkShift } from "@/types";

interface AppState {
  workers: Worker[];
  shifts: WorkShift[];
  isLoaded: boolean;
}

type Action =
  | { type: "LOAD_DATA"; workers: Worker[]; shifts: WorkShift[] }
  | { type: "ADD_WORKER"; worker: Worker }
  | { type: "UPDATE_WORKER"; worker: Worker }
  | { type: "DELETE_WORKER"; id: string }
  | { type: "ADD_SHIFT"; shift: WorkShift }
  | { type: "DELETE_SHIFT"; id: string };

const initialState: AppState = {
  workers: [],
  shifts: [],
  isLoaded: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_DATA":
      return { ...state, workers: action.workers, shifts: action.shifts, isLoaded: true };
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
    case "DELETE_SHIFT":
      return { ...state, shifts: state.shifts.filter((s) => s.id !== action.id) };
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
      dispatch({ type: "LOAD_DATA", workers, shifts });
    } catch {
      dispatch({ type: "LOAD_DATA", workers: [], shifts: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.isLoaded) return;
    localStorage.setItem("alba_workers", JSON.stringify(state.workers));
    localStorage.setItem("alba_shifts", JSON.stringify(state.shifts));
  }, [state.workers, state.shifts, state.isLoaded]);

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
