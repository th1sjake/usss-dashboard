import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import StatsCard from './StatsCard';
import { Activity, Award, Calendar, FileText } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface UserStats {
    pointsDay: number;
    pointsWeek: number;
    pointsTotal: number;
    pending: number;
    rejected: number;
    chartData: { name: string; points: number }[];
}

interface UserStatsViewProps {
    userId?: string; // Optional: if provided, fetches stats for this user (Admin use case)
    isAdminView?: boolean;
}

export default function UserStatsView({ userId, isAdminView = false }: UserStatsViewProps) {
    const [stats, setStats] = useState<UserStats & { weekStart: string, weekEnd: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // If userId is provided, use admin endpoint
                const url = userId
                    ? `/reports/stats/${userId}?offset=${offset}`
                    : `/reports/stats?offset=${offset}`;

                const res = await api.get(url);
                setStats(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [offset, userId]);

    if (loading) return <div className="p-4">Загрузка статистики...</div>;
    if (!stats) return null;

    const startDate = new Date(stats.weekStart).toLocaleDateString();
    const endDate = new Date(stats.weekEnd).toLocaleDateString();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">
                    Статистика {isAdminView ? '(Просмотр сотрудника)' : ''}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setOffset(o => o + 1)}
                        className="p-2 rounded-md border text-sm hover:bg-accent"
                    >
                        ← Прошлая неделя
                    </button>
                    <span className="text-sm font-medium border px-3 py-2 rounded-md bg-muted/50">
                        {startDate} - {endDate}
                    </span>
                    <button
                        onClick={() => setOffset(o => o - 1)}
                        disabled={offset === 0}
                        className="p-2 rounded-md border text-sm hover:bg-accent disabled:opacity-50"
                    >
                        Следующая неделя →
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title={offset === 0 ? "За день" : "За день (ср.)"} // Slight label change
                    value={stats.pointsDay}
                    icon={Activity}
                    description={offset === 0 ? "Баллов заработано сегодня" : "Данные за выбранный день (пн)"}
                />
                <StatsCard
                    title="За неделю"
                    value={stats.pointsWeek}
                    icon={Calendar}
                    description={`Баллов за период`}
                />
                <StatsCard
                    title="Всего баллов"
                    value={stats.pointsTotal}
                    icon={Award}
                    description="Общая сумма баллов"
                />
                <StatsCard
                    title="На проверке"
                    value={stats.pending}
                    icon={FileText}
                    description="Отчетов ожидает проверки"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                        <div className="flex flex-col space-y-1.5 pb-4">
                            <h3 className="font-semibold leading-none tracking-tight">Активность за выбранную неделю</h3>
                            <p className="text-sm text-muted-foreground">{startDate} - {endDate}</p>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="points" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {stats.rejected > 0 && (
                    <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm border-destructive/50 bg-destructive/10">
                        <div className="p-6">
                            <h3 className="font-semibold text-destructive mb-2">Отклоненные отчеты</h3>
                            <p className="text-sm text-foreground/80">
                                У вас есть {stats.rejected} отклоненных отчетов. Пожалуйста, проверьте историю и исправьте ошибки.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
