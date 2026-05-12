export interface Subtask {
    id: number;
    goal: number;
    title: string;
    is_completed: boolean;
    completed_at: string | null;
    created_at: string;
}

export interface Goal {
    id: number;
    user: number;
    title: string;
    description: string | null;
    deadline: string | null;
    criterion: string;
    status: 'active' | 'completed' | 'archived' | 'failed';
    progress_percent: number;
    created_at: string;
    updated_at: string;
    subtasks?: Subtask[];
}