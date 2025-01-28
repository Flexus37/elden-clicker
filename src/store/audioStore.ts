import { create } from 'zustand/react'

export interface IAudioStore {
	isAudioEnabled: boolean;
	currentAudio: HTMLAudioElement | null;
	toggleAudio(): void;
	setIsAudioEnabled(isAudioEnabled: boolean): void;
	setCurrentAudio(currentAudio: HTMLAudioElement | null): void;
}

export const useAudioStore = create<IAudioStore>()((set) => ({
	isAudioEnabled: false,
	currentAudio: null,
	toggleAudio: () => set(state => ({isAudioEnabled: !state.isAudioEnabled
	})),
	setIsAudioEnabled: (isAudioEnabled) => set(() => ({isAudioEnabled})),
	setCurrentAudio: (currentAudio) => set(() => ({currentAudio}))
}))