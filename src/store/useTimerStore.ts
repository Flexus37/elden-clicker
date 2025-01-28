import { create } from "zustand";

type TimerStatus = "running" | "paused" | "stopped" | "finished";

interface TimerState {
	status: TimerStatus;
	setTimerStatus: (newTimerStatus: TimerStatus) => void;
}

export const useTimerStore = create<TimerState>()((set) => ({
	status: "stopped",
	setTimerStatus: (newTimerStatus) => set(() => ({status: newTimerStatus})),
}));
