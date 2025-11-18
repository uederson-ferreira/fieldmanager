import { lvAPI } from '../lib/lvAPI';
import type { LV, LVFoto } from '../types/lv';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface HTMLFormData {
  title: string;
  subtitle?: string;
  data: Partial<LV> & {
    tipo?: string;
    avaliacoes?: any[]; // Assuming LVResiduosAvaliacao is replaced by 'any' or a more generic type
  };
  photos?: string[];
  metadata?: Record<string, unknown>;
}

// Função para converter URL de foto para base64
const convertPhotoUrlToBase64 = async (url: string): Promise<string> => {
  try {
    // Se já é base64, retornar como está
    if (url.startsWith('data:image/')) {
      return url;
    }

    // Criar um timeout para evitar travamentos
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout ao carregar foto')), 10000); // 10 segundos
    });

    // Função para fazer o fetch com timeout
    const fetchWithTimeout = async (url: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await fetch(url, { 
          signal: controller.signal,
          mode: 'cors'
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.blob();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Fazer download da imagem
    const blob = await Promise.race([
      fetchWithTimeout(url),
      timeoutPromise
    ]);

    // Converter blob para base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(blob);
    });

  } catch (error) {
    console.error('Erro ao converter foto para base64:', error, 'URL:', url);
    // Retornar uma imagem placeholder em base64
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDE2MCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEM4OC4zNjYgNjAgOTUgNTMuMzY2IDk1IDQ1Qzk1IDM2LjYzNCA4OC4zNjYgMzAgODAgMzBDNzEuNjM0IDMwIDY1IDM2LjYzNCA2NSA0NUM2NSA1My4zNjYgNzEuNjM0IDYwIDgwIDYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  }
};

