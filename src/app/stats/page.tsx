"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from "lucide-react";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	ColumnDef,
	flexRender,
} from "@tanstack/react-table";
import { formatTime } from "@/utils/formatTime";
import { useDebounce } from "@/utils/useDebounce";

interface BossStats {
	id: number;
	name: string;
	deathCount: number;
	elapsedTime: number;
	status: "Побежден" | "Еще жив";
}

export default function StatsPage() {
	const [data, setData] = useState<BossStats[]>([]);
	const [sorting, setSorting] = useState<SortingState>([{id: "deathCount", desc: true}]);
	const [filter, setFilter] = useState("");
	const debouncedFilter = useDebounce(filter, 300);
	
	// Загрузка данных
	useEffect(() => {
		const fetchStats = async () => {
			const { data: bosses, error: bossesError } = await supabase
				.from("bosses")
				.select("id, name");
			
			if (bossesError) {
				console.error("Ошибка загрузки боссов:", bossesError.message);
				return;
			}
			
			const { data: deaths, error: deathsError } = await supabase
				.from("death_counters")
				.select("boss_id, death_count");
			
			if (deathsError) {
				console.error("Ошибка загрузки смертей:", deathsError.message);
				return;
			}
			
			const { data: timers, error: timersError } = await supabase
				.from("timers")
				.select("boss_id, elapsed_time, status");
			
			if (timersError) {
				console.error("Ошибка загрузки таймеров:", timersError.message);
				return;
			}
			
			// Объединяем данные
			const stats = bosses.map((boss) => {
				const deathEntry = deaths.find((d) => d.boss_id === boss.id);
				const timerEntry = timers.find((t) => t.boss_id === boss.id);
				
				return {
					id: boss.id,
					name: boss.name,
					deathCount: deathEntry ? deathEntry.death_count : 0,
					elapsedTime: timerEntry ? timerEntry.elapsed_time : 0,
					status: timerEntry?.status === "finished" ? "Побежден" : "Еще жив",
				};
			});
			
			setData(stats as BossStats[]);
		};
		
		fetchStats();
	}, []);
	
	// Фильтрация данных
	const filteredData = useMemo(() => {
		return data.filter((boss) =>
			boss.name.toLowerCase().includes(debouncedFilter.toLowerCase())
		);
	}, [data, debouncedFilter]);
	
	// Функция смены сортировки
	const toggleSorting = (columnId: string) => {
		setSorting((prev) => {
			const isSorted = prev.find((s) => s.id === columnId);
			if (isSorted) {
				// Если уже сортируем по этому столбцу, меняем направление
				return isSorted.desc ? [{ id: columnId, desc: false }] : [{ id: columnId, desc: true }];
			} else {
				// Если это новый столбец, сортируем по возрастанию
				return [{ id: columnId, desc: false }];
			}
		});
	};
	
	const renderSortIcon = (columnId: string) => {
		if (!sorting || !sorting[0]) return null;
		
		if (sorting[0].id === columnId && sorting[0].desc) {
			return <ArrowDownWideNarrow />;
		}
		else if (sorting[0].id === columnId && !sorting[0].desc) {
			return <ArrowDownNarrowWide />;
		}
		else return null
	}
	
	// Создаем таблицу
	const table = useReactTable({
		data: filteredData,
		columns: [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => toggleSorting("name")}
					>
						Босс {renderSortIcon("name")}
					</Button>
				),
				cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
			},
			{
				accessorKey: "deathCount",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => toggleSorting("deathCount")}
					>
						Кол-во смертей {renderSortIcon("deathCount")}
					</Button>
				),
				cell: ({ row }) => <div className="text-center">{row.getValue("deathCount")}</div>,
			},
			{
				accessorKey: "elapsedTime",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => toggleSorting("elapsedTime")}
					>
						Время {renderSortIcon("elapsedTime")}
					</Button>
				),
				cell: ({ row }) => <div className="text-center">{formatTime(row.getValue("elapsedTime"))}</div>,
			},
			{
				accessorKey: "status",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => toggleSorting("status")}
					>
						Статус {renderSortIcon("status")}
					</Button>
				),
				cell: ({ row }) => (
					<div className={`text-center font-bold ${row.getValue("status") === "Побежден" ? "text-green-500" : "text-red-500"}`}>
						{row.getValue("status")}
					</div>
				),
			},
		],
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: { sorting },
		onSortingChange: setSorting,
	});
	
	return (
		<div className="w-full px-2 py-4 lg:p-6 flex flex-col items-center">
			<h1 className="text-3xl font-semibold mb-4">Статистика</h1>
			<Input
				placeholder="Поиск босса..."
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
				className="max-w-sm mb-4"
			/>
			<div className="w-full max-w-3xl rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-6">
									Нет данных.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
