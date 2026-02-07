import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

interface TaskType {
    id: string;
    name: string;
    category: string;
    points: number;
}

export default function ReportForm({ onSuccess }: { onSuccess: () => void }) {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/tasks').then(res => setTasks(res.data));
    }, []);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await api.post('/reports', {
                ...data,
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
            });
            reset();
            onSuccess();
        } catch (e) {
            alert('Не удалось отправить отчет');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Вид работы</label>
                <select {...register('typeId', { required: true })} className="w-full p-2 border rounded bg-background text-foreground">
                    <option value="">Выберите задачу...</option>
                    {tasks.map(t => (
                        <option key={t.id} value={t.id}>{t.category} - {t.name} ({t.points} баллов)</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Дата</label>
                <input
                    type="date"
                    {...register('date')}
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border rounded bg-background text-foreground"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Ссылка на доказательства (Imgur/Discord)</label>
                <input {...register('proofUrl', { required: true })} className="w-full p-2 border rounded bg-background text-foreground" placeholder="https://..." />
            </div>

            <button disabled={loading} type="submit" className="w-full p-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity">
                {loading ? 'Отправка...' : 'Отправить отчет'}
            </button>
        </form>
    );
}
