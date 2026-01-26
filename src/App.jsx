import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Spinner from "./components/ui/Spinner";

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

// Páginas Públicas
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecoveryPage from "./pages/RecoveryPage";

// Páginas Internas
import DashboardHome from "./pages/DashboardHome";
import ConverterHome from "./pages/ConverterHome";
import BankUploadPage from "./pages/BankUploadPage"; // Genérica (backup)

// Página Específica Millennium
import MillenniumPage from "./pages/banks/MillenniumPage";

// Componentes Genéricos
import EntityView from "./components/generic/EntityView";
import { BANCOS, FINANCAS, EFATURA, SS } from "./config/entities";

const PageLoader = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
    <Spinner size="lg" />
    <p className="mt-4 text-gray-500 animate-pulse">Carregando...</p>
  </div>
);

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registrar" element={<Register />} />
            <Route path="/recuperar-senha" element={<RecoveryPage />} />

            {/* Privadas */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="bancos" element={<EntityView config={BANCOS} />} />
              <Route path="financas" element={<EntityView config={FINANCAS} />} />
              <Route path="efatura" element={<EntityView config={EFATURA} />} />
              <Route path="seguranca-social" element={<EntityView config={SS} />} />

              {/* Grupo: Converter de Extratos */}
              <Route path="converter-extrato">
                <Route index element={<ConverterHome />} />

                {/* Rota Específica Millennium */}
                <Route path="millennium" element={<MillenniumPage />} />

                {/* Rota Genérica para outros bancos */}
                <Route path=":bankId" element={<BankUploadPage />} />
              </Route>

              <Route path="settings" element={<div className="p-4">Configurações (Em breve)</div>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;