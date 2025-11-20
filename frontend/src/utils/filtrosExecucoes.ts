// ===================================================================
// UTILITÁRIOS DE FILTROS E BUSCA - FIELDMANAGER v2.0
// Localização: src/utils/filtrosExecucoes.ts
// ===================================================================

import type { FiltrosState } from '../components/common/FiltrosExecucoes';
import type { Execucao } from '../types/dominio';

// ===================================================================
// FUNÇÕES DE FILTRAGEM
// ===================================================================

/**
 * Aplica filtros e ordenação a uma lista de execuções
 */
export function aplicarFiltros(
  execucoes: Execucao[],
  filtros: FiltrosState
): Execucao[] {
  let resultado = [...execucoes];

  // 1. Filtro de Busca por Texto
  if (filtros.busca.trim()) {
    const termoBusca = filtros.busca.toLowerCase().trim();
    resultado = resultado.filter((exec) => {
      // Buscar em: local, responsável, observações, número do documento
      const campos = [
        exec.campos_customizados?.local || '',
        exec.campos_customizados?.responsavel || '',
        exec.campos_customizados?.observacoes || '',
        exec.numero_documento || '',
        exec.modulo_nome || '',
      ].map(c => String(c).toLowerCase());

      return campos.some(campo => campo.includes(termoBusca));
    });
  }

  // 2. Filtro de Data Início
  if (filtros.dataInicio) {
    const dataInicio = new Date(filtros.dataInicio);
    dataInicio.setHours(0, 0, 0, 0);

    resultado = resultado.filter((exec) => {
      const dataExec = new Date(exec.created_at);
      dataExec.setHours(0, 0, 0, 0);
      return dataExec >= dataInicio;
    });
  }

  // 3. Filtro de Data Fim
  if (filtros.dataFim) {
    const dataFim = new Date(filtros.dataFim);
    dataFim.setHours(23, 59, 59, 999);

    resultado = resultado.filter((exec) => {
      const dataExec = new Date(exec.created_at);
      return dataExec <= dataFim;
    });
  }

  // 4. Filtro de Status
  if (filtros.status !== 'todos') {
    resultado = resultado.filter((exec) => exec.status === filtros.status);
  }

  // 5. Filtro de Módulo
  if (filtros.moduloId) {
    resultado = resultado.filter((exec) => exec.modulo_id === filtros.moduloId);
  }

  // 6. Filtro de Domínio
  if (filtros.dominioId) {
    resultado = resultado.filter((exec) => exec.dominio_id === filtros.dominioId);
  }

  // 7. Ordenação
  resultado = ordenarExecucoes(resultado, filtros.ordenacao);

  return resultado;
}

/**
 * Ordena execuções de acordo com o critério selecionado
 */
function ordenarExecucoes(
  execucoes: Execucao[],
  ordenacao: FiltrosState['ordenacao']
): Execucao[] {
  const resultado = [...execucoes];

  switch (ordenacao) {
    case 'data_desc':
      // Mais recentes primeiro
      return resultado.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    case 'data_asc':
      // Mais antigas primeiro
      return resultado.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    case 'conformidade_desc':
      // Maior conformidade primeiro
      return resultado.sort((a, b) => {
        const confA = calcularTaxaConformidade(a);
        const confB = calcularTaxaConformidade(b);
        return confB - confA;
      });

    case 'conformidade_asc':
      // Menor conformidade primeiro
      return resultado.sort((a, b) => {
        const confA = calcularTaxaConformidade(a);
        const confB = calcularTaxaConformidade(b);
        return confA - confB;
      });

    case 'modulo_asc':
      // Ordem alfabética por módulo
      return resultado.sort((a, b) => {
        const nomeA = (a.modulo_nome || '').toLowerCase();
        const nomeB = (b.modulo_nome || '').toLowerCase();
        return nomeA.localeCompare(nomeB);
      });

    default:
      return resultado;
  }
}

/**
 * Calcula a taxa de conformidade de uma execução
 */
function calcularTaxaConformidade(execucao: Execucao): number {
  const respostas = execucao.respostas || [];

  if (respostas.length === 0) return 0;

  const conformes = respostas.filter(r => {
    const valor = String(r.valor_resposta).toLowerCase();
    return valor === 'sim' || valor === 'conforme' || valor === 'true' || valor === 'c';
  }).length;

  return (conformes / respostas.length) * 100;
}

// ===================================================================
// FUNÇÕES DE EXPORTAÇÃO
// ===================================================================

/**
 * Exporta execuções filtradas para CSV
 */
export function exportarParaCSV(execucoes: Execucao[]): void {
  if (execucoes.length === 0) {
    alert('Nenhuma execução para exportar');
    return;
  }

  // Cabeçalhos do CSV
  const headers = [
    'Número Documento',
    'Data/Hora',
    'Domínio',
    'Módulo',
    'Status',
    'Local',
    'Responsável',
    'Taxa Conformidade (%)',
    'Total Perguntas',
    'Conformes',
    'Não Conformes',
    'N/A',
    'Observações'
  ];

  // Converter execuções para linhas CSV
  const linhas = execucoes.map(exec => {
    const respostas = exec.respostas || [];
    const total = respostas.length;

    let conformes = 0;
    let naoConformes = 0;
    let naoAplicaveis = 0;

    respostas.forEach(r => {
      const valor = String(r.valor_resposta).toLowerCase();
      if (valor === 'sim' || valor === 'conforme' || valor === 'true' || valor === 'c') {
        conformes++;
      } else if (valor === 'nao' || valor === 'não' || valor === 'nao conforme' || valor === 'false' || valor === 'nc') {
        naoConformes++;
      } else if (valor === 'n/a' || valor === 'na') {
        naoAplicaveis++;
      }
    });

    const taxaConformidade = total > 0 ? ((conformes / total) * 100).toFixed(1) : '0';

    return [
      exec.numero_documento || '',
      new Date(exec.created_at).toLocaleString('pt-BR'),
      exec.dominio_nome || '',
      exec.modulo_nome || '',
      exec.status === 'concluido' ? 'Concluído' : 'Rascunho',
      exec.campos_customizados?.local || '',
      exec.campos_customizados?.responsavel || '',
      taxaConformidade,
      total,
      conformes,
      naoConformes,
      naoAplicaveis,
      (exec.campos_customizados?.observacoes || '').replace(/,/g, ';') // Escape vírgulas
    ];
  });

  // Montar CSV
  const csvContent = [
    headers.join(','),
    ...linhas.map(linha => linha.map(campo => `"${campo}"`).join(','))
  ].join('\n');

  // Criar Blob e fazer download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const dataAtual = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `execucoes_${dataAtual}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`✅ CSV exportado com sucesso! ${execucoes.length} execuções`);
}

/**
 * Formata número de execuções para exibição
 */
export function formatarContador(total: number, visiveis: number): string {
  if (total === visiveis) {
    return `${total} execuç${total === 1 ? 'ão' : 'ões'}`;
  }
  return `${visiveis} de ${total} execuç${total === 1 ? 'ão' : 'ões'}`;
}
