import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
    );
}
