import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Landmark, FileText, ShieldCheck,
  Upload, Settings, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';

  return (
    <div className="flex h-screen bg-gray-100">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          ${sidebarWidth}
          bg-slate-900 text-white flex flex-col
          transition-all duration-300
          fixed lg:relative z-50 h-full
          ${mobileOpen ? 'left-0' : '-left-full lg:left-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div>
              <h1 className="text-base font-semibold">Veloma CRM</h1>
              <p className="text-xs text-slate-400">Portal Portugal</p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-slate-400 hover:text-white"
          >
            {collapsed ? '›' : '‹'}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
          {menuItems.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="border-t border-slate-800 my-3" />;
            }

            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm
                  transition-colors
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-md"
          >
            <LogOut size={18} />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col lg:ml-0">

        {/* HEADER */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-600"
          >
            <Menu size={20} />
          </button>

          {/* Título */}
          <h2 className="text-sm font-semibold text-gray-800 capitalize">
            {location.pathname.split('/').pop()?.replace('-', ' ') || 'Visão Geral'}
          </h2>

          {/* User */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs font-medium text-gray-800">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[11px] text-gray-500">{user?.email}</p>
            </div>

            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random&size=128`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-screen-2xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}