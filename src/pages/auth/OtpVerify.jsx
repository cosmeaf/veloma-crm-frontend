import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from "../../services/auth.service"; // Certifique-se que o caminho está correto
import { ShieldCheck, ArrowLeft, Clock, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false); // Loading separado para reenvio
  
  // --- LÓGICA DO TIMER (BASEADA NO BACKEND) ---
  // 10 minutos = 600 segundos
  const [timeLeft, setTimeLeft] = useState(600); 
  const [isExpired, setIsExpired] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    // Foca no input ao montar
    if (inputRef.current) {
        inputRef.current.focus();
    }

    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Formata os segundos para MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      toast.error('Email não encontrado. Inicie novamente.');
      navigate('/recuperar-senha');
    }
  }, [email, navigate]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isExpired) {
      toast.error('O código expirou. Solicite um novo.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.otpVerify({
        email,
        code,
      });

      const { reset_token } = response.data;

      toast.success('Código validado!');
      navigate(`/reset-password/${reset_token}`);

    } catch (error) {
      // O backend retorna "Código expirado" se tentar validar um código antigo
      const msg = error.response?.data?.detail || 'Código inválido.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Função de Reenvio conectada ao Backend
  const handleResend = async () => {
    setLoadingResend(true);
    try {
      // Chama o mesmo endpoint de recuperação para gerar um novo OTP
      await authService.recovery(email);
      
      toast.success('Novo código enviado para o seu email!');
      
      // Reseta o timer para 10 minutos (600s)
      setTimeLeft(600);
      setIsExpired(false);
      setCode(''); // Limpa o input
      
      // Foca novamente no input
      setTimeout(() => inputRef.current?.focus(), 100);
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao solicitar novo código. Tente novamente.');
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Visual */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Verificar Código</h2>
        <p className="mt-2 text-sm text-slate-500">
          Enviamos um código para <br />
          <span className="font-semibold text-slate-800">{email}</span>
        </p>
      </div>

      {/* Timer Indicator */}
      <div className={`flex justify-center items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors duration-300 ${
        isExpired 
          ? 'bg-red-50 text-red-600 border-red-200' 
          : 'bg-blue-50 text-blue-600 border-blue-100'
      }`}>
        <Clock size={16} className={isExpired ? "animate-pulse" : ""} />
        {isExpired ? 'Código Expirado' : `Expira em: ${formatTime(timeLeft)}`}
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp-code" className="block text-sm font-medium text-slate-700 mb-1.5 text-center">
            Código de 6 Dígitos
          </label>
          <input
            ref={inputRef}
            id="otp-code"
            type="text"
            required
            maxLength={6}
            disabled={isExpired}
            className={`block w-full text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:border-blue-500 transition sm:text-sm shadow-sm bg-white uppercase font-mono ${
              isExpired 
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                : 'border-slate-300 focus:ring-blue-500'
            }`}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={loading || isExpired}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Confirmar Código'
          )}
        </button>
      </form>

      {/* Reenviar / Voltar */}
      <div className="text-center pt-2 space-y-4">
        {isExpired ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={loadingResend}
            className="flex items-center justify-center gap-2 w-full text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition-colors"
          >
            {loadingResend ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <RotateCcw size={16} /> Reenviar novo código
              </>
            )}
          </button>
        ) : (
          <p className="text-xs text-slate-400">
            Não recebeu? O código é válido por 10 minutos.
          </p>
        )}
        
        <button
          onClick={() => navigate(-1)}
          className="block w-full text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft size={16} className="inline mr-1 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>
      </div>

    </div>
  );
}