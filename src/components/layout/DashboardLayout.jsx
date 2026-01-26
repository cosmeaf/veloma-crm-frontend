import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Landmark, FileText, ShieldCheck,
  Upload, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard' },
    { divider: true },
    { name: 'Bancos', icon: Building2, path: '/dashboard/bancos' },
    { name: 'Finanças', icon: Landmark, path: '/dashboard/financas' },
    { name: 'E-Fatura', icon: FileText, path: '/dashboard/efatura' },
    { name: 'Segurança Social', icon: ShieldCheck, path: '/dashboard/seguranca-social' },
    { name: 'Converter Extrato', icon: Upload, path: '/dashboard/converter-extrato' },
    { divider: true },
    { name: 'Configurações', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Veloma CRM</h1>
            <p className="text-xs text-slate-400">Portal Portugal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item, index) => {
            if (item.divider) return <li key={`div-${index}`} className="my-2 border-t border-slate-700" />;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.name} to={item.path} className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} className="opacity-70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-sm font-medium">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* HEADER COM DADOS DO USUÁRIO */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 shadow-sm z-10">
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            {location.pathname.split('/').pop()?.replace('-', ' ') || 'Visão Geral'}
          </h2>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <p className="text-xs text-gray-500">{user?.email}</p>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                  {user?.role || 'User'}
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
              <img src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random&size=128`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Outlet /> {/* Onde o conteúdo da rota filha aparece */}
        </div>
      </main>
    </div>
  );
}