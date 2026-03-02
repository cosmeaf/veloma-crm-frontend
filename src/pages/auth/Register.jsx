import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (formData.password !== formData.password2) {
      toast.error('As palavras-passe não coincidem.');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      console.log('REGISTER RESULT:', result);

      if (result && (result.success || result.access || result.user)) {
        toast.success('Conta criada com sucesso!');
        navigate('/dashboard', { replace: true });
        return;
      }

      toast.error(result?.message || 'Erro ao criar conta.');
    } catch (err) {
      console.error('REGISTER UNEXPECTED ERROR:', err);
      toast.error('Erro inesperado ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Criar conta</h2>
        <p className="mt-2 text-sm text-slate-500">
          Junte-se à equipa Veloma. Preencha os dados abaixo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Nome e Sobrenome Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1.5">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                disabled={loading}
                className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-colors"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-1.5">Sobrenome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                disabled={loading}
                className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-colors"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={loading}
              className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-colors"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Palavra-passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              required
              minLength={8}
              disabled={loading}
              className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-colors"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              disabled={loading}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirmar Senha */}
        <div>
          <label htmlFor="password2" className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar Palavra-passe</label>
          <div className="relative">
            <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="password2"
              name="password2"
              type="password"
              required
              minLength={8}
              disabled={loading}
              className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-colors"
              value={formData.password2}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
        >
          {loading ? 'A processar...' : 'Criar conta'}
        </button>
      </form>

      <div className="text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
        Já tem conta?{' '}
        <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
          Faça login
        </Link>
      </div>
    </div>
  );
}