// Função para converter todas as fotos para base64
export const convertPhotosToBase64 = async (photos: string[]): Promise<string[]> => {
  if (photos.length === 0) {
    return [];
  }

  console.log(`🔄 [CONVERSÃO] Iniciando conversão de ${photos.length} fotos para base64`);
  
  // Processar fotos em paralelo com limite de concorrência
  const batchSize = 3; // Processar 3 fotos por vez para evitar sobrecarga
  const convertedPhotos: string[] = [];
  
  for (let i = 0; i < photos.length; i += batchSize) {
    const batch = photos.slice(i, i + batchSize);
    const batchPromises = batch.map(async (photo, index) => {
      const photoIndex = i + index + 1;
      console.log(`🖼️ [CONVERSÃO] Processando foto ${photoIndex}/${photos.length}`);
      
      try {
        const base64Photo = await convertPhotoUrlToBase64(photo);
        console.log(`✅ [CONVERSÃO] Foto ${photoIndex} convertida com sucesso`);
        return base64Photo;
      } catch (error) {
        console.error(`❌ [CONVERSÃO] Erro ao converter foto ${photoIndex}:`, error);
        // Retornar placeholder
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDE2MCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEM4OC4zNjYgNjAgOTUgNTMuMzY2IDk1IDQ1Qzk1IDM2LjYzNCA4OC4zNjYgMzAgODAgMzBDNzEuNjM0IDMwIDY1IDM2LjYzNCA2NSA0NUM2NSA1My4zNjYgNzEuNjM0IDYwIDgwIDYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    convertedPhotos.push(...batchResults);
  }
  
  console.log(`✅ [CONVERSÃO] Conversão concluída: ${convertedPhotos.length} fotos processadas`);
  return convertedPhotos;
};

export const generateHTMLForm = async (data: HTMLFormData): Promise<void> => {
  try {
    console.log('📄 [HTML] Gerando formulário HTML:', data.title);
    
    const htmlContent = generateLVResiduosHTML(data);
    
    // Criar nova janela
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      throw new Error('Não foi possível abrir nova janela');
    }
    
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    console.log('✅ [HTML] Formulário HTML gerado com sucesso');
  } catch (error) {
    console.error('❌ [HTML] Erro ao gerar formulário HTML:', error);
    throw error;
  }
};

const generateLVResiduosHTML = (formData: HTMLFormData): string => {
  const { title, subtitle, data, photos = [] } = formData;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2E7D32;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 14px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            color: #2E7D32;
            border-bottom: 1px solid #E8F5E8;
            padding-bottom: 5px;
            font-size: 18px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            background: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            font-size: 12px;
            text-transform: uppercase;
        }
        .info-value {
            color: #333;
            margin-top: 3px;
        }
        .avaliacoes {
            margin-top: 20px;
        }
        .avaliacao-item {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
            border-left: 4px solid #4CAF50;
        }
        .avaliacao-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .avaliacao-titulo {
            font-weight: bold;
            color: #2E7D32;
        }
        .avaliacao-status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-conforme {
            background: #E8F5E8;
            color: #2E7D32;
        }
        .status-nao-conforme {
            background: #FFEBEE;
            color: #C62828;
        }
        .status-pendente {
            background: #FFF3E0;
            color: #EF6C00;
        }
        .avaliacao-descricao {
            color: #666;
            font-size: 14px;
            line-height: 1.4;
        }
        .photos-section {
            margin-top: 30px;
        }
        .photos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .photo-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .photo-card img {
            width: 100%;
            height: 120px;
            object-fit: cover;
            display: block;
        }
        .photo-caption {
            padding: 8px;
            text-align: center;
            font-size: 12px;
            color: #666;
            background: #f9f9f9;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #888;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
        
        <div class="section">
            <h2>Informações Gerais</h2>
            <div class="info-grid">
                ${data.numero_sequencial ? `
                <div class="info-item">
                    <div class="info-label">Número LV</div>
                    <div class="info-value">LV-${String(data.numero_sequencial).padStart(4, '0')}</div>
                </div>
                ` : ''}
                ${data.nome_lv ? `
                <div class="info-item">
                    <div class="info-label">Tipo</div>
                    <div class="info-value">${data.nome_lv}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">Data da Inspeção</div>
                    <div class="info-value">${data.data_inspecao ? new Date(data.data_inspecao).toLocaleDateString('pt-BR') : 'N/A'}</div>
                </div>
                ${data.data_preenchimento ? `
                <div class="info-item">
                    <div class="info-label">Data de Preenchimento</div>
                    <div class="info-value">${new Date(data.data_preenchimento).toLocaleString('pt-BR')}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">Área</div>
                    <div class="info-value">${data.area || 'N/A'}</div>
                </div>
                ${data.responsavel_area ? `
                <div class="info-item">
                    <div class="info-label">Responsável Área</div>
                    <div class="info-value">${data.responsavel_area}</div>
                </div>
                ` : ''}
                ${data.responsavel_tecnico ? `
                <div class="info-item">
                    <div class="info-label">Responsável Técnico</div>
                    <div class="info-value">${data.responsavel_tecnico}</div>
                </div>
                ` : ''}
                ${data.responsavel_empresa ? `
                <div class="info-item">
                    <div class="info-label">Responsável Empresa</div>
                    <div class="info-value">${data.responsavel_empresa}</div>
                </div>
                ` : ''}
                ${data.inspetor_principal ? `
                <div class="info-item">
                    <div class="info-label">Inspetor Principal</div>
                    <div class="info-value">${data.inspetor_principal}</div>
                </div>
                ` : ''}
                ${data.inspetor_secundario ? `
                <div class="info-item">
                    <div class="info-label">Inspetor Secundário</div>
                    <div class="info-value">${data.inspetor_secundario}${data.inspetor_secundario_matricula ? ` (Mat: ${data.inspetor_secundario_matricula})` : ''}</div>
                </div>
                ` : ''}
                ${data.usuario_nome ? `
                <div class="info-item">
                    <div class="info-label">Usuário</div>
                    <div class="info-value">${data.usuario_nome}${data.usuario_matricula ? ` (${data.usuario_matricula})` : ''}</div>
                </div>
                ` : ''}
                ${data.latitude || data.longitude ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Coordenadas GPS</div>
                    <div class="info-value">
                        ${data.latitude ? `Lat: ${data.latitude}` : ''}
                        ${data.latitude && data.longitude ? ' | ' : ''}
                        ${data.longitude ? `Long: ${data.longitude}` : ''}
                        ${data.gps_precisao ? ` (Precisão: ${data.gps_precisao}m)` : ''}
                    </div>
                </div>
                ` : ''}
                ${data.endereco_gps ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Endereço GPS</div>
                    <div class="info-value">${data.endereco_gps}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">${data.status === 'concluido' || data.status === 'concluida' ? 'Concluído' : data.status || 'N/A'}</div>
                </div>
                ${data.total_conformes !== undefined || data.total_nao_conformes !== undefined ? `
                <div class="info-item">
                    <div class="info-label">Conformidade</div>
                    <div class="info-value">${data.percentual_conformidade || 0}% (${data.total_conformes || 0}C / ${data.total_nao_conformes || 0}NC)</div>
                </div>
                ` : ''}
            </div>
            ${data.observacoes_gerais ? `
            <div class="info-item" style="margin-top: 15px; grid-column: 1 / -1;">
                <div class="info-label">Observações Gerais</div>
                <div class="info-value" style="white-space: pre-wrap;">${data.observacoes_gerais}</div>
            </div>
            ` : ''}
        </div>
        
        ${data.observacoes ? `
        <div class="section">
            <h2>Observações</h2>
            <div class="info-item">
                <div class="info-value">${data.observacoes}</div>
            </div>
        </div>
        ` : ''}
        
        ${data.avaliacoes && data.avaliacoes.length > 0 ? `
        <div class="section avaliacoes">
            <h2>Avaliações</h2>
            ${data.avaliacoes.map(avaliacao => {
              // Mapear avaliação para status legível
              const statusMap: { [key: string]: { texto: string; classe: string } } = {
                'C': { texto: 'CONFORME', classe: 'conforme' },
                'NC': { texto: 'NÃO CONFORME', classe: 'nao-conforme' },
                'NA': { texto: 'NÃO APLICÁVEL', classe: 'pendente' }
              };
              const status = statusMap[avaliacao.avaliacao] || { texto: avaliacao.avaliacao, classe: 'pendente' };
              
              return `
            <div class="avaliacao-item">
                <div class="avaliacao-header">
                    <div class="avaliacao-titulo">
                      <span style="font-weight: bold; color: #2E7D32;">${avaliacao.item_codigo || ''}</span>
                      ${avaliacao.item_pergunta || 'Sem descrição'}
                    </div>
                    <div class="avaliacao-status status-${status.classe}">
                        ${status.texto}
                    </div>
                </div>
                ${avaliacao.observacao ? `
                <div class="avaliacao-descricao">
                    <strong>Observação:</strong> ${avaliacao.observacao}
                </div>
                ` : ''}
            </div>
            `;
            }).join('')}
        </div>
        ` : ''}
        
        <div class="section photos-section">
            <h2>Fotos</h2>
            <div class="photos-grid">
            ${photos.length === 0 ? '<div style="color:#888;">Nenhuma foto disponível</div>' : photos.map((url, i) => `
            <div class="photo-card">
                <img src="${url}" alt="Foto ${i + 1}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDE2MCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEM4OC4zNjYgNjAgOTUgNTMuMzY2IDk1IDQ1Qzk1IDM2LjYzNCA4OC4zNjYgMzAgODAgMzBDNzEuNjM0IDMwIDY1IDM2LjYzNCA2NSA0NUM2NSA1My4zNjYgNzEuNjM0IDYwIDgwIDYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';" />
                <div class="photo-caption">Foto ${i + 1}</div>
            </div>
            `).join('')}
        </div>
    </div>
    <div class="footer">
        Relatório gerado por EcoField &mdash; ${new Date().toLocaleString('pt-BR')}<br/>
        <span style="font-size:11px;">Desenvolvido por sua equipe de TI</span>
    </div>
</body>
</html>
  `;
};

// Função específica para LV Resíduos (ESTRUTURA ANTIGA - MANTIDA PARA COMPATIBILIDADE)
export const generateLVResiduosHTMLForm = async (lvId: string): Promise<void> => {
  try {
    console.log('📄 [HTML] Iniciando geração de HTML para LV:', lvId);
    
    // Buscar dados do LV usando lvAPI
    const lvResponse = await lvAPI.buscarLV(lvId);
    if (!lvResponse.success || !lvResponse.data) {
      throw new Error('LV não encontrada');
    }
    const lvData = lvResponse.data;

    // Buscar avaliações usando lvAPI
    const avaliacoesResponse = await lvAPI.buscarAvaliacoes(lvId);

    // Buscar fotos usando lvAPI
    const fotosResponse = await lvAPI.buscarFotos(lvId);

    // Converter fotos para base64
    const photoUrls = fotosResponse.success ? fotosResponse.data?.map(f => f.url_arquivo) || [] : [];
    console.log('🖼️ [HTML] Convertendo fotos para base64:', photoUrls.length);
    const convertedPhotos = await convertPhotosToBase64(photoUrls);

    const formData: HTMLFormData = {
      title: `LV Resíduos #${lvData.numero_sequencial || 'N/A'} - ${lvData.area_id || 'N/A'}`,
      subtitle: `Inspeção realizada em ${lvData.data_inspecao ? new Date(lvData.data_inspecao).toLocaleDateString('pt-BR') : 'N/A'}`,
      data: {
        ...lvData,
        tipo: 'lv_residuos',
        avaliacoes: avaliacoesResponse.success ? avaliacoesResponse.data || [] : []
      },
      photos: convertedPhotos
    };

    await generateHTMLForm(formData);
    console.log('✅ [HTML] HTML gerado com sucesso');
  } catch (error) {
    console.error('❌ [HTML] Erro ao gerar formulário HTML para LV Resíduos:', error);
    throw error;
  }
};

// Função para gerar PDF baseada no HTML (ESTRUTURA ANTIGA - MANTIDA PARA COMPATIBILIDADE)
export const generateLVResiduosPDF = async (lvId: string): Promise<void> => {
  try {
    console.log('📄 [PDF] Iniciando geração de PDF para LV:', lvId);
    
    // Buscar dados do LV usando lvAPI
    const lvResponse = await lvAPI.buscarLV(lvId);
    if (!lvResponse.success || !lvResponse.data) {
      throw new Error('LV não encontrada');
    }
    const lvData = lvResponse.data;

    // Buscar avaliações usando lvAPI
    const avaliacoesResponse = await lvAPI.buscarAvaliacoes(lvId);

    // Buscar fotos usando lvAPI
    const fotosResponse = await lvAPI.buscarFotos(lvId);

    // Converter fotos para base64
    const photoUrls = fotosResponse.success ? fotosResponse.data?.map(f => f.url_arquivo) || [] : [];
    console.log('🖼️ [PDF] Convertendo fotos para base64:', photoUrls.length);
    const convertedPhotos = await convertPhotosToBase64(photoUrls);

    const formData: HTMLFormData = {
      title: `LV Resíduos #${lvData.numero_sequencial || 'N/A'} - ${lvData.area_id || 'N/A'}`,
      subtitle: `Inspeção realizada em ${lvData.data_inspecao ? new Date(lvData.data_inspecao).toLocaleDateString('pt-BR') : 'N/A'}`,
      data: {
        ...lvData,
        tipo: 'lv_residuos',
        avaliacoes: avaliacoesResponse.success ? avaliacoesResponse.data || [] : []
      },
      photos: convertedPhotos
    };

    // Gerar HTML
    const htmlContent = generateLVResiduosHTML(formData);
    
    // Criar elemento temporário
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    document.body.appendChild(tempDiv);
    
    try {
      // Converter para canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Gerar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Salvar PDF
      const fileName = `LV_Residuos_${lvData.numero_sequencial || lvId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ [PDF] PDF gerado com sucesso:', fileName);
      
    } finally {
      // Limpar elemento temporário
      document.body.removeChild(tempDiv);
    }
    
  } catch (error) {
    console.error('❌ [PDF] Erro ao gerar PDF:', error);
    throw error;
  }
};

// ===================================================================
// FUNÇÕES UNIFICADAS - NOVA ESTRUTURA
// ===================================================================

export async function generateLVHTMLForm(lvId: string, tipo_lv: string = 'residuos'): Promise<string> {
  try {
    console.log('🖼️ [HTML UNIFICADO] Gerando HTML para LV:', lvId, 'tipo:', tipo_lv);
    
    // Buscar dados do LV
    const lvResponse = await lvAPI.buscarLV(lvId);
    if (!lvResponse.success || !lvResponse.data) {
      throw new Error('Erro ao buscar dados do LV');
    }
    
    const lvData = lvResponse.data;
    
    // Buscar fotos do LV
    const fotosResponse = await lvAPI.buscarFotos(lvId);
    const fotos = fotosResponse.success ? fotosResponse.data : [];
    
    console.log('🖼️ [HTML UNIFICADO] Fotos encontradas:', fotos?.length || 0);
    
    // Gerar HTML baseado no tipo de LV
    if (tipo_lv === 'residuos') {
      return generateResiduosHTML(lvData, fotos || []);
    } else if (tipo_lv === 'inspecao') {
      return generateInspecaoHTML(lvData, fotos || []);
    } else {
      return generateGenericHTML(lvData, fotos || []);
    }
  } catch (error) {
    console.error('❌ [HTML UNIFICADO] Erro ao gerar HTML:', error);
    throw error;
  }
}

function generateResiduosHTML(lvData: LV, fotos: LVFoto[]): string {
  const photoUrls = fotos?.map(f => f.url_arquivo) || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>LV Resíduos #${lvData.numero_sequencial || 'N/A'} - ${lvData.area_id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        .photos { margin-top: 20px; }
        .photo { margin: 10px 0; text-align: center; }
        .photo img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>LV Resíduos #${lvData.numero_sequencial || 'N/A'}</h1>
        <h2>${lvData.area_id}</h2>
        <p>Inspeção realizada em ${new Date(lvData.data_inspecao).toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div class="info">
        <h3>Informações Gerais</h3>
        <p><strong>Status:</strong> ${lvData.status}</p>
        <p><strong>Observações:</strong> ${lvData.observacoes || 'Nenhuma observação'}</p>
      </div>
      
      <div class="photos">
        <h3>Fotos da Inspeção</h3>
        ${photoUrls.length === 0 ? '<div style="color:#888;">Nenhuma foto disponível</div>' : photoUrls.map((url, i) => `
          <div class="photo">
            <img src="${url}" alt="Foto ${i + 1}" />
            <p>Foto ${i + 1}</p>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

function generateInspecaoHTML(lvData: LV, fotos: LVFoto[]): string {
  const photoUrls = fotos?.map(f => f.url_arquivo) || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>LV Inspeção #${lvData.numero_sequencial || 'N/A'} - ${lvData.area_id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        .photos { margin-top: 20px; }
        .photo { margin: 10px 0; text-align: center; }
        .photo img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>LV Inspeção #${lvData.numero_sequencial || 'N/A'}</h1>
        <h2>${lvData.area_id}</h2>
        <p>Inspeção realizada em ${new Date(lvData.data_inspecao).toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div class="info">
        <h3>Informações Gerais</h3>
        <p><strong>Status:</strong> ${lvData.status}</p>
        <p><strong>Observações:</strong> ${lvData.observacoes || 'Nenhuma observação'}</p>
      </div>
      
      <div class="photos">
        <h3>Fotos da Inspeção</h3>
        ${photoUrls.length === 0 ? '<div style="color:#888;">Nenhuma foto disponível</div>' : photoUrls.map((url, i) => `
          <div class="photo">
            <img src="${url}" alt="Foto ${i + 1}" />
            <p>Foto ${i + 1}</p>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

function generateGenericHTML(lvData: LV, fotos: LVFoto[]): string {
  const photoUrls = fotos?.map(f => f.url_arquivo) || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>LV #${lvData.numero_sequencial || 'N/A'} - ${lvData.area_id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        .photos { margin-top: 20px; }
        .photo { margin: 10px 0; text-align: center; }
        .photo img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>LV #${lvData.numero_sequencial || 'N/A'}</h1>
        <h2>${lvData.area_id}</h2>
        <p>Data: ${new Date(lvData.data_inspecao).toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div class="info">
        <h3>Informações Gerais</h3>
        <p><strong>Status:</strong> ${lvData.status}</p>
        <p><strong>Observações:</strong> ${lvData.observacoes || 'Nenhuma observação'}</p>
      </div>
      
      <div class="photos">
        <h3>Fotos</h3>
        ${photoUrls.length === 0 ? '<div style="color:#888;">Nenhuma foto disponível</div>' : photoUrls.map((url, i) => `
          <div class="photo">
            <img src="${url}" alt="Foto ${i + 1}" />
            <p>Foto ${i + 1}</p>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

// Função unificada para gerar PDF de qualquer LV
export const generateLVPDF = async (lvId: string, tipoLV: string): Promise<void> => {
  try {
    console.log('📄 [PDF UNIFICADO] Iniciando geração de PDF para LV:', lvId, 'Tipo:', tipoLV);
    
    // Buscar dados do LV usando API unificada
    const lvResponse = await lvAPI.buscarLV(lvId);
    if (!lvResponse.success || !lvResponse.data) {
      throw new Error('LV não encontrada');
    }
    const lvData = lvResponse.data;

    // Buscar avaliações usando API unificada
    const avaliacoesResponse = await lvAPI.buscarAvaliacoes(lvId);
    
    // Buscar fotos usando API unificada
    const fotosResponse = await lvAPI.buscarFotos(lvId);

    // Converter fotos para base64
    const photoUrls = fotosResponse.success ? fotosResponse.data?.map(f => f.url_arquivo) || [] : [];
    console.log('🖼️ [PDF UNIFICADO] Convertendo fotos para base64:', photoUrls.length);
    const convertedPhotos = await convertPhotosToBase64(photoUrls);

    // Ordenar avaliações por item_codigo para manter ordem correta
    const avaliacoesOrdenadas = avaliacoesResponse.success && avaliacoesResponse.data 
      ? [...avaliacoesResponse.data].sort((a, b) => {
          // Comparar códigos como strings (ex: "05.01" vs "05.02")
          return (a.item_codigo || '').localeCompare(b.item_codigo || '');
        })
      : [];

    const formData: HTMLFormData = {
      title: `LV ${tipoLV.toUpperCase()} #${lvData.numero_sequencial || 'N/A'} - ${lvData.area_id || lvData.area || 'Área não especificada'}`,
      subtitle: `Inspeção realizada em ${lvData.data_inspecao ? new Date(lvData.data_inspecao).toLocaleDateString('pt-BR') : 'N/A'}`,
      data: {
        ...lvData,
        tipo: tipoLV,
        avaliacoes: avaliacoesOrdenadas
      },
      photos: convertedPhotos
    };

    // Gerar HTML
    const htmlContent = generateLVResiduosHTML(formData);
    
    // Criar elemento temporário
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    document.body.appendChild(tempDiv);
    
    const pdfPromise = async () => {
      try {
        // Converter para canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        // Gerar PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Salvar PDF
        const fileName = `LV_${tipoLV.toUpperCase()}_${lvData.numero_sequencial || lvId}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        console.log('✅ [PDF UNIFICADO] PDF gerado com sucesso:', fileName);
      } finally {
        // Limpar elemento temporário
        document.body.removeChild(tempDiv);
      }
    };

    await pdfPromise();
  } catch (error) {
    console.error('❌ [PDF UNIFICADO] Erro ao gerar PDF:', error);
    throw error;
  }
};