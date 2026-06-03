"use client";

import { useAppContext } from "@/context/AppContext";
import { Worker } from "@/types";

export function useWorkers() {
  const { state, dispatch } = useAppContext();

  const addWorker = (data: Omit<Worker, "id" | "createdAt">) => {
    const worker: Worker = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_WORKER", worker });
  };

  const updateWorker = (worker: Worker) => {
    dispatch({ type: "UPDATE_WORKER", worker });
  };

  const deleteWorker = (id: string) => {
    dispatch({ type: "DELETE_WORKER", id });
  };

  return {
    workers: state.workers,
    isLoaded: state.isLoaded,
    addWorker,
    updateWorker,
    deleteWorker,
  };
}
