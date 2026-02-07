import { useState } from 'react';
import ReportsTable from '../components/ReportsTable';
import TasksConfig from '../components/TasksConfig';
import UsersTable from '../components/UsersTable';
import RanksConfig from '../components/RanksConfig';
import DepartmentsConfig from '../components/DepartmentsConfig';
import DiscordSettings from '../components/DiscordSettings';
import AdminStatsView from '../components/AdminStatsView';

export default function AdminDashboard() {
    const [tab, setTab] = useState<'overview' | 'reports' | 'users' | 'tasks' | 'systems'>('overview');

    return (
        <div className="space-y-6">
            <div className="w-full">
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto">
                    {[
                        { id: 'overview', label: 'Обзор' },
                        { id: 'reports', label: 'Отчеты' },
                        { id: 'tasks', label: 'Задачи' },
                        { id: 'users', label: 'Сотрудники' },
                        { id: 'systems', label: 'Система' }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as any)}
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 capitalize ${tab === t.id ? 'bg-background text-foreground shadow-sm' : ''}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-background rounded-lg border shadow-sm p-6 min-h-[500px]">
                {tab === 'overview' && <AdminStatsView />}
                {tab === 'reports' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Все Отчеты</h2>
                        <ReportsTable isAdmin={true} />
                    </div>
                )}
                {tab === 'tasks' && <TasksConfig />}
                {tab === 'users' && <UsersTable />}
                {tab === 'systems' && (
                    <div className="space-y-12">
                        <RanksConfig />
                        <hr />
                        <DepartmentsConfig />
                        <hr />
                        <DiscordSettings />
                    </div>
                )}
            </div>
        </div>
    );
}
