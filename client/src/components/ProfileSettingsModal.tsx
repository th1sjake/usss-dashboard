import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api, useAuth } from '../context/AuthContext';
import { X, Save } from 'lucide-react';

interface ProfileSettingsModalProps {
    onClose: () => void;
}

interface Rank {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

export default function ProfileSettingsModal({ onClose }: ProfileSettingsModalProps) {
    const { user } = useAuth();
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        const load = async () => {
            try {
                const [rRes, dRes, uRes] = await Promise.all([
                    api.get('/users/ranks'),
                    api.get('/departments'),
                    api.get('/users/me') // Gets current user fresh data
                ]);
                setRanks(rRes.data);
                setDepartments(dRes.data);

                const profile = uRes.data;
                setValue('nickname', profile.nickname);
                setValue('rankId', profile.rankId); // Assuming id
                setValue('departmentId', profile.departmentId || '');
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [setValue]);

    const onSubmit = async (data: any) => {
        try {
            // We need user ID. Since we loaded /users/me, let's store it or just use the one from Context which might be partial but has ID.
            // Actually, /users/me works. BUT PATCH endpoint expects ID.
            // context user usually has userId.
            // Let's rely on user?.userId assuming it's in context. If not, use data from uRes.
            // But uRes is in buffer. 
            // Better: 'user' from useAuth() has 'userId'.
            const userId = user?.userId || user?.id;
            await api.patch(`/users/${userId}`, data);
            alert('Профиль обновлен! Пожалуйста, перезайдите, если изменились важные данные.');
            onClose();
            window.location.reload(); // Simple way to refresh app state
        } catch (e) {
            alert('Ошибка обновления профиля');
            console.error(e);
        }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-lg border bg-background p-6 shadow-lg sm:max-w-md w-full relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <h2 className="text-lg font-semibold mb-4">Настройки профиля</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Никнейм</label>
                        <input
                            {...register('nickname', { required: true })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Пароль (оставьте пустым, если не меняете)</label>
                        <input
                            type="password"
                            {...register('password')}
                            placeholder="Новый пароль"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ранг</label>
                            <select
                                {...register('rankId', { required: true })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {ranks.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Отдел</label>
                            <select
                                {...register('departmentId')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Нет отдела</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
