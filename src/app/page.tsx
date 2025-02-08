"use client";

import { TimerComponent } from '@/components/timerComponent/TimerComponent'
import { useAudioStore } from '@/store/useAudioStore'
import { useTimerStore } from '@/store/useTimerStore'
import { RealtimeChannel } from '@supabase/realtime-js'
import { useState, useEffect, use, useRef } from 'react'
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Volume2, VolumeOff, Pause, Crown } from "lucide-react";
import { BossSelectMenu } from "@/components/bossSelectMenu/BossSelectMenu";
import { Boss, DeathCounter, type NewBoss } from '@/types/boss'
import {
  playRandomTrack,
  playTrack,
  playWinTrack,
  stopCurrentTrack,
  toggleMusicState
} from '@/utils/audio'
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'

export default function Home() {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [deathCounter, setDeathCounter] = useState<DeathCounter | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  // const [isConfetti, setIsConfetti] = useState(false);
  // const { width, height } = useWindowSize()
  const audioState = useAudioStore();
  
  // Получение состояния музыки
  // Загружаем состояние музыки из localStorage при загрузке
  useEffect(() => {
    const savedAudioState = localStorage.getItem("isAudioEnabled");
    if (savedAudioState !== null) {
      audioState.setIsAudioEnabled(JSON.parse(savedAudioState));
    }
  }, []);

  // Сохраняем состояние музыки в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("isAudioEnabled", JSON.stringify(audioState.isAudioEnabled));
  }, [audioState.isAudioEnabled]);
  
  // Получение списка боссов из Supabase
  useEffect(() => {
    const fetchBosses = async () => {
      const { data, error } = await supabase.from("bosses").select("*");
      if (error) {
        console.error("Ошибка при получении боссов:", error.message);
      } else {
        setBosses(data || []);
      }
    };
    
    fetchBosses();
  }, []);
  
  // Получение данных death_counters для выбранного босса
  useEffect(() => {
    if (!selectedBoss) return;
    
    const fetchDeathCounter = async () => {
      const { data, error } = await supabase
        .from("death_counters")
        .select("*")
        .eq("boss_id", selectedBoss.id)
        .single();
      
      if (error) {
        console.error("Ошибка при получении счетчика смертей:", error.message);
        setDeathCounter(null);
      } else {
        setDeathCounter(data);
      }
    };
    
    fetchDeathCounter();
    
    const channel = supabase
      .channel("death_counters_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "death_counters", filter: `boss_id=eq.${selectedBoss.id}` },
        (payload) => {
          console.log("Изменения получены:", payload);
          setDeathCounter(payload.new as DeathCounter);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBoss]);
  
  const channelAudioRef = useRef<RealtimeChannel | null>(null);
  
  // Audio
  useEffect(() => {
    if (!channelAudioRef.current) {
      channelAudioRef.current = supabase
        .channel("current_audio")
        .on(
          "broadcast",
          { event: "new-audio" },
          (response) => {
            console.log("📡 Получено сообщение о треке:", response.payload.message);
            playTrack(useAudioStore.getState(), response.payload.message);
          }
        )
        .subscribe();
    }
    
    return () => {
      if (channelAudioRef.current) {
        supabase.removeChannel(channelAudioRef.current);
        channelAudioRef.current = null;
      }
    };
  }, []);
  
  
  
  // Увеличение счетчика смертей
  const incrementDeathCount = async () => {
    if (deathCounter) {
      const { data, error } = await supabase
        .from("death_counters")
        .update({ death_count: deathCounter.death_count + 1 })
        .eq("id", deathCounter.id)
        .select()
        .single();
      
      if (error) {
        console.error("Ошибка при увеличении счетчика смертей:", error.message);
      } else {
        const currentAudio = playRandomTrack(audioState);
        
        if (channelAudioRef.current) {
          try {
            await channelAudioRef.current.send({
              type: 'broadcast',
              event: 'new-audio',
              payload: { message: currentAudio },
            });
            
            console.log("📡 Сообщение отправлено:", currentAudio);
          } catch (error) {
            console.error("Ошибка при отправке аудио:", error);
          }
        }
        
        setDeathCounter(data);
      }
    }
  };
  
  // Уменьшение счетчика смертей
  const decrementDeathCount = async () => {
    if (deathCounter && deathCounter.death_count > 0) {
      const { data, error } = await supabase
        .from("death_counters")
        .update({ death_count: deathCounter.death_count - 1 })
        .eq("id", deathCounter.id)
        .select()
        .single();
      
      if (error) {
        console.error("Ошибка при уменьшении счетчика смертей:", error.message);
      } else {
        
        const currentAudio = playRandomTrack(audioState);
        
        if (channelAudioRef.current) {
          try {
            await channelAudioRef.current.send({
              type: 'broadcast',
              event: 'new-audio',
              payload: { message: currentAudio },
            });
            
            console.log("📡 Сообщение отправлено:", currentAudio);
          } catch (error) {
            console.error("Ошибка при отправке аудио:", error);
          }
        }
        
        setDeathCounter(data);
      }
    }
  };
  
  // Выбор босса
  const selectBoss = (bossId: number) => {
    const boss = bosses.find((b) => b.id === bossId) || null;
    setSelectedBoss(boss);
  };
  
  // Остановка таймера при победе и проигрывание музыки
  const handleBossWin = async () => {
    if (!selectedBoss) return;
    
    const setTimerStatus = useTimerStore.getState().setTimerStatus;
    setTimerStatus("finished");
    
    const currentAudio = playWinTrack(audioState);
    
    if (channelAudioRef.current) {
      try {
        await channelAudioRef.current.send({
          type: 'broadcast',
          event: 'new-audio',
          payload: { message: currentAudio },
        });
        
        console.log("📡 Сообщение отправлено:", currentAudio);
      } catch (error) {
        console.error("Ошибка при отправке аудио:", error);
      }
    }
  };
  
  
  
  return (
    <>
      {/* <Confetti */}
      {/*   run={isConfetti} */}
      {/*   width={1920} */}
      {/*   height={1080} */}
      {/* /> */}
      <div className="flex flex-col gap-8 row-start-2 items-center justify-center sm:items-start mb-8">
        <Image className="mx-auto" src="/papich.gif" alt="Гифка папича" width={250} height={250} />
        <div className="flex justify-center w-full">
          <BossSelectMenu bosses={bosses} onSelectBoss={selectBoss} setBosses={setBosses} />
        </div>
        {selectedBoss ? (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl">{selectedBoss.name}</h2>
            <p>{selectedBoss.description ?? ""}</p>
            <TimerComponent bossId={selectedBoss.id} />
            <div className="flex flex-row justify-center items-center gap-x-8">
              <Button size="icon" className="px-9 py-8" onClick={decrementDeathCount}>
                <Minus size={72} />
              </Button>
              <h2 className="text-8xl">{deathCounter?.death_count || 0}</h2>
              <Button size="icon" className="px-9 py-8" onClick={incrementDeathCount}>
                <Plus size={72} />
              </Button>
            </div>
            <Button onClick={handleBossWin} className="text-center mt-6 text-xl">
              Победа
              <Crown />
            </Button>
          </div>
        ) : (
          <p className="text-lg text-gray-500">Выберите босса, чтобы начать.</p>
        )}
      </div>
      <footer className="flex flex-col justify-center items-center w-full gap-x-4 mb-5">
        <h3 className="text-lg mb-3">Музыка:</h3>
        <div className="flex flex-row justify-center w-full gap-x-4">
          <Button onClick={() => stopCurrentTrack(audioState.currentAudio, audioState.setCurrentAudio)}>
            <Pause />
            Пауза
          </Button>
          {
            audioState.isAudioEnabled
              ? <Button onClick={() => toggleMusicState(audioState.toggleAudio)}>
                <VolumeOff />
                Запретить
            </Button>
              : <Button onClick={() => toggleMusicState(audioState.toggleAudio)}>
                <Volume2 />
                Разрешить
              </Button>
          }
        </div>
      </footer>
    </>
  );
}
