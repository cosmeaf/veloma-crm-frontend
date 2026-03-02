import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from "../../services/auth.service";
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams(); 

  const [formData, setFormData] = useState({ password: '', password2: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token,
        password: formData.password,
        password2: formData.password2,
      });

      toast.success('Senha alterada com sucesso!');
      navigate('/login');

    } catch (error) {
      toast.error('Erro ao alterar senha. O token pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Visual */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Lock size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Nova Palavra-passe</h2>
        <p className="mt-2 text-sm text-slate-500">
          Crie uma senha segura para acessar sua conta.
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Nova Senha */}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Nova Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="new-password"
              type={showPass ? "text" : "password"}
              required
              minLength={8}
              className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm shadow-sm bg-white"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirmar Nova Senha */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirmar Nova Senha
          </label>
          <div className="relative">
            <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm shadow-sm bg-white"
              value={formData.password2}
              onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Salvar Senha'
          )}
        </button>
      </form>

    </div>
  );
}