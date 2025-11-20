// ===================================================================
// COMPONENTE PRINCIPAL DO DASHBOARD - ECOFIELD SYSTEM
// Localização: src/components/dashboard/DashboardMainContent.tsx
// ===================================================================

import React, { Suspense, lazy } from 'react';
import { useDashboard } from './DashboardProvider';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useDashboardMetas } from '../../hooks/useDashboardMetas';
import StatsCard, { StatsSection } from './StatsCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { SyncButton } from '../common/SyncButton';
import CardNcsPendentes from './CardNcsPendentes';
import AlertasNcsAntigas from './AlertasNcsAntigas';
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import type { UserData } from '../../types';
import type { MetaComProgresso } from '../../types/metas';
import { getTipoMetaLabel } from '../../types/metas';

// Lazy loading para componentes pesados
const MetasTMA = lazy(() => import('../MetasTMA'));
const ListasVerificacao = lazy(() => import('../ListasVerificacao'));
const Fotos = lazy(() => import('../Fotos'));
const Historico = lazy(() => import('../Historico'));
const AtividadesRotina = lazy(() => import('../tecnico/AtividadesRotina'));
const AcoesCorretivasPage = lazy(() => import('../../pages/AcoesCorretivas'));
const DetalhesAcaoCorretiva = lazy(() => import('../../pages/DetalhesAcaoCorretiva'));
// Temporariamente desabilitando lazy loading para debug
import ListaTermos from '../tecnico/ListaTermos';
import TermoFormV2 from '../tecnico/TermoFormV2';

