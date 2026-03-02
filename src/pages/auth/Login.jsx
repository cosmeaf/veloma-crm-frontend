import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const result = await login(form);

    if (result.success) {
      toast.success('Login efetuado com sucesso.');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Título da Página */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Entrar na conta</h2>
        <p className="mt-2 text-sm text-slate-500">
          Bem-vindo de volta. Insira seus dados para aceder.
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="space-y-5">
          
          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Endereço de email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm shadow-sm bg-white"
                placeholder="nome@veloma.pt"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Input Senha */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Palavra-passe
              </label>
              <div className="text-sm">
                <Link to="/recuperar-senha" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm shadow-sm bg-white"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Botão Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center gap-2">
                Entrar no Sistema <ArrowRight size={18} />
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Link para Registro */}
      <div className="text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
        Não tem conta?{' '}
        <Link to="/registrar" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
          Criar conta
        </Link>
      </div>
    </div>
  );
}