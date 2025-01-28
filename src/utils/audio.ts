"use client";

import { IAudioStore } from '@/store/audioStore';

const audioTracks = [
	"/audio/track1.mp3",
	"/audio/track2.mp3",
	"/audio/track3.mp3",
	"/audio/track4.mp3",
	"/audio/track5.mp3",
	"/audio/track6.mp3",
	"/audio/track7.mp3",
	"/audio/track8.mp3"
];

const winTrack = ["/audio/gimn.mp3"];

// Воспроизведение случайного трека
export const playRandomTrack = ({ isAudioEnabled, currentAudio, setCurrentAudio }: IAudioStore) => {
	if (!isAudioEnabled) return;
	
	stopCurrentTrack(currentAudio, setCurrentAudio);
	
	const randomIndex = Math.floor(Math.random() * audioTracks.length);
	const audio = new Audio(audioTracks[randomIndex]);
	setCurrentAudio(audio);
	audio.play();
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
};

// Переключение состояния музыки
export const toggleMusicState = (toggleAudio: () => void) => {
	toggleAudio();
};
