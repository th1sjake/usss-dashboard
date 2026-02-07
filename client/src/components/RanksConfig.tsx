import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

interface Rank {
    id: number;
    name: string;
    weight: number;
}

export default function RanksConfig() {
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const [editingRankId, setEditingRankId] = useState<number | null>(null);

    const fetchRanks = () => api.get('/ranks').then(res => setRanks(res.data));
    useEffect(() => { fetchRanks(); }, []);

    const onDelete = async (id: number) => {
        if (confirm('Вы уверены? Не удаляйте ранги, которые назначены пользователям!')) {
            await api.delete(`/ranks/${id}`);
            fetchRanks();
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            if (editingRankId) {
                await api.patch(`/ranks/${editingRankId}`, data);
                setEditingRankId(null);
            } else {
                await api.post('/ranks', data);
            }
            reset();
            fetchRanks();
        } finally {
            setLoading(false);
        }
    };

    const onEdit = (rank: Rank) => {
        setEditingRankId(rank.id);
        reset({ name: rank.name, weight: rank.weight });
    };

    const onCancel = () => {
        setEditingRankId(null);
        reset({ name: '', weight: '' });
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">{editingRankId ? 'Редактировать Ранг' : 'Добавить Ранг'}</h3>
                            <p className="text-sm text-muted-foreground">Управление ранговой системой.</p>
                        </div>
                        <div className="p-6 pt-0">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Название</label>
                                    <input {...register('name', { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Вес (сортировка)</label>
                                    <input {...register('weight', { required: true })} type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                                </div>
                                <div className="flex gap-2">
                                    <button disabled={loading} type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                        {loading ? 'Сохранение...' : (editingRankId ? 'Обновить' : 'Добавить')}
                                    </button>
                                    {editingRankId && (
                                        <button type="button" onClick={onCancel} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                            Отмена
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Вес</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Название</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {ranks.map(r => (
                                    <tr key={r.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">{r.weight}</td>
                                        <td className="p-4 align-middle font-medium">{r.name}</td>
                                        <td className="p-4 align-middle flex gap-2">
                                            <button onClick={() => onEdit(r)} className="text-primary hover:underline text-sm font-medium">Изм.</button>
                                            <button onClick={() => onDelete(r.id)} className="text-destructive hover:underline text-sm font-medium">Удал.</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
