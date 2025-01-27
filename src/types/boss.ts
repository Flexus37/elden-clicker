export interface Boss {
	id: number;
	name: string;
	description?: string;
	image_url?: string;
	created_at: string;
}

// Тип для создания нового босса (только минимально необходимые поля)
export type NewBoss = {
	name: string;
	description?: string;
};

export interface DeathCounter {
	id: number;
	boss_id: number;
	death_count: number;
	updated_at: string;
}
