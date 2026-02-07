import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import StatsCard from './StatsCard';
import { Users, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AdminStats {
    pendingCount: number;
    approvedToday: number;
    activeAgents: number;
    chartData: { name: string; points: number }[];
}

export default function AdminStatsView() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/reports/admin-stats');
                setStats(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Загрузка информации...</div>;
    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="На проверке"
                    value={stats.pendingCount}
                    icon={AlertCircle}
                    description="Отчетов ожидает обработки"
                />
                <StatsCard
                    title="Одобрено сегодня"
                    value={stats.approvedToday}
                    icon={FileCheck}
                    description="Отчетов принято за день"
                />
                <StatsCard
                    title="Активные агенты"
                    value={stats.activeAgents}
                    icon={Users}
                    description="Сдали отчет за 7 дней"
                />
                <StatsCard
                    title="Общая активность"
                    value="Сводка"
                    icon={TrendingUp}
                    description="Общая динамика отдела"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-7 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                        <div className="flex flex-col space-y-1.5 pb-4">
                            <h3 className="font-semibold leading-none tracking-tight">Общая продуктивность (баллы)</h3>
                            <p className="text-sm text-muted-foreground">Суммарное количество заработанных баллов всем отделом за неделю.</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData}
                                    margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
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
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="points"
                                        stroke="#8b5cf6"
                                        fillOpacity={1}
                                        fill="url(#colorPoints)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
