// src/pages/auth/AuthLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import { Calculator, FileText, Users, BarChart3 } from 'lucide-react';

export default function AuthLayout() {
  return (
    // h-screen = Força a altura exata da tela
    // overflow-hidden = NÃO deixa a página rolar no geral
    // flex = Divide a tela em Esquerda e Direita
    <div className="h-screen w-full overflow-hidden flex bg-slate-50">
      
      {/* =======================
          LADO ESQUERDO (BRANDING)
          ======================= */}
      <div className="hidden lg:flex w-1/2 h-full bg-slate-900 relative overflow-hidden items-center justify-center text-white">
        
        {/* Fundo Gradiente Azul Profundo (Estilo Veloma Corporativo) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-90"></div>
        
        {/* Elementos decorativos sutis (Sem animação pesada para não distrair) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>

        {/* Conteúdo de Texto */}
        <div className="relative z-10 max-w-lg px-12 text-center lg:text-left">
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Calculator className="text-white w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Veloma</h1>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Contabilidade inteligente para o seu negócio.
          </h2>
          
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Uma plataforma integrada para gerir clientes, faturas e obrigações fiscais em Portugal com eficiência e segurança.
          </p>

          {/* Lista de Features */}
          <div className="space-y-4">
            <FeatureItem icon={<Users size={20} />} text="Gestão de Clientes Centralizada" />
            <FeatureItem icon={<FileText size={20} />} text="Faturação e SAF-T Automatizado" />
            <FeatureItem icon={<BarChart3 size={20} />} text="Relatórios Financeiros em Tempo Real" />
          </div>
        </div>
      </div>

      {/* =======================
          LADO DIREITO (FORMULÁRIO)
          ======================= */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center relative overflow-y-auto">
        
        {/* Container Centralizado */}
        <div className="w-full max-w-md mx-auto px-6 sm:px-8 py-12">
          
          {/* Logo Apenas para Mobile (Esconde no Desktop) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <Calculator className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Veloma CRM</h1>
          </div>

          {/* O Outlet é onde o Login, Register, etc. entram */}
          <Outlet />
          
        </div>
        
        {/* Rodapé simples no fundo da direita */}
        <div className="mt-auto py-6 text-center text-xs text-slate-400">
            &copy; 2023 Veloma Contabilidade. Todos os direitos reservados.
        </div>
      </div>

    </div>
  );
}

// Sub-componente para os ícones do lado esquerdo
function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
      <div className="text-blue-400">
        {icon}
      </div>
      <span className="font-medium text-slate-200">{text}</span>
    </div>
  );
}