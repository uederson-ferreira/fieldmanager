// ===================================================================
// COMPONENTE CAMPOS DO FORMULÁRIO DE TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/TermoFormFields.tsx
// Módulo: Campos do formulário de termos ambientais
// ===================================================================

import React, { useRef } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import type { TermoFormData, TermoLiberacao } from '../../types/termos';
import { TIPOS_TERMO, NATUREZA_DESVIO, GRAU_SEVERIDADE } from '../../types/termos';
import { TermoPhotoDisplay } from './TermoPhotoDisplay';
import AssinaturaDigital, { AssinaturaDigitalRef } from './AssinaturaDigital';

interface TermoFormFieldsProps {
  dadosFormulario: TermoFormData;
  setDadosFormulario: React.Dispatch<React.SetStateAction<TermoFormData>>;
  numeroTermo: string;
  categoriasLV?: string[];
  adicionarNC: () => void;
  removerNC: (index: number) => void;
  atualizarNC: (index: number, campo: string, valor: string) => void;
  adicionarAcao: () => void;
  removerAcao: (index: number) => void;
  atualizarAcao: (index: number, campo: string, valor: string) => void;
  atualizarLiberacao: (updater: (prev: TermoLiberacao) => TermoLiberacao) => void;
  limparCampos: () => void;
  adicionarFoto?: (categoria: string) => Promise<void>;
  removerFoto?: (categoria: string, index: number) => void;
  fotos?: { [categoria: string]: any[] };
  preencherFormularioTeste?: () => Promise<void>;
}

