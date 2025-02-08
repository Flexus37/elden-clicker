"use client";

import { IAudioStore } from '@/store/useAudioStore';

const audioTracks = [
	"/audio/track1.mp3",
	"/audio/track2.mp3",
	"/audio/track3.mp3",
	"/audio/track4.mp3",
	"/audio/track5.mp3",
	"/audio/track6.mp3",
	"/audio/track7.mp3",
	"/audio/track8.mp3",
	"/audio/track9.mp3",
	"/audio/track10.mp3",
	"/audio/track11.mp3",
	"/audio/track12.mp3",
	"/audio/track13.mp3",
	"/audio/track14.mp3",
	"/audio/track15.mp3",
	"/audio/track16.mp3",
	"/audio/track17.mp3",
	"/audio/track18.mp3",
	"/audio/track19.mp3",
];

const winTrack = ["/audio/gimn.mp3"];

export const playTrack = (audioStore: IAudioStore, audioSrc: string) => {
	console.log("playTrack isAudioEnabled:", audioStore.isAudioEnabled);
	if (!audioStore.isAudioEnabled || !audioSrc || audioSrc.length === 0) return;
	
	console.log("Audio play track", audioSrc);
	
	stopCurrentTrack(audioStore.currentAudio, audioStore.setCurrentAudio);
	
	const audio = new Audio(audioSrc);
	audioStore.setCurrentAudio(audio);
	audio.play();
};


// Воспроизведение случайного трека
export const playRandomTrack = ({ isAudioEnabled, currentAudio, setCurrentAudio }: IAudioStore) => {
	if (!isAudioEnabled) return;
	
	stopCurrentTrack(currentAudio, setCurrentAudio);
	
	const randomIndex = Math.floor(Math.random() * audioTracks.length);
	const audio = new Audio(audioTracks[randomIndex]);
	setCurrentAudio(audio);
	audio.play();
	return audioTracks[randomIndex];
};

// Остановка текущего трека
export const stopCurrentTrack = (currentAudio: HTMLAudioElement | null, setCurrentAudio: (audio: HTMLAudioElement | null) => void) => {
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
		setCurrentAudio(null);
	}
};

// Воспроизведение победного трека
export const playWinTrack = ({ isAudioEnabled, currentAudio, setCurrentAudio }: IAudioStore) => {
	if (!isAudioEnabled) return;
	
	stopCurrentTrack(currentAudio, setCurrentAudio);
	
	const audio = new Audio(winTrack[0]);
	setCurrentAudio(audio);
	audio.play();
	return winTrack[0];
};

// Переключение состояния музыки
export const toggleMusicState = (toggleAudio: () => void) => {
	toggleAudio();
};
