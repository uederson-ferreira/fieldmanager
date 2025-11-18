// ===================================================================
// GERADOR DE DADOS DE TESTE PARA LVs - ECOFIELD SYSTEM
// Localização: src/utils/testDataGenerator.ts
// Objetivo: Facilitar testes preenchendo formulários automaticamente
// ===================================================================

import type { LVFormData, LVConfig } from '../components/lv/types/lv';

/**
 * Cria um arquivo de imagem de teste (placeholder colorido)
 * @param width Largura da imagem
 * @param height Altura da imagem
 * @param color Cor de fundo (hex)
 * @param text Texto a ser exibido
 */
const createTestImage = async (
  width: number = 400,
  height: number = 300,
  color: string = '#4ade80',
  text: string = 'FOTO DE TESTE'
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      // Fallback: retornar arquivo vazio
      const blob = new Blob([], { type: 'image/png' });
      resolve(new File([blob], 'test-image.png', { type: 'image/png' }));
      return;
    }

    // Fundo colorido
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Adicionar grid (simular azulejo/parede)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Texto centralizado
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    // Timestamp
    ctx.font = '14px Arial';
    ctx.fillText(new Date().toLocaleString('pt-BR'), width / 2, height / 2 + 40);

    // Converter canvas para Blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `test-photo-${Date.now()}.png`, {
          type: 'image/png',
          lastModified: Date.now(),
        });
        resolve(file);
      } else {
        const emptyBlob = new Blob([], { type: 'image/png' });
        resolve(new File([emptyBlob], 'test-image.png', { type: 'image/png' }));
      }
    }, 'image/png');
  });
};

/**
 * Gera dados de teste para preencher o formulário LV
 * @param configuracao Configuração da LV
 * @param nomeUsuario Nome do usuário logado
 * @param matriculaUsuario Matrícula do usuário logado
 */
