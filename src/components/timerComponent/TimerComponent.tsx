"use client";

import { useTimerStore } from '@/store/useTimerStore'
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw } from "lucide-react";
import { formatTime } from '@/utils/formatTime'

interface TimerProps {
	bossId: number;
}

export const TimerComponent: React.FC<TimerProps> = ({ bossId }) => {
	const elapsedTimeRef = useRef(0); // Общее время в секундах
	const [localTime, setLocalTime] = useState(0); // Локальное отображение времени
	const [lastStartTime, setLastStartTime] = useState<number | null>(null); // Timestamp последнего старта
	const {status, setTimerStatus} = useTimerStore()
	
	// Визуальное обновление таймера каждую секунду
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (status === "running" && lastStartTime) {
			interval = setInterval(() => {
				const now = Math.floor(Date.now() / 1000); // Текущее время в секундах
				setLocalTime(elapsedTimeRef.current + (now - lastStartTime)); // Рассчитываем разницу времени
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [status, lastStartTime]);
	
	// Загрузка данных из Supabase
	useEffect(() => {
		const fetchTimer = async () => {
			const { data, error } = await supabase
				.from("timers")
				.select("*")
				.eq("boss_id", bossId)
				.single();
			
			if (error) {
				console.error("Ошибка получения таймера:", error.message);
				return;
			}
			
			if (data) {
				elapsedTimeRef.current = data.elapsed_time;
				setTimerStatus(data.status);
				setLocalTime(data.elapsed_time);
				setLastStartTime(data.status === "running" ? Math.floor(Date.now() / 1000) : null);
			}
		};
		
		fetchTimer();
		
		const channel = supabase
			.channel("timers_changes")
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "timers", filter: `boss_id=eq.${bossId}` },
				(payload) => {
					elapsedTimeRef.current = payload.new.elapsed_time;
					setTimerStatus(payload.new.status);
					setLocalTime(payload.new.elapsed_time);
					setLastStartTime(payload.new.status === "running" ? Math.floor(Date.now() / 1000) : null);
				}
			)
			.subscribe();
		
		return () => {
			supabase.removeChannel(channel);
		};
	}, [bossId]);
	
	useEffect(() => {
		if (!bossId || status !== "finished") return;
		
		finishTimer();
	}, [status]); // 🔥 Теперь при каждом изменении статуса он записывается в БД 🔥 Теперь при каждом изменении статуса он записывается в БД
	
	// Запуск таймера
	const startTimer = async () => {
		if (status === "finished") return; // Если таймер завершен, ничего не делаем
		
		const now = Math.floor(Date.now() / 1000);
		
		const { error } = await supabase
			.from("timers")
			.update({
				status: "running",
			})
			.eq("boss_id", bossId);
		
		if (!error) {
			setLastStartTime(now);
			setTimerStatus("running");
		}
	};
	
	// Пауза таймера
	const pauseTimer = async () => {
		if (!lastStartTime || status === "finished") return;
		
		const now = Math.floor(Date.now() / 1000);
		const totalElapsed = elapsedTimeRef.current + (now - lastStartTime);
		
		const { error } = await supabase
			.from("timers")
			.update({
				elapsed_time: totalElapsed,
				status: "paused",
			})
			.eq("boss_id", bossId);
		
		if (!error) {
			elapsedTimeRef.current = totalElapsed;
			setTimerStatus("paused");
			setLocalTime(totalElapsed);
			setLastStartTime(null);
		}
	};
	
	// Сброс таймера
	const resetTimer = async () => {
		if (status === "finished") return;
		
		const { error } = await supabase
			.from("timers")
			.update({
				elapsed_time: 0,
				status: "stopped",
			})
			.eq("boss_id", bossId);
		
		if (!error) {
			elapsedTimeRef.current = 0;
			setTimerStatus("stopped");
			setLocalTime(0);
			setLastStartTime(null);
		}
	};
	
	// Функция завершения таймера
	const finishTimer = async () => {
		const now = Math.floor(Date.now() / 1000);
		const totalElapsed = elapsedTimeRef.current + (lastStartTime ? now - lastStartTime : 0);
		
		const { error } = await supabase
			.from("timers")
			.update({
				elapsed_time: totalElapsed, // ✅ Записываем актуальное время
				status: "finished",
			})
			.eq("boss_id", bossId);
		
		if (!error) {
			elapsedTimeRef.current = totalElapsed; // ✅ Обновляем локальное хранилище
			setLocalTime(totalElapsed);
			setTimerStatus("finished");
			setLastStartTime(null);
			console.log("✅ Таймер успешно завершен, время обновлено в БД");
		} else {
			console.error("❌ Ошибка обновления таймера в БД:", error.message);
		}
	};
	
	
	const renderTimerBtns = () => {
		if (status === "finished")
			return null;
		else if (status === "running") {
			return (
				<>
					<Button onClick={pauseTimer}>
						<Pause /> Пауза
					</Button>
					<Button onClick={resetTimer}>
						<RotateCcw /> Сброс
					</Button>
				</>
			)
		}
		else {
			return (
				<>
					<Button onClick={startTimer}>
						<Play /> {status === "paused" ? "Продолжить" : "Старт"}
					</Button>
					<Button onClick={resetTimer}>
						<RotateCcw /> Сброс
					</Button>
				</>
			)
		}
	}
	
	return (
		<div className="flex flex-col items-center gap-4">
			<h2 className="text-2xl">{formatTime(localTime)}</h2>
			<div className="flex gap-4">
				{renderTimerBtns()}
			</div>
		</div>
	);
};
