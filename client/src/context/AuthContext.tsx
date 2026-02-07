import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import type { User, AuthState } from '../types';

export { api };

const AuthContext = createContext<AuthState>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/profile');
                    // The backend /profile currently returns basic info, might need to ensure backend returns full user
                    // The JwtStrategy returns { userId, username, role, staticId }
                    // We need to map it or update backend to return full User object.
                    // Assuming backend returns enough for now or we update types.
                    // Let's coerce for now as we fix backend later if needed.
                    setUser(data as User);
                } catch (e) {
                    console.error("Auth check failed", e);
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (staticId: string, pass: string) => {
        const res = await api.post('/auth/login', { staticId, password: pass });
        const token = res.data.access_token;
        localStorage.setItem('token', token);
        // Fetch profile immediately
        const profile = await api.get('/auth/profile');
        setUser(profile.data as User);
    };

    const register = async (userData: any) => {
        const res = await api.post('/auth/register', userData);
        // Auto login after register? Or just return
        // For now let's login
        const loginRes = await api.post('/auth/login', { staticId: userData.staticId, password: userData.password });
        const token = loginRes.data.access_token;
        localStorage.setItem('token', token);
        const profile = await api.get('/auth/profile');
        setUser(profile.data as User);
    }

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
