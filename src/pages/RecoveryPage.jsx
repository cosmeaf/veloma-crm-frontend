import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Recuperar Palavra-passe
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Insira o seu email para receber o código de recuperação.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                A enviar...
              </>
            ) : (
              'Receber Código'
            )}
          </button>
        </form>

        {/* Back */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
