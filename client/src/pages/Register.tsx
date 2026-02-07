import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [staticId, setStaticId] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({ staticId, password, nickname });
            navigate('/');
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <form onSubmit={handleRegister} className="w-96 space-y-6 p-8 border rounded-lg shadow-xl bg-card">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Портал USSS</h1>
                    <p className="text-sm text-muted-foreground">Создание нового аккаунта</p>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Статик ID</label>
                        <input
                            placeholder="#12345"
                            value={staticId}
                            onChange={e => setStaticId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Никнейм (RP Имя)</label>
                        <input
                            placeholder="John Doe"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Пароль</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        />
                        <div className="text-sm">
                            Не используйте пароль от игры
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                >
                    {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
                </button>

                <div className="text-center text-sm">
                    <Link to="/login" className="text-primary hover:underline">
                        Уже есть аккаунт? Войти
                    </Link>
                </div>
            </form>
        </div>
    );
}