export const TermoFormFields: React.FC<TermoFormFieldsProps> = ({
  dadosFormulario,
  setDadosFormulario,
  numeroTermo,
  categoriasLV,
  adicionarNC,
  removerNC,
  atualizarNC,
  adicionarAcao,
  removerAcao,
  atualizarAcao,
  atualizarLiberacao,
  limparCampos,
  adicionarFoto,
  removerFoto,
  fotos,
  preencherFormularioTeste
}) => {
  // ✅ FUNÇÃO para formatar o número do termo para exibição
  const formatarNumeroTermo = (sequencial: string, tipo: string) => {
    if (!sequencial || !tipo) return 'Gerando...';
    
    // Verificar se é um ID único offline (contém "offline_")
    if (sequencial.includes('offline_')) {
      return sequencial; // Retornar o ID único completo
    }
    
    // Verificar se é um número offline antigo (contém "-OFF-")
    if (sequencial.includes('-OFF-')) {
      return sequencial; // Retornar o número offline completo
    }
    
    const ano = new Date().getFullYear();
    const prefixo = tipo === 'PARALIZACAO_TECNICA' ? 'PT' : tipo === 'NOTIFICACAO' ? 'NT' : 'RC';
    const numero = parseInt(sequencial);
    
    if (isNaN(numero)) return sequencial; // ✅ Se não for número, retornar como está
    
    return `${ano}-${prefixo}-${String(numero).padStart(3, '0')}`;
  };
  // Refs para as assinaturas digitais
  const assinaturaResponsavelRef = useRef<AssinaturaDigitalRef>(null);
  const assinaturaEmitenteRef = useRef<AssinaturaDigitalRef>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Formulário de Termo
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Paralização Técnica, Notificação ou Recomendação
              </p>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button
              onClick={limparCampos}
              className="px-2 sm:px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
              title="Limpar campos"
            >
              🗑️ <span className="hidden sm:inline">Limpar Campos</span>
              <span className="sm:hidden">Limpar</span>
            </button>
            
            {/* Botão provisório para preencher formulário de teste */}
            <button
              onClick={preencherFormularioTeste}
              className="px-2 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
              title="Preencher formulário com dados de teste"
            >
              🧪 <span className="hidden sm:inline">Preencher Teste</span>
              <span className="sm:hidden">Teste</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seção 1: Identificação Básica */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
          1. Identificação do Termo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="numero_termo" className="block text-sm font-medium text-gray-700 mb-2">
              Número do Termo
            </label>
            <input
              id="numero_termo"
              name="numero_termo"
              type="text"
              value={formatarNumeroTermo(numeroTermo, dadosFormulario.tipo_termo)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono"
              placeholder="Gerando..."
            />
          </div>
          
          <div>
            <label htmlFor="projeto_ba" className="block text-sm font-medium text-gray-700 mb-2">
              Projeto B&A
            </label>
            <input
              id="projeto_ba"
              name="projeto_ba"
              type="text"
              value={dadosFormulario.projeto_ba}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, projeto_ba: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Projeto XYZ"
            />
          </div>
        </div>

        {/* Campo LV de Origem (quando vem de uma LV) */}
        {(dadosFormulario as any).lv_origem && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LV de Origem
            </label>
            <input
              type="text"
              value={(dadosFormulario as any).lv_origem}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-700 font-medium"
              placeholder="LV de origem"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="data_termo" className="block text-sm font-medium text-gray-700 mb-2">
              Data *
            </label>
            <input
              id="data_termo"
              name="data_termo"
              type="date"
              value={dadosFormulario.data_termo}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, data_termo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="hora_termo" className="block text-sm font-medium text-gray-700 mb-2">
              Hora *
            </label>
            <input
              id="hora_termo"
              name="hora_termo"
              type="time"
              value={dadosFormulario.hora_termo}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, hora_termo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="local_atividade" className="block text-sm font-medium text-gray-700 mb-2">
              Local da Atividade *
            </label>
            <input
              id="local_atividade"
              name="local_atividade"
              type="text"
              value={dadosFormulario.local_atividade}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, local_atividade: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o local da atividade"
            />
          </div>
          
          <div>
            <label htmlFor="fase_etapa_obra" className="block text-sm font-medium text-gray-700 mb-2">
              Fase/Etapa da Obra
            </label>
            <input
              id="fase_etapa_obra"
              name="fase_etapa_obra"
              type="text"
              value={dadosFormulario.fase_etapa_obra}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, fase_etapa_obra: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Terraplanagem, Fundação, Estrutura"
            />
          </div>
        </div>

        {/* Tipo de Termo - movido para o início */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Termo *
          </label>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             {Object.entries(TIPOS_TERMO).map(([key, tipo]) => (
               <label key={key} className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="tipo_termo"
                   value={key}
                   checked={dadosFormulario.tipo_termo === key}
                   onChange={(e) => setDadosFormulario(prev => ({ ...prev, tipo_termo: e.target.value as any }))}
                   className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                 />
                 <span className="text-sm text-gray-700">{tipo.nome}</span>
               </label>
             ))}
           </div>
        </div>
      </div>

      {/* Seção 2: Emissor e Destinatário */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
          2. Emissor e Destinatário
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emissor */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Emissor (De)</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="emitido_por_nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  id="emitido_por_nome"
                  name="emitido_por_nome"
                  type="text"
                  value={dadosFormulario.emitido_por_nome}
                  onChange={(e) => setDadosFormulario(prev => ({ ...prev, emitido_por_nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do emissor"
                />
              </div>
              
              <div>
                <label htmlFor="emitido_por_gerencia" className="block text-sm font-medium text-gray-700 mb-2">
                  Gerência
                </label>
                <input
                  id="emitido_por_gerencia"
                  name="emitido_por_gerencia"
                  type="text"
                  value={dadosFormulario.emitido_por_gerencia}
                  onChange={(e) => setDadosFormulario(prev => ({ ...prev, emitido_por_gerencia: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Gerência do emissor"
                />
              </div>
              
              <div>
                <label htmlFor="emitido_por_empresa" className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <input
                  id="emitido_por_empresa"
                  name="emitido_por_empresa"
                  type="text"
                  value={dadosFormulario.emitido_por_empresa}
                  onChange={(e) => setDadosFormulario(prev => ({ ...prev, emitido_por_empresa: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Empresa do emissor"
                />
              </div>
            </div>
          </div>

          {/* Destinatário */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Destinatário (Para)</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="destinatario_nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  id="destinatario_nome"
                  name="destinatario_nome"
                  type="text"
                  value={dadosFormulario.destinatario_nome}
                  onChange={(e) => setDadosFormulario(prev => ({ ...prev, destinatario_nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do destinatário"
                />
              </div>
              
              <div>
                <label htmlFor="destinatario_gerencia" className="block text-sm font-medium text-gray-700 mb-2">
                  Gerência
                </label>
                <input
                  id="destinatario_gerencia"
                  name="destinatario_gerencia"
                  type="text"
                  value={dadosFormulario.destinatario_gerencia}
                  onChange={(e) => setDadosFormulario(prev => ({ ...prev, destinatario_gerencia: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Gerência do destinatário"
                />
              </div>
              
              <div>
                <label htmlFor="destinatario_empresa" className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <input
                  id="destinatario_empresa"
                  name="destinatario_empresa"
                  type="text"
                  value={dadosFormulario.destinatario_empresa}
                  onChange={(e) => setDadosFormulario(prev => ({ ...prev, destinatario_empresa: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Empresa do destinatário"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 3: Localização e Atividade */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
          3. Localização e Atividade
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="area_equipamento_atividade" className="block text-sm font-medium text-gray-700 mb-2">
              Área/Equipamento/Atividade *
            </label>
            <input
              id="area_equipamento_atividade"
              name="area_equipamento_atividade"
              type="text"
              value={dadosFormulario.area_equipamento_atividade}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, area_equipamento_atividade: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva a área, equipamento ou atividade"
            />
          </div>
          
          <div>
            <label htmlFor="equipe" className="block text-sm font-medium text-gray-700 mb-2">
              Equipe
            </label>
            <input
              id="equipe"
              name="equipe"
              type="text"
              value={dadosFormulario.equipe}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, equipe: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Equipe responsável"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="atividade_especifica" className="block text-sm font-medium text-gray-700 mb-2">
            Atividade Específica *
          </label>
          <textarea
            id="atividade_especifica"
            name="atividade_especifica"
            value={dadosFormulario.atividade_especifica}
            onChange={(e) => setDadosFormulario(prev => ({ ...prev, atividade_especifica: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva a atividade específica que está sendo realizada"
          />
        </div>
      </div>

      {/* Seção 4: Natureza do Desvio */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
          4. Natureza do Desvio
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Natureza do Desvio *
          </label>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             {Object.entries(NATUREZA_DESVIO).map(([key, natureza]) => (
               <label key={key} className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="natureza_desvio"
                   value={key}
                   checked={dadosFormulario.natureza_desvio === key}
                   onChange={(e) => setDadosFormulario(prev => ({ ...prev, natureza_desvio: e.target.value as any }))}
                   className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                 />
                 <span className="text-sm text-gray-700">{natureza.nome}</span>
               </label>
             ))}
           </div>
        </div>
      </div>

      {/* Seção 5: Não Conformidades */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            5. Não Conformidades Identificadas
          </h3>
          <button
            type="button"
            onClick={adicionarNC}
            disabled={(dadosFormulario.nao_conformidades || []).length >= 10}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar NC</span>
          </button>
        </div>
        
        {(dadosFormulario.nao_conformidades || []).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma não conformidade adicionada</p>
            <p className="text-xs mt-1">Clique em "Adicionar NC" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(dadosFormulario.nao_conformidades || []).map((nc, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Não Conformidade {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removerNC(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição *
                    </label>
                    <textarea
                      value={nc.descricao}
                      onChange={(e) => atualizarNC(index, 'descricao', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva a não conformidade"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severidade *
                    </label>
                    <select
                      value={nc.severidade}
                      onChange={(e) => atualizarNC(index, 'severidade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(GRAU_SEVERIDADE).map(([key, grau]) => (
                        <option key={key} value={key}>
                          {grau.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Campo de Foto para NC */}
                {adicionarFoto && removerFoto && fotos && (
                  <TermoPhotoDisplay
                    fotos={fotos[`nc_${index}`] || []}
                    categoria={`nc_${index}`}
                    onRemoverFoto={removerFoto}
                    onAdicionarFoto={adicionarFoto}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção 6: Lista de Verificação */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
          6. Lista de Verificação Aplicada
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lista_verificacao_aplicada" className="block text-sm font-medium text-gray-700 mb-2">
              Lista de Verificação Aplicada
            </label>
            <select
              id="lista_verificacao_aplicada"
              name="lista_verificacao_aplicada"
              value={dadosFormulario.lista_verificacao_aplicada}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, lista_verificacao_aplicada: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma lista</option>
              {(categoriasLV || []).map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="tst_tma_responsavel" className="block text-sm font-medium text-gray-700 mb-2">
              TST/TMA Responsável
            </label>
            <input
              id="tst_tma_responsavel"
              name="tst_tma_responsavel"
              type="text"
              value={dadosFormulario.tst_tma_responsavel}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, tst_tma_responsavel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do TST/TMA responsável"
            />
          </div>
        </div>
      </div>

      {/* Seção 7: Ações para Correção */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            7. Ações para Correção
          </h3>
          <button
            type="button"
            onClick={adicionarAcao}
            disabled={(dadosFormulario.acoes_correcao || []).length >= 10}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Ação</span>
          </button>
        </div>
        
        {(dadosFormulario.acoes_correcao || []).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma ação de correção adicionada</p>
            <p className="text-xs mt-1">Clique em "Adicionar Ação" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(dadosFormulario.acoes_correcao || []).map((acao, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Ação de Correção {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removerAcao(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição da Ação *
                    </label>
                    <textarea
                      value={acao.descricao}
                      onChange={(e) => atualizarAcao(index, 'descricao', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva a ação de correção"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prazo
                    </label>
                    <input
                      type="date"
                      value={acao.prazo}
                      onChange={(e) => atualizarAcao(index, 'prazo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Campo de Foto para Ação */}
                {adicionarFoto && removerFoto && fotos && (
                  <TermoPhotoDisplay
                    fotos={fotos[`acao_${index}`] || []}
                    categoria={`acao_${index}`}
                    onRemoverFoto={removerFoto}
                    onAdicionarFoto={adicionarFoto}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção 8: Assinaturas */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
          8. Assinaturas
        </h3>
        
        <div className="space-y-8">
          {/* Responsável pela Área */}
          <div className="w-full">
            <h4 className="text-md font-medium text-gray-900 mb-4">Responsável pela Área</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                                 <input
                   type="checkbox"
                   id="assinatura_responsavel_area"
                   checked={dadosFormulario.assinatura_responsavel_area || false}
                   onClick={() => console.log('🔍 [TERMO FORM] Checkbox responsável clicado')}
                   onChange={(e) => {
                     const checked = e.target.checked;
                     const dataAtual = new Date().toISOString().split('T')[0];
                     console.log('🔍 [TERMO FORM] Checkbox responsável marcado:', checked, 'Data:', dataAtual);
                     setDadosFormulario(prev => {
                       const novoEstado = { 
                         ...prev, 
                         assinatura_responsavel_area: checked,
                         data_assinatura_responsavel: dataAtual // ✅ SEMPRE definir data do dia
                       };
                       console.log('🔍 [TERMO FORM] Novo estado após checkbox responsável:', {
                         assinatura_responsavel_area: novoEstado.assinatura_responsavel_area,
                         data_assinatura_responsavel: novoEstado.data_assinatura_responsavel
                       });
                       return novoEstado;
                     });
                   }}
                   className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                 />
                <label htmlFor="assinatura_responsavel_area" className="text-sm font-medium text-gray-700">
                  Assinatura do responsável pela área
                </label>
              </div>
              
              {/* Campo de data de assinatura */}
              {(dadosFormulario.assinatura_responsavel_area || false) && (
                <div className="mt-2">
                  <label htmlFor="data_assinatura_responsavel" className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Assinatura
                  </label>
                  <input
                    id="data_assinatura_responsavel"
                    name="data_assinatura_responsavel"
                    type="date"
                    value={dadosFormulario.data_assinatura_responsavel || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      console.log('🔍 [TERMO FORM] Data responsável alterada:', e.target.value);
                      setDadosFormulario(prev => ({ 
                        ...prev, 
                        data_assinatura_responsavel: e.target.value 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {(dadosFormulario.assinatura_responsavel_area || false) && (
                <div className="mt-4 w-full">
                  <AssinaturaDigital
                    ref={assinaturaResponsavelRef}
                    label="Assinatura Digital"
                    assinatura={dadosFormulario.assinatura_responsavel_area_img}
                    onAssinar={(assinatura) => {
                      setDadosFormulario(prev => ({ 
                        ...prev, 
                        assinatura_responsavel_area_img: assinatura || undefined
                      }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Emitente */}
          <div className="w-full">
            <h4 className="text-md font-medium text-gray-900 mb-4">Emitente</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                                 <input
                   type="checkbox"
                   id="assinatura_emitente"
                   checked={dadosFormulario.assinatura_emitente || false}
                   onClick={() => console.log('🔍 [TERMO FORM] Checkbox emitente clicado')}
                   onChange={(e) => {
                     const checked = e.target.checked;
                     const dataAtual = new Date().toISOString().split('T')[0];
                     console.log('🔍 [TERMO FORM] Checkbox emitente marcado:', checked, 'Data:', dataAtual);
                     setDadosFormulario(prev => {
                       const novoEstado = { 
                         ...prev, 
                         assinatura_emitente: checked,
                         data_assinatura_emitente: dataAtual // ✅ SEMPRE definir data do dia
                       };
                       console.log('🔍 [TERMO FORM] Novo estado após checkbox emitente:', {
                         assinatura_emitente: novoEstado.assinatura_emitente,
                         data_assinatura_emitente: novoEstado.data_assinatura_emitente
                       });
                       return novoEstado;
                     });
                   }}
                   className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                 />
                <label htmlFor="assinatura_emitente" className="text-sm font-medium text-gray-700">
                  Assinatura do emitente
                </label>
              </div>
              
              {/* Campo de data de assinatura */}
              {(dadosFormulario.assinatura_emitente || false) && (
                <div className="mt-2">
                  <label htmlFor="data_assinatura_emitente" className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Assinatura
                  </label>
                  <input
                    id="data_assinatura_emitente"
                    name="data_assinatura_emitente"
                    type="date"
                    value={dadosFormulario.data_assinatura_emitente || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      console.log('🔍 [TERMO FORM] Data emitente alterada:', e.target.value);
                      setDadosFormulario(prev => ({ 
                        ...prev, 
                        data_assinatura_emitente: e.target.value 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {(dadosFormulario.assinatura_emitente || false) && (
                <div className="mt-4 w-full">
                  <AssinaturaDigital
                    ref={assinaturaEmitenteRef}
                    label="Assinatura Digital"
                    assinatura={dadosFormulario.assinatura_emitente_img}
                    onAssinar={(assinatura) => {
                      setDadosFormulario(prev => ({ 
                        ...prev, 
                        assinatura_emitente_img: assinatura || undefined
                      }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seção 9: Textos Livres */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
          9. Textos Livres
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="providencias_tomadas" className="block text-sm font-medium text-gray-700 mb-2">
              Providências Tomadas
            </label>
            <textarea
              id="providencias_tomadas"
              name="providencias_tomadas"
              value={dadosFormulario.providencias_tomadas}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, providencias_tomadas: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva as providências tomadas"
            />
          </div>
          
          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={dadosFormulario.observacoes}
              onChange={(e) => setDadosFormulario(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observações adicionais"
            />
          </div>
        </div>
      </div>

      {/* Seção 10: Liberação (apenas para Paralização Técnica) */}
      {dadosFormulario.tipo_termo === 'PARALIZACAO_TECNICA' && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-900 border-b border-red-200 pb-2 mb-4">
            10. Liberação de Retorno à Atividade ou Equipamento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={dadosFormulario.liberacao?.nome || ''}
                onChange={(e) => atualizarLiberacao(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Empresa
              </label>
              <input
                type="text"
                value={dadosFormulario.liberacao?.empresa || ''}
                onChange={(e) => atualizarLiberacao(prev => ({ ...prev, empresa: e.target.value }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Gerência
              </label>
              <input
                type="text"
                value={dadosFormulario.liberacao?.gerencia || ''}
                onChange={(e) => atualizarLiberacao(prev => ({ ...prev, gerencia: e.target.value }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Data
              </label>
              <input
                type="date"
                value={dadosFormulario.liberacao?.data || ''}
                onChange={(e) => atualizarLiberacao(prev => ({ ...prev, data: e.target.value }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Horário de Liberação
              </label>
              <input
                type="time"
                value={dadosFormulario.liberacao?.horario || ''}
                onChange={(e) => atualizarLiberacao(prev => ({ ...prev, horario: e.target.value }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="liberacao_assinatura"
                checked={dadosFormulario.liberacao?.assinatura_carimbo || false}
                onChange={(e) => atualizarLiberacao(prev => ({ ...prev, assinatura_carimbo: e.target.checked }))}
                className="h-4 w-4 text-red-600 border-red-300 rounded focus:ring-red-500"
              />
              <label htmlFor="liberacao_assinatura" className="text-sm font-medium text-red-800">
                Assinatura e carimbo
              </label>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Importante:</strong> Após correção da Paralização Técnica, o campo "Liberação de área" 
              somente proceder baixa e liberação da atividade / ou equipamentos mediante assinatura do HSE Gerenciadora.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 