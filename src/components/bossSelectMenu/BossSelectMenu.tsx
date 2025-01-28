"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Boss, NewBoss } from "@/types/boss";

interface BossSelectMenuProps {
	bosses: Boss[];
	onAddBoss: (newBoss: NewBoss) => void;
	onSelectBoss: (bossId: number) => void;
}

export const BossSelectMenu: React.FC<BossSelectMenuProps> = ({ bosses, onAddBoss, onSelectBoss }) => {
	const [newBossName, setNewBossName] = useState<string>("");
	const [newBossDescription, setNewBossDescription] = useState<string>("");
	
	const handleAddBoss = () => {
		if (newBossName.trim()) {
			onAddBoss({ name: newBossName, description: newBossDescription });
			setNewBossName("");
			setNewBossDescription("");
		}
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
						<Button type="button" onClick={handleAddBoss}>
							Добавить босса
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
