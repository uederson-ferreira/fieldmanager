// Página de Teste - Sistema Multi-Domínio
import React from 'react';
import { useDominio } from '../contexts/DominioContext';
import DominioSelector from '../components/common/DominioSelector';

export default function TesteDominios() {
  const { dominioAtual, modulosDisponiveis, carregando } = useDominio();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧪 Teste - Sistema Multi-Domínio
        </h1>

        {/* Seletor de Domínios */}
        <DominioSelector className="mb-6" />

        {/* Info do Domínio Atual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Domínio Selecionado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Domínio Selecionado</h2>
            {dominioAtual ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {dominioAtual.id}</p>
                <p><strong>Código:</strong> {dominioAtual.codigo}</p>
                <p><strong>Nome:</strong> {dominioAtual.nome}</p>
                <p><strong>Descrição:</strong> {dominioAtual.descricao || '-'}</p>
                <p><strong>Ícone:</strong> {dominioAtual.icone}</p>
                <p>
                  <strong>Cor:</strong>{' '}
                  <span
                    className="inline-block w-6 h-6 rounded border"
                    style={{ backgroundColor: dominioAtual.cor_primaria }}
                  />
                  {dominioAtual.cor_primaria}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum domínio selecionado</p>
            )}
          </div>

          {/* Módulos Disponíveis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">
              Módulos Disponíveis ({modulosDisponiveis.length})
            </h2>
            {carregando ? (
              <p className="text-gray-500">Carregando...</p>
            ) : modulosDisponiveis.length > 0 ? (
              <div className="space-y-2">
                {modulosDisponiveis.map(modulo => (
                  <div
                    key={modulo.id}
                    className="p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <p className="font-medium">{modulo.nome}</p>
                    <p className="text-sm text-gray-600">
                      Código: {modulo.codigo} | Tipo: {modulo.tipo_modulo}
                    </p>
                    {modulo.template && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Template
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum módulo disponível</p>
            )}
          </div>
        </div>

        {/* Status da Conexão */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Status da Integração</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Backend API</p>
              <p className="font-medium text-emerald-600">✅ Conectado</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Context Provider</p>
              <p className="font-medium text-emerald-600">✅ Ativo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