export const generateTestData = async (
  configuracao: LVConfig,
  nomeUsuario: string,
  matriculaUsuario: string
): Promise<Partial<LVFormData>> => {
  console.log('🧪 Gerando dados de teste para LV...');

  // Listas de dados aleatórios para tornar mais realista
  const areas = [
    'Área de Produção - Setor A',
    'Almoxarifado Central',
    'Pátio de Máquinas',
    'Laboratório de Análises',
    'Estação de Tratamento',
    'Canteiro de Obras - Fase 2',
  ];

  const responsaveisTecnicos = [
    'Carlos Silva Santos',
    'Ana Paula Oliveira',
    'José Roberto Lima',
    'Maria Fernanda Costa',
    'Pedro Henrique Souza',
  ];

  const responsaveisArea = [
    'João Marcos Ferreira',
    'Juliana Alves Pereira',
    'Ricardo Mendes Silva',
    'Patrícia Souza Martins',
  ];

  const responsaveisEmpresa = [
    'Construtora ABC Ltda - Eng. Paulo Santos',
    'EcoServiços S.A. - Adm. Mariana Lima',
    'TecAmbiental - Eng. Roberto Costa',
  ];

  const inspetoresSecundarios = [
    'Lucas Henrique Oliveira',
    'Fernanda Costa Lima',
    'Rodrigo Alves Santos',
    'Beatriz Silva Martins',
  ];

  const observacoesGerais = [
    'Verificação realizada conforme procedimento padrão. Todas as não conformidades identificadas foram devidamente registradas e comunicadas ao responsável da área.',
    'Inspeção realizada em condições normais de operação. Recomenda-se acompanhamento das ações corretivas propostas.',
    'Durante a verificação, foram observados pontos de melhoria que devem ser implementados no próximo ciclo de manutenção.',
    'Área inspecionada apresentou bom estado geral de conservação. Algumas adequações menores foram solicitadas.',
  ];

  const observacoesIndividuais = [
    'Item conforme especificação técnica',
    'Necessário realizar manutenção preventiva',
    'Equipamento em bom estado de conservação',
    'Identificação visível e legível',
    'Documentação atualizada e disponível',
    'Área limpa e organizada',
    'Sinalização adequada presente',
    'Necessário ajuste na próxima manutenção',
    'Operando dentro dos parâmetros normais',
    'Requer atenção especial no próximo período',
  ];

  // Sortear valores aleatórios
  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Gerar coordenadas GPS aleatórias (região do Brasil - exemplo: São Paulo)
  const latitude = -23.5505 + (Math.random() - 0.5) * 0.1; // ~São Paulo
  const longitude = -46.6333 + (Math.random() - 0.5) * 0.1;
  const gpsAccuracy = 5 + Math.random() * 15; // 5-20m de precisão

  // Gerar avaliações e fotos para os itens
  const avaliacoes: { [key: string]: "C" | "NC" | "NA" } = {};
  const observacoesIndividuaisMap: { [key: string]: string } = {};
  const fotos: { [key: string]: any[] } = {};

  // Distribuição realista: 70% Conforme, 20% Não Conforme, 10% Não Aplicável
  const distribuicao = ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'NC', 'NC', 'NA'];

  for (let index = 0; index < configuracao.itens.length; index++) {
    const item = configuracao.itens[index];
    const avaliacao = randomItem(distribuicao) as "C" | "NC" | "NA";
    avaliacoes[item.id] = avaliacao;

    // ✅ MUDANÇA: Adicionar observação para TODOS os itens (100%)
    observacoesIndividuaisMap[item.id] = randomItem(observacoesIndividuais);

    // ✅ MUDANÇA: Padrão alternado de fotos (1, 2, 1, 2, 1, 2...)
    // Primeiro item (index 0): 1 foto
    // Segundo item (index 1): 2 fotos
    // Terceiro item (index 2): 1 foto
    // Quarto item (index 3): 2 fotos
    // E assim por diante...
    const numFotos = (index % 2 === 0) ? 1 : 2;
    const fotosList = [];

    for (let i = 0; i < numFotos; i++) {
      // Cores diferentes baseado na avaliação
      const color = avaliacao === 'NC' ? '#ef4444' : avaliacao === 'C' ? '#22c55e' : '#eab308';
      const text = `${avaliacao} - Item ${item.id}`;

      try {
        const testImage = await createTestImage(400, 300, color, text);
        const urlPreview = URL.createObjectURL(testImage);

        fotosList.push({
          item_id: item.id,
          arquivo: testImage,
          urlOriginal: urlPreview,
          nome_arquivo: testImage.name,
        });
      } catch (error) {
        console.error('Erro ao criar imagem de teste:', error);
      }
    }

    if (fotosList.length > 0) {
      fotos[item.id] = fotosList;
    }
  }

  // Gerar assinaturas de teste (canvas com assinatura simulada)
  const generateTestSignature = (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('');
        return;
      }

      // Fundo branco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 150);

      // Assinatura simulada (linha ondulada)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 75);

      // Criar linha de assinatura com curvas
      for (let x = 50; x < 350; x += 10) {
        const y = 75 + Math.sin((x - 50) / 20) * 20 + (Math.random() - 0.5) * 10;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Adicionar "rubrica" no final
      ctx.beginPath();
      ctx.arc(340, 70, 10, 0, Math.PI * 2);
      ctx.stroke();

      resolve(canvas.toDataURL('image/png'));
    });
  };

  const assinaturaPrincipal = await generateTestSignature();
  const assinaturaSecundaria = Math.random() > 0.5 ? await generateTestSignature() : null;

  console.log(`✅ Dados de teste gerados:`);
  console.log(`   - ${Object.keys(avaliacoes).length} itens avaliados`);
  console.log(`   - ${Object.keys(fotos).length} itens com fotos`);
  console.log(`   - Total de fotos: ${Object.values(fotos).reduce((acc, f) => acc + f.length, 0)}`);

  return {
    // Informações básicas
    area: randomItem(areas),
    areaCustomizada: '',
    usarAreaCustomizada: false,
    data_inspecao: new Date().toISOString().split('T')[0], // Data de hoje
    inspetor_principal: nomeUsuario,
    inspetor_principal_matricula: matriculaUsuario,
    responsavel_tecnico: randomItem(responsaveisTecnicos),
    responsavelArea: randomItem(responsaveisArea),
    responsavelEmpresa: randomItem(responsaveisEmpresa),
    inspetor2Nome: Math.random() > 0.5 ? randomItem(inspetoresSecundarios) : '',
    inspetor2Matricula: Math.random() > 0.5 ? `MAT-${Math.floor(Math.random() * 90000) + 10000}` : '',
    observacoes: randomItem(observacoesGerais),

    // Localização GPS
    latitude,
    longitude,
    gpsAccuracy,
    enderecoGPS: `Rua Exemplo, ${Math.floor(Math.random() * 9000) + 1000} - São Paulo, SP`,

    // Avaliações e observações
    avaliacoes,
    observacoesIndividuais: observacoesIndividuaisMap,
    fotos,

    // Assinaturas
    assinatura_inspetor_principal: assinaturaPrincipal,
    data_assinatura_inspetor_principal: new Date().toISOString(),
    assinatura_inspetor_secundario: assinaturaSecundaria,
    data_assinatura_inspetor_secundario: assinaturaSecundaria ? new Date().toISOString() : null,
  };
};

/**
 * Estatísticas dos dados gerados (para log/debug)
 */
export const getTestDataStats = (data: Partial<LVFormData>): Record<string, number> => {
  const avaliacoes = data.avaliacoes || {};
  const fotos = data.fotos || {};

  return {
    totalItens: Object.keys(avaliacoes).length,
    conformes: Object.values(avaliacoes).filter(a => a === 'C').length,
    naoConformes: Object.values(avaliacoes).filter(a => a === 'NC').length,
    naoAplicaveis: Object.values(avaliacoes).filter(a => a === 'NA').length,
    itensComFoto: Object.keys(fotos).length,
    totalFotos: Object.values(fotos).reduce((acc, f) => acc + f.length, 0),
  };
};
