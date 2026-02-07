import { useState } from 'react';
import ReportForm from '../components/ReportForm';
import ReportsTable from '../components/ReportsTable';
import UserStatsView from '../components/UserStatsView';

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-6 px-4">
            <UserStatsView />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">Новый Отчет</h3>
                            <p className="text-sm text-muted-foreground">Заполните форму для отправки отчета.</p>
                        </div>
                        <div className="p-6 pt-0">
                            <ReportForm onSuccess={() => setRefreshKey(k => k + 1)} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">Моя История</h3>
                            <p className="text-sm text-muted-foreground">Ваши последние отчеты и их статус.</p>
                        </div>
                        <div className="p-6 pt-0">
                            <ReportsTable isAdmin={false} refreshKey={refreshKey} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
