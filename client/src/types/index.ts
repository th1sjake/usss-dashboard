export type Role = 'ADMIN' | 'USER';

export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Rank {
    id: number;
    name: string;
    weight: number;
}

export interface User {
    id: string;
    userId?: string; // JWT payload uses userId
    staticId: string;
    nickname: string;
    role: Role;
    rankLink?: Rank;
    rankId: number;
    departmentLink?: { id: number; name: string };
    departmentId?: number;
}

export interface TaskType {
    id: string;
    name: string;
    category: string;
    points: number;
    isActive: boolean;
}

export interface Report {
    id: string;
    typeId: string;
    userId: string;
    proofUrl: string;
    date: string;
    points: number;
    status: ReportStatus;
    createdAt: string;
    updatedAt: string;
    user?: User;
    type?: TaskType;
}

export interface LeaderboardEntry {
    name: string;
    staticId: string;
    rank: string;
    dept: string;
    pointsDay: number;
    pointsWeek: number;
    pointsTotal: number;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (staticId: string, pass: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}
