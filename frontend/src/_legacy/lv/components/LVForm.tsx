// ===================================================================
// COMPONENTE DE FORMULÁRIO UNIFICADO PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/components/LVForm.tsx
// ===================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Minus, Camera, AlertCircle, Save, Edit2, Trash2, Sparkles } from 'lucide-react';
import type { LVFormData, LVConfig, LVItem } from '../types/lv';
import SignaturePad from './SignaturePad';
import { areasAPI } from '../../../lib/areasAPI';
import { openDB } from 'idb';
import { generateTestData, getTestDataStats } from '../../../utils/testDataGenerator';

interface LVFormProps {
  dadosFormulario: LVFormData;
  setDadosFormulario: (dados: LVFormData | ((prev: LVFormData) => LVFormData)) => void;
  configuracao: LVConfig;
  modoEdicao: boolean;
  carregando: boolean;
  onSalvar: () => Promise<void>;
  onCancelar: () => void;
}

const LVForm: React.FC<LVFormProps> = ({
  dadosFormulario,
  setDadosFormulario,
  configuracao,
  modoEdicao,
  carregando,
  onSalvar,
  onCancelar,
}) => {
  // Estados locais
  const [areas, setAreas] = useState<Array<{ id: string; nome: string }>>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [showSignaturePrincipal, setShowSignaturePrincipal] = useState(false);
  const [showSignatureSecundario, setShowSignatureSecundario] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itemFotoAtual, setItemFotoAtual] = useState<string | null>(null);
  const [loadingTestData, setLoadingTestData] = useState(false);

  // Detectar status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar áreas (online ou offline)
  useEffect(() => {
    const carregarAreas = async () => {
      try {
        setLoadingAreas(true);

        if (isOnline) {
          // Buscar via API
          const data = await areasAPI.getAreas();

          if (data && data.length > 0) {
            setAreas(data);

            // Tentar salvar no IndexedDB (não bloquear se falhar)
            try {
              const db = await openDB('ecofield-cache', 1, {
                upgrade(db) {
                  if (!db.objectStoreNames.contains('areas')) {
                    db.createObjectStore('areas', { keyPath: 'id' });
                  }
                },
              });
              const tx = db.transaction('areas', 'readwrite');
              for (const area of data) {
                await tx.store.put(area);
              }
              await tx.done;
              console.log(`✅ ${data.length} áreas salvas no cache offline`);
            } catch (idbError) {
              console.warn('⚠️ Não foi possível salvar áreas no cache offline:', idbError);
            }
          } else {
            console.warn('⚠️ Nenhuma área retornada da API');
            setAreas([]);
          }
        } else {
          // Buscar do IndexedDB
          try {
            const db = await openDB('ecofield-cache', 1);
            const areasOffline = await db.getAll('areas');
            setAreas(areasOffline || []);
            console.log(`📦 ${areasOffline?.length || 0} áreas carregadas do cache offline`);
          } catch (idbError) {
            console.error('❌ Erro ao buscar áreas do cache offline:', idbError);
            setAreas([]);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar áreas:', error);
        setAreas([]);
      } finally {
        setLoadingAreas(false);
      }
    };

    carregarAreas();
  }, [isOnline]);

  // Capturar GPS automaticamente ao montar o componente
  useEffect(() => {
    if (!dadosFormulario.latitude && !dadosFormulario.longitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setDadosFormulario(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              gpsAccuracy: position.coords.accuracy,
            }));
            console.log(`📍 GPS capturado automaticamente (Precisão: ${position.coords.accuracy.toFixed(2)}m)`);
          },
          (error) => {
            console.warn('⚠️ Não foi possível capturar GPS automaticamente:', error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez ao montar

  // Atualizar avaliação
  const atualizarAvaliacao = (itemId: string, valor: "C" | "NC" | "NA" | "") => {
    setDadosFormulario(prev => ({
      ...prev,
      avaliacoes: {
        ...prev.avaliacoes,
        [itemId]: valor,
      },
    }));
  };

  // Capturar foto para um item específico
  const capturarFoto = (itemId: string) => {
    setItemFotoAtual(itemId);
    fileInputRef.current?.click();
  };

  // Processar foto selecionada
  const processarFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || itemFotoAtual === null) return;

    // Criar URL temporária para preview
    const urlPreview = URL.createObjectURL(file);

    // Adicionar foto ao formulário
    setDadosFormulario(prev => ({
      ...prev,
      fotos: {
        ...prev.fotos,
        [itemFotoAtual]: [
          ...(prev.fotos[itemFotoAtual] || []),
          {
            item_id: itemFotoAtual,
            arquivo: file,
            urlOriginal: urlPreview,
            nome_arquivo: file.name,
          }
        ]
      }
    }));

    // Limpar input
    event.target.value = '';
    setItemFotoAtual(null);
  };

  // Remover foto
  const removerFoto = (itemId: number, fotoIndex: number) => {
    setDadosFormulario(prev => {
      const fotosItem = [...(prev.fotos[itemId] || [])];

      // Revogar URL temporária para liberar memória
      const foto = fotosItem[fotoIndex];
      if (foto.urlOriginal) {
        URL.revokeObjectURL(foto.urlOriginal);
      }

      fotosItem.splice(fotoIndex, 1);

      return {
        ...prev,
        fotos: {
          ...prev.fotos,
          [itemId]: fotosItem
        }
      };
    });
  };

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const totalItens = configuracao.itens.length;

    // Contar apenas itens que foram efetivamente avaliados (C, NC ou NA)
    const avaliacoesValidas = configuracao.itens.filter(item => {
      const avaliacao = dadosFormulario.avaliacoes[item.id];
      return avaliacao === "C" || avaliacao === "NC" || avaliacao === "NA";
    });

    const itensAvaliados = avaliacoesValidas.length;
    const conformes = avaliacoesValidas.filter(item => dadosFormulario.avaliacoes[item.id] === "C").length;
    const naoConformes = avaliacoesValidas.filter(item => dadosFormulario.avaliacoes[item.id] === "NC").length;
    const naoAplicaveis = avaliacoesValidas.filter(item => dadosFormulario.avaliacoes[item.id] === "NA").length;
    const fotos = Object.values(dadosFormulario.fotos).reduce((acc, fotos) => acc + fotos.length, 0);
    const percentualConformidade = itensAvaliados > 0 ? Math.round((conformes / itensAvaliados) * 100) : 0;

    return {
      totalItens,           // Total de itens da LV
      itensAvaliados,       // Quantos já foram avaliados (apenas C, NC ou NA)
      conformes,
      naoConformes,
      naoAplicaveis,
      fotos,
      percentualConformidade,
    };
  };

  // Validar formulário
  const validarFormulario = () => {
    const erros: string[] = [];

    if (!dadosFormulario.data_inspecao) {
      erros.push("Data da inspeção é obrigatória");
    }

    if (!dadosFormulario.area && !dadosFormulario.areaCustomizada) {
      erros.push("Área de verificação é obrigatória");
    }

    if (!dadosFormulario.inspetor_principal) {
      erros.push("Inspetor principal é obrigatório");
    }

    if (!dadosFormulario.responsavel_tecnico) {
      erros.push("Responsável técnico é obrigatório");
    }

    const stats = calcularEstatisticas();
    if (stats.itensAvaliados < stats.totalItens) {
      erros.push(`${stats.totalItens - stats.itensAvaliados} itens ainda não avaliados`);
    }

    return erros;
  };

  // Função para preencher com dados de teste
  const preencherDadosTeste = async () => {
    if (loadingTestData) return;

    const confirmed = window.confirm(
      '🧪 Preencher formulário com dados de teste?\n\n' +
      'Isso irá sobrescrever todos os dados atuais do formulário, incluindo:\n' +
      '- Informações básicas\n' +
      '- Todas as avaliações dos itens\n' +
      '- Fotos mockadas\n' +
      '- Assinaturas digitais\n' +
      '- Coordenadas GPS\n\n' +
      'Esta ação não pode ser desfeita!'
    );

    if (!confirmed) return;

    try {
      setLoadingTestData(true);
      console.log('🧪 Iniciando preenchimento com dados de teste...');

      const testData = await generateTestData(
        configuracao,
        dadosFormulario.inspetor_principal,
        dadosFormulario.inspetor_principal_matricula
      );

      const stats = getTestDataStats(testData);
      console.log('📊 Estatísticas dos dados de teste:', stats);

      // Mesclar dados de teste com dados atuais (preservar IDs se existirem)
      setDadosFormulario(prev => ({
        ...prev,
        ...testData,
      } as LVFormData));

      alert(
        '✅ Formulário preenchido com sucesso!\n\n' +
        `📋 Itens avaliados: ${stats.totalItens}\n` +
        `✅ Conformes: ${stats.conformes}\n` +
        `❌ Não conformes: ${stats.naoConformes}\n` +
        `➖ Não aplicáveis: ${stats.naoAplicaveis}\n` +
        `📸 Total de fotos: ${stats.totalFotos}\n\n` +
        'Role para baixo para revisar os dados gerados!'
      );

      console.log('✅ Dados de teste aplicados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao gerar dados de teste:', error);
      alert('Erro ao gerar dados de teste. Verifique o console para detalhes.');
    } finally {
      setLoadingTestData(false);
    }
  };

  const erros = validarFormulario();
  const stats = calcularEstatisticas();

  return (
    <div className="space-y-6">
      {/* Header do Formulário */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {modoEdicao ? `Editar ${configuracao.nomeCompleto}` : configuracao.nomeCompleto}
            </h2>
          </div>

          {/* Botão de Dados de Teste - Apenas em desenvolvimento */}
          {(import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development') && (
            <button
              onClick={preencherDadosTeste}
              disabled={loadingTestData || carregando}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              title="Preencher formulário com dados de teste para facilitar desenvolvimento"
            >
              <Sparkles className={`h-4 w-4 ${loadingTestData ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">
                {loadingTestData ? 'Gerando...' : 'Dados de Teste'}
              </span>
            </button>
          )}
        </div>
        <p className="text-gray-600 break-words w-full max-w-full">{configuracao.revisao}</p>
        
        {/* Progresso */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Progresso da Verificação</span>
            <span className="text-gray-600">
              {stats.itensAvaliados} / {stats.totalItens} itens avaliados
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(stats.itensAvaliados / stats.totalItens) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {Math.round((stats.itensAvaliados / stats.totalItens) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Campos Básicos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data da Inspeção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Inspeção *
            </label>
            <input
              type="date"
              value={dadosFormulario.data_inspecao}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  data_inspecao: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área de Verificação *
            </label>
            {dadosFormulario.usarAreaCustomizada ? (
              <input
                type="text"
                value={dadosFormulario.areaCustomizada}
                onChange={(e) =>
                  setDadosFormulario(prev => ({
                    ...prev,
                    areaCustomizada: e.target.value,
                  }))
                }
                placeholder="Digite a área customizada..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <select
                value={dadosFormulario.area}
                onChange={(e) =>
                  setDadosFormulario(prev => ({
                    ...prev,
                    area: e.target.value,
                  }))
                }
                disabled={loadingAreas}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              >
                <option value="">Selecione uma área...</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.nome}>
                    {area.nome}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() =>
                setDadosFormulario(prev => ({
                  ...prev,
                  usarAreaCustomizada: !prev.usarAreaCustomizada,
                  area: !prev.usarAreaCustomizada ? "" : prev.area, // Limpa ao trocar
                  areaCustomizada: prev.usarAreaCustomizada ? "" : prev.areaCustomizada,
                }))
              }
              type="button"
              className="mt-2 text-sm text-green-600 hover:text-green-700"
            >
              {dadosFormulario.usarAreaCustomizada ? "Usar área do cadastro" : "Digitar área customizada"}
            </button>
            {!isOnline && (
              <p className="mt-1 text-xs text-amber-600">
                📴 Offline - usando áreas em cache
              </p>
            )}
          </div>

          {/* Inspetor Principal (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspetor Principal * (Usuário Logado)
            </label>
            <input
              type="text"
              value={dadosFormulario.inspetor_principal}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Preenchido automaticamente com o usuário logado
            </p>
          </div>

          {/* Matrícula do Inspetor Principal (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matrícula do Inspetor Principal
            </label>
            <input
              type="text"
              value={dadosFormulario.inspetor_principal_matricula}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Preenchida automaticamente
            </p>
          </div>

          {/* Responsável Técnico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsável Técnico *
            </label>
            <input
              type="text"
              value={dadosFormulario.responsavel_tecnico}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  responsavel_tecnico: e.target.value,
                }))
              }
              placeholder="Nome do responsável técnico..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Responsável da Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsável da Área
            </label>
            <input
              type="text"
              value={dadosFormulario.responsavelArea}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  responsavelArea: e.target.value,
                }))
              }
              placeholder="Nome do responsável..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Responsável da Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsável da Empresa
            </label>
            <input
              type="text"
              value={dadosFormulario.responsavelEmpresa}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  responsavelEmpresa: e.target.value,
                }))
              }
              placeholder="Nome do responsável da empresa..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Inspetor Secundário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspetor Secundário
            </label>
            <input
              type="text"
              value={dadosFormulario.inspetor2Nome}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  inspetor2Nome: e.target.value,
                }))
              }
              placeholder="Nome do inspetor secundário..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Matrícula do Inspetor Secundário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matrícula do Inspetor Secundário
            </label>
            <input
              type="text"
              value={dadosFormulario.inspetor2Matricula}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  inspetor2Matricula: e.target.value,
                }))
              }
              placeholder="Matrícula..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Localização GPS */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização GPS</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={dadosFormulario.latitude || ''}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  latitude: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
              placeholder="-23.5505199"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={dadosFormulario.longitude || ''}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  longitude: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
              placeholder="-46.6333094"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precisão (metros)
            </label>
            <input
              type="number"
              step="any"
              value={dadosFormulario.gpsAccuracy || ''}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  gpsAccuracy: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
              placeholder="10.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço GPS
            </label>
            <input
              type="text"
              value={dadosFormulario.enderecoGPS}
              onChange={(e) =>
                setDadosFormulario(prev => ({
                  ...prev,
                  enderecoGPS: e.target.value,
                }))
              }
              placeholder="Endereço obtido via geocoding..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setDadosFormulario(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    gpsAccuracy: position.coords.accuracy,
                  }));
                  alert(`Localização capturada com sucesso!\nPrecisão: ${position.coords.accuracy.toFixed(2)}m`);
                },
                (error) => {
                  console.error('Erro ao capturar GPS:', error);
                  alert('Não foi possível capturar a localização. Verifique as permissões do navegador.');
                }
              );
            } else {
              alert('Geolocalização não é suportada neste navegador.');
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          type="button"
        >
          <span>📍</span>
          <span>Capturar Localização Atual</span>
        </button>
      </div>

      {/* Itens da Verificação */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Itens de Verificação
        </h3>
        
        <div className="space-y-6">
          {configuracao.itens.map((item: LVItem) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                <span className="font-semibold text-green-700 mr-2">{item.codigo}</span>
                {item.pergunta || item.descricao}
              </h4>
              
              {/* Avaliação */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => atualizarAvaliacao(item.id, "C")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    dadosFormulario.avaliacoes[item.id] === "C"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-green-100"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>Conforme</span>
                </button>
                <button
                  onClick={() => atualizarAvaliacao(item.id, "NC")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    dadosFormulario.avaliacoes[item.id] === "NC"
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-red-100"
                  }`}
                >
                  <X className="h-4 w-4" />
                  <span>Não Conforme</span>
                </button>
                <button
                  onClick={() => atualizarAvaliacao(item.id, "NA")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    dadosFormulario.avaliacoes[item.id] === "NA"
                      ? "bg-yellow-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-yellow-100"
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  <span>Não Aplicável</span>
                </button>
              </div>

              {/* Observação Individual */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observação específica para este item
                </label>
                <textarea
                  value={dadosFormulario.observacoesIndividuais[item.id] || ""}
                  onChange={(e) =>
                    setDadosFormulario((prev) => ({
                      ...prev,
                      observacoesIndividuais: {
                        ...prev.observacoesIndividuais,
                        [item.id]: e.target.value,
                      },
                    }))
                  }
                  placeholder="Digite observações específicas para este item..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Fotos */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => capturarFoto(item.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span>Adicionar Foto</span>
                </button>

                {dadosFormulario.fotos[item.id] &&
                  dadosFormulario.fotos[item.id].length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">
                        {dadosFormulario.fotos[item.id].length} foto(s) adicionada(s)
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {dadosFormulario.fotos[item.id].map(
                          (foto, index: number) => (
                            <div key={index} className="relative group">
                              <img
                                src={foto.urlOriginal || foto.url_arquivo || ''}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyOEMyOC40MTggMjggMzIgMjQuNDE4IDMyIDIwQzMyIDE1LjU4MiAyOC40MTggMTIgMjQgMTJDMjAuNTgyIDEyIDE3IDE1LjU4MiAxNyAyMEMxNyAyNC40MTggMjAuNTgyIDI4IDI0IDI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removerFoto(item.id, index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observações Gerais */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações Gerais
        </label>
        <textarea
          value={dadosFormulario.observacoes}
          onChange={(e) =>
            setDadosFormulario((prev) => ({
              ...prev,
              observacoes: e.target.value,
            }))
          }
          placeholder="Digite observações gerais sobre a verificação..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Assinaturas Digitais */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assinaturas Digitais</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assinatura Inspetor Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assinatura do Inspetor Principal
            </label>
            {dadosFormulario.assinatura_inspetor_principal ? (
              <div className="border-2 border-green-200 rounded-lg p-3 bg-green-50">
                <img
                  src={dadosFormulario.assinatura_inspetor_principal}
                  alt="Assinatura do Inspetor Principal"
                  className="w-full h-32 object-contain bg-white rounded border"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-green-700">
                    ✅ Assinado em {dadosFormulario.data_assinatura_inspetor_principal
                      ? new Date(dadosFormulario.data_assinatura_inspetor_principal).toLocaleString('pt-BR')
                      : 'Agora'}
                  </p>
                  <button
                    onClick={() => {
                      setDadosFormulario(prev => ({
                        ...prev,
                        assinatura_inspetor_principal: null,
                        data_assinatura_inspetor_principal: null,
                      }));
                    }}
                    type="button"
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSignaturePrincipal(true)}
                type="button"
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-green-700"
              >
                <Edit2 className="h-5 w-5" />
                <span>Clique para assinar</span>
              </button>
            )}
          </div>

          {/* Assinatura Inspetor Secundário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assinatura do Inspetor Secundário (Opcional)
            </label>
            {dadosFormulario.assinatura_inspetor_secundario ? (
              <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                <img
                  src={dadosFormulario.assinatura_inspetor_secundario}
                  alt="Assinatura do Inspetor Secundário"
                  className="w-full h-32 object-contain bg-white rounded border"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-blue-700">
                    ✅ Assinado em {dadosFormulario.data_assinatura_inspetor_secundario
                      ? new Date(dadosFormulario.data_assinatura_inspetor_secundario).toLocaleString('pt-BR')
                      : 'Agora'}
                  </p>
                  <button
                    onClick={() => {
                      setDadosFormulario(prev => ({
                        ...prev,
                        assinatura_inspetor_secundario: null,
                        data_assinatura_inspetor_secundario: null,
                      }));
                    }}
                    type="button"
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSignatureSecundario(true)}
                type="button"
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-700"
              >
                <Edit2 className="h-5 w-5" />
                <span>Clique para assinar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumo e Ações */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumo da Verificação
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {stats.conformes}
            </div>
            <div className="text-xs text-green-700">Conformes</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">
              {stats.naoConformes}
            </div>
            <div className="text-xs text-red-700">Não Conformes</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">
              {stats.naoAplicaveis}
            </div>
            <div className="text-xs text-yellow-700">Não Aplicáveis</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">
              {stats.fotos}
            </div>
            <div className="text-xs text-blue-700">Fotos</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">
              {stats.percentualConformidade}%
            </div>
            <div className="text-xs text-purple-700">Conformidade</div>
          </div>
        </div>

        {/* Validação */}
        <div className="mb-6">
          {erros.map((erro, index) => (
            <div key={index} className="flex items-center space-x-2 text-amber-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{erro}</span>
            </div>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancelar}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {modoEdicao ? 'Cancelar Edição' : 'Cancelar'}
          </button>

          <button
            onClick={onSalvar}
            disabled={carregando || erros.length > 0}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{modoEdicao ? 'Atualizar Verificação' : 'Salvar Verificação'}</span>
          </button>
        </div>
      </div>

      {/* Modals de Assinatura */}
      {showSignaturePrincipal && (
        <SignaturePad
          title="Assinatura do Inspetor Principal"
          onSave={(signatureDataURL) => {
            setDadosFormulario(prev => ({
              ...prev,
              assinatura_inspetor_principal: signatureDataURL,
              data_assinatura_inspetor_principal: new Date().toISOString(),
            }));
            setShowSignaturePrincipal(false);
          }}
          onCancel={() => setShowSignaturePrincipal(false)}
        />
      )}

      {showSignatureSecundario && (
        <SignaturePad
          title="Assinatura do Inspetor Secundário"
          onSave={(signatureDataURL) => {
            setDadosFormulario(prev => ({
              ...prev,
              assinatura_inspetor_secundario: signatureDataURL,
              data_assinatura_inspetor_secundario: new Date().toISOString(),
            }));
            setShowSignatureSecundario(false);
          }}
          onCancel={() => setShowSignatureSecundario(false)}
        />
      )}

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={processarFoto}
        className="hidden"
      />
    </div>
  );
};

export default LVForm; 