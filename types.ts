export interface HistoryItem {
    id: string;
    question: string;
    answer: string;
    timestamp: number;
    imagePreview?: string;
}

export enum SolverStatus {
    IDLE = 'IDLE',
    THINKING = 'THINKING',
    SOLVING = 'SOLVING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR'
}

export interface SolverState {
    status: SolverStatus;
    result: string | null;
    error: string | null;
}
