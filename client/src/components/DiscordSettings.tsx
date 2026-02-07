import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

interface DiscordConfig {
    webhookUrl: string;
    messageId?: string;
}

export default function DiscordSettings() {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, setValue } = useForm<DiscordConfig>();

    useEffect(() => {
        api.get('/discord/config').then(res => {
            if (res.data) {
                setValue('webhookUrl', res.data.webhookUrl);
                setValue('messageId', res.data.messageId);
            }
        });
    }, [setValue]);

    const onSubmit = async (data: DiscordConfig) => {
        setLoading(true);
        try {
            await api.post('/discord/config', data);
            alert('Настройки сохранены');
        } catch {
            alert('Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const forceUpdate = async () => {
        if (!confirm('Это принудительно обновит сообщение в Discord. Продолжить?')) return;
        try {
            await api.post('/discord/update-leaderboard');
            alert('Лидерборд обновлен');
        } catch {
            alert('Ошибка обновления');
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold leading-none tracking-tight">Настройки Discord</h3>
                    <p className="text-sm text-muted-foreground">Настройка интеграции с Discord Webhook.</p>
                </div>
                <div className="p-6 pt-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Webhook URL</label>
                            <input
                                {...register('webhookUrl', { required: true })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="https://discord.com/api/webhooks/..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Message ID (Оставьте пустым для создания нового)</label>
                            <input
                                {...register('messageId')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="123456789..."
                            />
                        </div>
                        <div className="flex gap-4">
                            <button disabled={loading} type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button type="button" onClick={forceUpdate} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                                Обновить Лидерборд
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
