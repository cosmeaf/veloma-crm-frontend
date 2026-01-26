export default function DashboardHome() {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bem-vindo ao Portal</h1>
        <p className="text-gray-500 mt-2">Gerencie os dados bancários e institucionais de Portugal.</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { title: 'Total de Bancos', val: '0', color: 'bg-blue-600' },
          { title: 'Integrações Ativas', val: '0', color: 'bg-green-600' },
          { title: 'Processamentos Hoje', val: '0', color: 'bg-purple-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.val}</h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
              <div className={`w-2 h-2 rounded-full ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Área de Ação Rápida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Comece a trabalhar</h2>
        <p className="opacity-90 mb-6">Adicione seus primeiros bancos ou utilize o conversor de extratos.</p>
        <div className="flex gap-4">
          <button className="bg-white text-blue-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
            Adicionar Banco
          </button>
          <button className="bg-blue-500 text-white border border-blue-400 px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            Converter Extrato
          </button>
        </div>
      </div>
    </div>
  );
}