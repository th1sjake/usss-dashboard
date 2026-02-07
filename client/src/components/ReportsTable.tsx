import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';

interface Report {
    id: string;
    type: { name: string; category: string; points: number };
    points: number;
    status: string;
    date: string;
    proofUrl: string;
    user?: { nickname: string; staticId: string };
}

export default function ReportsTable({ isAdmin = false, refreshKey = 0 }: { isAdmin?: boolean, refreshKey?: number }) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const endpoint = isAdmin ? '/reports' : '/reports/my';
        api.get(endpoint)
            .then(res => setReports(res.data))
            .catch(() => setReports([]))
            .finally(() => setLoading(false));
    }, [isAdmin, refreshKey]);

    const [filter, setFilter] = useState('all');

    const filteredReports = reports.filter(r => {
        if (filter === 'all') return true;
        const d = new Date(r.date);
        const now = new Date();
        if (filter === 'today') return d.toDateString() === now.toDateString();
        if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return d >= weekAgo;
        }
        return true;
    });

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/reports/${id}/status`, { status });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        } catch {
            alert('Не удалось обновить статус');
        }
    };

    if (loading) return <div className="text-center p-4 text-muted-foreground">Загрузка отчетов...</div>;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'Принят';
            case 'REJECTED': return 'Отклонен';
            case 'PENDING': return 'На проверке';
            default: return status;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-background text-foreground"
                >
                    <option value="all">За все время</option>
                    <option value="today">За сегодня</option>
                    <option value="week">За неделю</option>
                </select>
            </div>
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            {isAdmin && <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Агент</th>}
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">Дата</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Задача</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Баллы</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Статус</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Док-ва</th>
                            {isAdmin && <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Действие</th>}
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {filteredReports.map((r: any) => (
                            <tr key={r.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                {isAdmin && (
                                    <td className="p-4 align-middle font-medium">
                                        <div>{r.user?.nickname}</div>
                                        <div className="text-xs text-muted-foreground">{r.user?.staticId}</div>
                                    </td>
                                )}
                                <td className="p-4 align-middle text-muted-foreground">{new Date(r.date).toLocaleDateString()}</td>
                                <td className="p-4 align-middle">
                                    <div className="font-medium">{r.type.name}</div>
                                    <div className="text-xs text-muted-foreground">{r.type.category}</div>
                                    <div className="text-xs text-muted-foreground md:hidden">+{r.points}</div>
                                </td>
                                <td className="p-4 align-middle font-bold">+{r.points}</td>
                                <td className="p-4 align-middle">
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${r.status === 'APPROVED' ? 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400' :
                                        r.status === 'REJECTED' ? 'border-transparent bg-destructive/15 text-destructive dark:text-red-400' :
                                            'border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
                                        }`}>
                                        {getStatusLabel(r.status)}
                                    </span>
                                </td>
                                <td className="p-4 align-middle max-w-[150px] truncate">
                                    <a href={r.proofUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Посмотреть</a>
                                </td>
                                {isAdmin && (
                                    <td className="p-4 align-middle">
                                        {r.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateStatus(r.id, 'APPROVED')}
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 py-1 bg-green-600 text-white hover:bg-green-700"
                                                >
                                                    Принять
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(r.id, 'REJECTED')}
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 py-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Отклонить
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {filteredReports.length === 0 && (
                            <tr><td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-muted-foreground">Отчетов не найдено</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
