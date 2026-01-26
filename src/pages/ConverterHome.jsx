import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search } from 'lucide-react';
import { BANKS } from '../config/banks';

export default function ConverterHome() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBanks = BANKS.filter((bank) =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 animate-fade-in pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conversor de Extratos</h1>
          <p className="text-gray-500 mt-1">Selecione o banco para iniciar o processamento.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar banco..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Cards: Ocupando a largura disponível */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBanks.map((bank) => {
          const iconColorClass = bank.color.replace('bg-', 'text-');

          return (
            <Link
              key={bank.id}
              to={`/dashboard/converter-extrato/${bank.id}`}
              className="group bg-white rounded-lg border border-gray-200 p-5 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-blue-400 transition-all duration-200 h-32"
            >
              <div className={`p-3 rounded-full mb-3 ${bank.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                <Building2 size={28} className={iconColorClass} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm group-hover:text-blue-600 transition-colors">
                {bank.name}
              </h3>
            </Link>
          );
        })}
      </div>

      {filteredBanks.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg border border-gray-100">
          <p className="text-gray-500 text-sm">Nenhum banco encontrado.</p>
        </div>
      )}
    </div>
  );
}