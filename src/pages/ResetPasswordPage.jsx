import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams(); // Token vem da URL montada no passo anterior

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
      await authService.resetPassword(token, formData.password, formData.password2);
      toast.success('Senha alterada com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao alterar senha. O token pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Nova Senha</h1>
          <p className="text-gray-500 mt-2 text-sm">Defina sua nova palavra-passe.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <input type={showPass ? "text" : "password"} required minLength={8} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none pr-10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-gray-400">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input type="password" required minLength={8} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" value={formData.password2} onChange={(e) => setFormData({ ...formData, password2: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-70">{loading ? 'Alterando...' : 'Salvar Senha'}</button>
        </form>
      </div>
    </div>
  );
}