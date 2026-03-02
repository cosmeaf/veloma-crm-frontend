import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from "../../services/auth.service";
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecoveryPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error('Introduza um email válido.');
      return;
    }

    setLoading(true);

    try {
      await authService.recovery(email);
      
      toast.success('Código enviado para o seu email.');
      navigate('/verificar-otp', { state: { email } });
    } catch (error) {
      console.error('[Recovery] Error:', error);

      const msg =
        error.response?.data?.detail ||
        'Erro ao solicitar recuperação. Tente novamente.';

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Visual com Ícone Grande */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Mail size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Recuperar Palavra-passe</h2>
        <p className="mt-2 text-sm text-slate-500">
          Insira o seu email para receber as instruções de redefinição.
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="recovery-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email Corporativo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="recovery-email"
              type="email"
              required
              autoComplete="email"
              placeholder="nome@veloma.pt"
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm shadow-sm bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

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
            'Enviar Código de Recuperação'
          )}
        </button>
      </form>

      {/* Botão Voltar */}
      <div className="text-center pt-2">
        <button
          onClick={() => navigate('/login')} // Mandando direto pro login é mais seguro que voltar no histórico
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Voltar para o Login
        </button>
      </div>

    </div>
  );
}