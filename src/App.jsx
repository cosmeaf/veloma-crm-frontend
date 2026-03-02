import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Spinner from './components/ui/Spinner';

// Layout principal
import DashboardLayout from './components/layout/DashboardLayout';

// AUTH LAYER
import AuthLayout from './pages/auth/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Recovery from './pages/auth/RecoveryPage';
import OtpVerify from './pages/auth/OtpVerify';
import ResetPassword from './pages/auth/ResetPasswordPage';

// Internas
import DashboardHome from './pages/DashboardHome';
import ConverterHome from './pages/ConverterHome';

// Bancos
import MillenniumPage from './pages/banks/MillenniumPage';
import BradescoPage from './pages/banks/BradescoPage';

// Genéricas
import EntityView from './components/generic/EntityView';
import { BANCOS, FINANCAS, EFATURA, SS } from './config/entities';

const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
    <Spinner size="lg" />
  </div>
);

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ================= AUTH ================= */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/registrar" element={<Register />} />
              <Route path="/recuperar-senha" element={<Recovery />} />
              <Route path="/verificar-otp" element={<OtpVerify />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* ================= DASHBOARD PRIVADO ================= */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              
              <Route path="bancos" element={<EntityView config={BANCOS} />} />
              <Route path="financas" element={<EntityView config={FINANCAS} />} />
              <Route path="efatura" element={<EntityView config={EFATURA} />} />
              <Route path="seguranca-social" element={<EntityView config={SS} />} />
              
              <Route path="converter-extrato">
                <Route index element={<ConverterHome />} />
                <Route path="millennium" element={<MillenniumPage />} />
                <Route path="bradesco" element={<BradescoPage />} />
                <Route path="*" element={<Navigate to="/dashboard/converter-extrato" replace />} />
              </Route>

              <Route path="settings" element={<div className="p-4">Configurações (Em breve)</div>} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* ================= GLOBAL FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}