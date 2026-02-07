import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

export default function TasksConfig() {
    const [tasks, setTasks] = useState<any[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);

    const fetchTasks = () => api.get('/tasks').then(res => setTasks(res.data));
    useEffect(() => { fetchTasks(); }, []);

    const onDelete = async (id: string) => {
        if (confirm('Вы уверены, что хотите удалить этот вид работы?')) {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await api.post('/tasks', { ...data, points: Number(data.points) });
            reset();
            fetchTasks();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">Добавить Вид Работы</h3>
                            <p className="text-sm text-muted-foreground">Задайте новые типы задач и их баллы.</p>
                        </div>
                        <div className="p-6 pt-0">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Название</label>
                                    <input {...register('name')} placeholder="Например: Арест" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Категория</label>
                                    <input {...register('category')} placeholder="Например: Процессуальные действия" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Баллы</label>
                                    <input {...register('points')} type="number" placeholder="10" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" required />
                                </div>
                                <button disabled={loading} type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                    {loading ? 'Добавление...' : 'Добавить'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Название</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Категория</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Баллы</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {tasks.map(t => (
                                    <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{t.name}</td>
                                        <td className="p-4 align-middle">{t.category}</td>
                                        <td className="p-4 align-middle">{t.points}</td>
                                        <td className="p-4 align-middle"><button onClick={() => onDelete(t.id)} className="text-destructive hover:underline text-sm font-medium">Удалить</button></td>
                                    </tr>
                                ))}
                                {tasks.length === 0 && (
                                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Задач пока нет</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