interface DashboardMainContentProps {
  user: UserData;
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = ({ user }) => {
  const { activeSection, setActiveSection, acaoCorretivaId } = useDashboard();
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats(user);
  const { metasIndividuais, metasEquipe, loading: metasLoading } = useDashboardMetas();

  // Calcular percentual de alcance para uma meta
  const calcularPercentualAlcance = (meta: MetaComProgresso): number => {
    if (!meta.meta_quantidade || meta.meta_quantidade === 0) return 0;
    const quantidadeAtual = meta.progresso_individual?.quantidade_atual || 0;
    return (quantidadeAtual / meta.meta_quantidade) * 100;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Botão de Sincronização - Mobile */}
            <div className="sm:hidden">
              <SyncButton showDetails={true} className="w-full" />
            </div>

            {/* Alertas de NCs Antigas */}
            <AlertasNcsAntigas />

            {/* Linha 1: Estatísticas Principais */}
            <StatsSection
              title="Visão Geral"
              icon={TrendingUp}
              iconBgColor="bg-green-600"
              iconColor="text-white"
              textColor="text-green-800"
            >
              <StatsCard
                title="LVs Pendentes"
                value={dashboardStats.lvsPendentes}
                subtitle="Listas de verificação pendentes"
                icon={CheckCircle}
                iconBgColor="bg-green-600"
                iconColor="text-white"
                textColor="text-green-800"
                loading={statsLoading}
              />
              <StatsCard
                title="LVs Concluídas"
                value={dashboardStats.lvsCompletas}
                subtitle="Listas de verificação concluídas"
                icon={CheckCircle}
                iconBgColor="bg-blue-600"
                iconColor="text-white"
                textColor="text-blue-800"
                loading={statsLoading}
              />
              <StatsCard
                title="Não Conformes"
                value={dashboardStats.lvsNaoConformes}
                subtitle="LVs com não conformidades"
                icon={AlertTriangle}
                iconBgColor="bg-red-600"
                iconColor="text-white"
                textColor="text-red-800"
                loading={statsLoading}
              />
              <StatsCard
                title="Conformidade"
                value={`${dashboardStats.lvsPercentualConformidade}%`}
                subtitle="Percentual de conformidade"
                icon={TrendingUp}
                iconBgColor="bg-green-600"
                iconColor="text-white"
                textColor="text-green-800"
                loading={statsLoading}
              />
            </StatsSection>

            {/* Linha 2: Termos Ambientais */}
            <StatsSection
              title="Termos Ambientais"
              icon={FileText}
              iconBgColor="bg-blue-600"
              iconColor="text-white"
              textColor="text-blue-800"
            >
              <StatsCard
                title="Total de Termos"
                value={dashboardStats.total_termos}
                subtitle="Termos emitidos"
                icon={FileText}
                iconBgColor="bg-blue-600"
                iconColor="text-white"
                textColor="text-blue-800"
                loading={statsLoading}
              />
              <StatsCard
                title="Pendentes"
                value={dashboardStats.termosPendentes}
                subtitle="Termos pendentes"
                icon={AlertTriangle}
                iconBgColor="bg-yellow-600"
                iconColor="text-white"
                textColor="text-yellow-800"
                loading={statsLoading}
              />
              <StatsCard
                title="Corrigidos"
                value={dashboardStats.termosCorrigidos}
                subtitle="Termos corrigidos"
                icon={CheckCircle}
                iconBgColor="bg-green-600"
                iconColor="text-white"
                textColor="text-green-800"
                loading={statsLoading}
              />
              <StatsCard
                title="Paralizações"
                value={dashboardStats.paralizacoes}
                subtitle="Paralizações técnicas"
                icon={AlertTriangle}
                iconBgColor="bg-red-600"
                iconColor="text-white"
                textColor="text-red-800"
                loading={statsLoading}
              />
            </StatsSection>

            {/* Linha 3: Rotinas/Atividades */}
            <StatsSection
              title="Rotinas e Atividades"
              icon={Clock}
              iconBgColor="bg-orange-600"
              iconColor="text-white"
              textColor="text-orange-800"
            >
              <StatsCard
                title="Hoje"
                value={dashboardStats.rotinasHoje}
                subtitle="Rotinas de hoje"
                icon={Clock}
                iconBgColor="bg-orange-600"
                iconColor="text-white"
                textColor="text-orange-800"
                loading={statsLoading}
              />
              <StatsCard
                title="Este Mês"
                value={dashboardStats.rotinasMes}
                subtitle="Rotinas do mês"
                icon={Clock}
                iconBgColor="bg-orange-600"
                iconColor="text-white"
                textColor="text-orange-800"
                loading={statsLoading}
              />
              <StatsCard
                title="Itens Emitidos"
                value={dashboardStats.itensEmitidos}
                subtitle="Itens emitidos"
                icon={Clock}
                iconBgColor="bg-orange-600"
                iconColor="text-white"
                textColor="text-orange-800"
                loading={statsLoading}
              />
              <StatsCard
                title="Tempo Médio"
                value={`${dashboardStats.tempoMedio}min`}
                subtitle="Tempo médio por item"
                icon={Clock}
                iconBgColor="bg-orange-600"
                iconColor="text-white"
                textColor="text-orange-800"
                loading={statsLoading}
              />
            </StatsSection>

            {/* Linha 4: Metas Individuais e Equipe */}
            <div className="flex flex-col gap-6">
              {/* Metas Individuais */}
              <StatsSection
                title="Metas Individuais"
                icon={Target}
                iconBgColor="bg-green-600"
                iconColor="text-white"
                textColor="text-green-800"
                className="bg-green-50 border border-green-100"
                layoutClassName="flex flex-col gap-4"
              >
                {metasLoading ? (
                  <div className="w-full h-24 flex items-center justify-center rounded-2xl border border-green-100 bg-white">
                    <LoadingSpinner message="Carregando metas..." />
                  </div>
                ) : metasIndividuais.length === 0 ? (
                  <div className="w-full bg-white border border-green-200 rounded-2xl p-6 text-center text-green-700">
                    <Target className="mx-auto h-8 w-8 text-green-600 mb-2" />
                    <p className="font-semibold">Sem metas individuais ainda</p>
                    <p className="text-sm text-green-600 mt-1">
                      Assim que o gestor atribuir metas para você, elas aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  metasIndividuais.slice(0, 6).map((meta) => {
                    const percentual = Number(calcularPercentualAlcance(meta).toFixed(1));
                    const status = meta.progresso_individual?.status ?? meta.progresso_metas?.[0]?.status;
                    const quantidadeAtual = meta.progresso_individual?.quantidade_atual ?? meta.progresso_metas?.[0]?.quantidade_atual ?? 0;
                    return (
                      <div
                        key={meta.id}
                        className="w-full rounded-2xl border border-green-100 bg-white/90 p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-green-900">
                              {meta.descricao || getTipoMetaLabel(meta.tipo_meta)}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              {quantidadeAtual}/{meta.meta_quantidade} concluídos
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-green-900">
                              {percentual.toFixed(1)}%
                            </span>
                            {status && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 capitalize">
                                {status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-green-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 transition-all duration-500"
                            style={{ width: `${Math.min(Math.max(percentual, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </StatsSection>

              {/* Metas de Equipe */}
              <StatsSection
                title="Metas de Equipe"
                icon={Target}
                iconBgColor="bg-emerald-600"
                iconColor="text-white"
                textColor="text-emerald-800"
                className="bg-emerald-50 border border-emerald-100"
                layoutClassName="flex flex-col gap-4"
              >
                {metasLoading ? (
                  <div className="w-full h-24 flex items-center justify-center rounded-2xl border border-emerald-100 bg-white">
                    <LoadingSpinner message="Carregando metas..." />
                  </div>
                ) : metasEquipe.length === 0 ? (
                  <div className="w-full bg-white border border-emerald-200 rounded-2xl p-6 text-center text-emerald-700">
                    <Target className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                    <p className="font-semibold">Nenhuma meta de equipe disponível</p>
                    <p className="text-sm text-emerald-600 mt-1">
                      Quando a equipe tiver metas ativas, você verá o progresso geral aqui.
                    </p>
                  </div>
                ) : (
                  metasEquipe.slice(0, 6).map((meta) => {
                    const percentual = Number(calcularPercentualAlcance(meta).toFixed(1));
                    const status = meta.progresso_individual?.status ?? meta.progresso_metas?.[0]?.status;
                    const quantidadeAtual = meta.progresso_individual?.quantidade_atual ?? meta.progresso_metas?.[0]?.quantidade_atual ?? 0;
                    return (
                      <div
                        key={meta.id}
                        className="w-full rounded-2xl border border-emerald-100 bg-white/90 p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-emerald-900">
                              {meta.descricao || getTipoMetaLabel(meta.tipo_meta)}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                              {quantidadeAtual}/{meta.meta_quantidade} concluídos
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-emerald-900">
                              {percentual.toFixed(1)}%
                            </span>
                            {status && (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 capitalize">
                                {status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 transition-all duration-500"
                            style={{ width: `${Math.min(Math.max(percentual, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </StatsSection>
            </div>

            {/* Card de NCs Pendentes */}
            <CardNcsPendentes />
          </div>
        );

      case 'metas':
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Metas TMA..." />}>
            <MetasTMA user={user} onBack={() => setActiveSection('dashboard')} />
          </Suspense>
        );

      case 'acoes-corretivas':
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Ações Corretivas..." />}>
            <AcoesCorretivasPage user={user} onBack={() => setActiveSection('dashboard')} />
          </Suspense>
        );

      case 'acoes-corretivas-detalhes':
        if (!acaoCorretivaId) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma ação selecionada</p>
              <button
                onClick={() => setActiveSection('acoes-corretivas')}
                className="mt-4 text-emerald-600 hover:underline"
              >
                Voltar para lista de ações
              </button>
            </div>
          );
        }
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Detalhes da Ação..." />}>
            <DetalhesAcaoCorretiva
              id={acaoCorretivaId}
              user={user}
              onBack={() => setActiveSection('acoes-corretivas')}
            />
          </Suspense>
        );

      case 'lvs':
      case 'lv-residuos':
      case 'lv-inspecao':
      case 'lv-02':
      case 'lv-03':
      case 'lv-04':
      case 'lv-05':
      case 'lv-06':
      case 'lv-07':
      case 'lv-08':
      case 'lv-09':
      case 'lv-10':
      case 'lv-11':
      case 'lv-12':
      case 'lv-13':
      case 'lv-14':
      case 'lv-15':
      case 'lv-16':
      case 'lv-17':
      case 'lv-18':
      case 'lv-19':
      case 'lv-20':
      case 'lv-21':
      case 'lv-22':
      case 'lv-23':
      case 'lv-24':
      case 'lv-25':
      case 'lv-26':
      case 'lv-27':
      case 'lv-28':
      case 'lv-29':
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Listas de Verificação..." />}>
            <ListasVerificacao user={user} onBack={() => setActiveSection('dashboard')} />
          </Suspense>
        );

      case 'fotos':
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Galeria de Fotos..." />}>
            <Fotos user={user} onBack={() => setActiveSection('dashboard')} />
          </Suspense>
        );

      case 'historico':
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Histórico..." />}>
            <Historico user={user} onBack={() => setActiveSection('dashboard')} />
          </Suspense>
        );

      case 'rotina':
      case 'atividades-rotina-form':
      case 'atividades-rotina-lista':
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Atividades de Rotina..." />}>
            <AtividadesRotina user={user} onBack={() => setActiveSection('dashboard')} />
          </Suspense>
        );

      case 'lista-termos':
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Lista de Termos..." />}>
            <ListaTermos user={user} onBack={() => setActiveSection('dashboard')} />
          </Suspense>
        );

      case 'termo-form-v2':
        return (
          <Suspense fallback={<LoadingSpinner message="Carregando Formulário de Termo..." />}>
            <TermoFormV2 onSalvar={() => {}} onCancelar={() => {}} />
          </Suspense>
        );

      default:
        return (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Seção não encontrada</h2>
            <p className="text-gray-500">A seção "{activeSection}" não está disponível.</p>
          </div>
        );
    }
  };

  return (
    <main className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
      {renderContent()}
    </main>
  );
};

export default DashboardMainContent; 