import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      toast.error('Email não encontrado. Inicie novamente.');
      navigate('/recuperar-senha');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { reset_token } = await authService.otpVerify(email, code);

      // O backend retorna reset_token (uuid)
      navigate(`/reset-password/${reset_token}`);
      toast.success('Código validado!');
    } catch (error) {
      toast.error('Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Verificar Código</h1>
          <p className="text-gray-500 mt-2 text-sm">Para <strong>{email}</strong></p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Código OTP</label>
            <input type="text" required maxLength={6} className="w-full text-center text-2xl tracking-widest px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="000000" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-70">{loading ? 'Validando...' : 'Confirmar Código'}</button>
        </form>
      </div>
    </div>
  );
}