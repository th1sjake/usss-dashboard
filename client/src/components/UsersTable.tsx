import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import UserStatsModal from './UserStatsModal';

interface User {
    id: string;
    staticId: string;
    nickname: string;
    rank?: { id: number; name: string };
    rankId: number;
    departmentLink?: { id: number; name: string };
    departmentId?: number;
    role: string;
}

interface Rank {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

export default function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [viewingStatsUserId, setViewingStatsUserId] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, ranksRes, deptsRes] = await Promise.all([
                api.get('/users'),
                api.get('/users/ranks'),
                api.get('/departments')
            ]);
            setUsers(usersRes.data);
            setRanks(ranksRes.data);
            setDepartments(deptsRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onEdit = (user: User) => {
        setEditingUserId(user.id);
        setValue('nickname', user.nickname);
        setValue('staticId', user.staticId);
        setValue('rankId', user.rankId);
        setValue('departmentId', user.departmentId || '');
        setValue('role', user.role);
    };

    const onCancelEdit = () => {
        setEditingUserId(null);
        reset();
    };

    const onSave = async (data: any) => {
        try {
            await api.patch(`/users/${editingUserId}`, data);
            setEditingUserId(null);
            reset();
            fetchData();
        } catch {
            alert('Не удалось обновить данные сотрудника');
        }
    };

    const onDelete = async (id: string) => {
        if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
            await api.delete(`/users/${id}`);
            fetchData();
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="space-y-4">
            {viewingStatsUserId && (
                <UserStatsModal
                    userId={viewingStatsUserId}
                    onClose={() => setViewingStatsUserId(null)}
                />
            )}
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50">
                        <tr className="border-b">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Статик</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Никнейм</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Ранг</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Отдел</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Роль</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => {
                            const isEditing = editingUserId === u.id;
                            return (
                                <tr key={u.id} className="border-b transition-colors hover:bg-muted/50">
                                    {isEditing ? (
                                        <>
                                            <td className="p-4"><input {...register('staticId')} className="w-full p-1 border rounded bg-background" /></td>
                                            <td className="p-4"><input {...register('nickname')} className="w-full p-1 border rounded bg-background" /></td>
                                            <td className="p-4">
                                                <select {...register('rankId')} className="w-full p-1 border rounded bg-background">
                                                    {ranks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <select {...register('departmentId')} className="w-full p-1 border rounded bg-background">
                                                    <option value="">-</option>
                                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <select {...register('role')} className="w-full p-1 border rounded bg-background">
                                                    <option value="USER">USER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </td>
                                            <td className="p-4 flex gap-2 justify-end">
                                                <button onClick={handleSubmit(onSave)} className="text-green-600 hover:underline">Сохр.</button>
                                                <button onClick={onCancelEdit} className="text-muted-foreground hover:underline">Отмена</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4">{u.staticId}</td>
                                            <td className="p-4">{u.nickname}</td>
                                            <td className="p-4">{(u as any).rankLink?.name || '-'}</td>
                                            <td className="p-4">{u.departmentLink?.name || '-'}</td>
                                            <td className="p-4">{u.role}</td>
                                            <td className="p-4 flex gap-2 justify-end">
                                                <button onClick={() => setViewingStatsUserId(u.id)} className="text-blue-500 hover:underline">Стат.</button>
                                                <button onClick={() => onEdit(u)} className="text-primary hover:underline">Изм.</button>
                                                <button onClick={() => onDelete(u.id)} className="text-destructive hover:underline">Удал.</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
