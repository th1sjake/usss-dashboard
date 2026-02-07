import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Loader2, Settings } from 'lucide-react';
import ProfileSettingsModal from './components/ProfileSettingsModal';

const ProtectedRoute = () => {
  const { user, isLoading, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b bg-card px-8 py-4 flex justify-between items-center mb-0">
        <h1 className="text-xl font-bold">Портал USSS</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Настройки профиля"
          >
            <Settings className="h-5 w-5" />
          </button>
          <span>{user.staticId}</span>
          <span className="text-xs px-2 py-1 bg-primary/20 rounded text-primary">{user.role}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Выйти</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6">
        <Outlet />
      </main>
      {showSettings && <ProfileSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};

const RoleRoot = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Dashboard />;
};

const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <AdminDashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RoleRoot />} />
            <Route path="/admin" element={<AdminRoute />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
