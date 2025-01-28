"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Boss } from "@/types/boss";

interface BossSelectMenuProps {
	bosses: Boss[];
	onSelectBoss: (bossId: number) => void;
	setBosses: (bosses: Boss[]) => void;
}

export const BossSelectMenu: React.FC<BossSelectMenuProps> = ({ bosses, onSelectBoss, setBosses }) => {
	const [newBossName, setNewBossName] = useState<string>("");
	const [newBossDescription, setNewBossDescription] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	
	const handleAddBoss = async () => {
		if (!newBossName.trim()) return;
		
		setLoading(true);
		
		// Добавляем босса в Supabase
		const { data: bossData, error: bossError } = await supabase
			.from("bosses")
			.insert({ name: newBossName, description: newBossDescription })
			.select()
			.single();
		
		if (bossError) {
			console.error("Ошибка при добавлении босса:", bossError.message);
			setLoading(false);
			return;
		}
		
		// Создаем запись в death_counters
		const { error: counterError } = await supabase
			.from("death_counters")
			.insert({ boss_id: bossData.id, death_count: 0 });
		
		if (counterError) {
			console.error("Ошибка при создании death_counters:", counterError.message);
		}
		
		// Создаем запись в timers
		const { error: timerError } = await supabase
			.from("timers")
			.insert({
				boss_id: bossData.id,
				elapsed_time: 0,
				status: "stopped",
			});
		
		if (timerError) {
			console.error("Ошибка при создании timers:", timerError.message);
		}
		
		// Добавляем нового босса в state
		setBosses([...bosses, bossData]);
		
		// Очищаем инпуты
		setNewBossName("");
		setNewBossDescription("");
		setLoading(false);
	};
	
	return (
		<div className="flex flex-col items-center gap-4">
			{/* Select Menu */}
			<Select onValueChange={(value) => (value === "add" ? null : onSelectBoss(Number(value)))}>
				<SelectTrigger className="w-[240px]">
					<SelectValue placeholder="Выберите босса" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{bosses.map((boss) => (
							<SelectItem key={boss.id} value={boss.id.toString()}>
								{boss.name}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			
			{/* Dialog for Adding New Boss */}
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">Добавить босса</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Добавить нового босса</DialogTitle>
						<DialogDescription>
							Укажите имя и описание босса.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Имя
							</Label>
							<Input
								id="name"
								value={newBossName}
								onChange={(e) => setNewBossName(e.target.value)}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="description" className="text-right">
								Описание
							</Label>
							<Input
								id="description"
								value={newBossDescription}
								onChange={(e) => setNewBossDescription(e.target.value)}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" onClick={handleAddBoss} disabled={loading}>
							{loading ? "Добавление..." : "Добавить босса"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
