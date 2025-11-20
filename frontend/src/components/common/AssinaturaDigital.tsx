// ===================================================================
// COMPONENTE DE ASSINATURA DIGITAL - FIELDMANAGER v2.0
// Localização: src/components/common/AssinaturaDigital.tsx
// ===================================================================

import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool, RotateCcw, Check, X, Lock, AlertCircle,
  CheckCircle, Shield, Smartphone, Monitor
} from 'lucide-react';

// ===================================================================
// INTERFACES
// ===================================================================

export interface DadosAssinatura {
  assinaturaBase64: string; // Imagem da assinatura em base64
  timestamp: string; // Data/hora da assinatura
  hash: string; // Hash SHA-256 da assinatura
  dispositivo: string; // 'mobile' | 'desktop' | 'tablet'
  navegador: string; // Nome do navegador
  ip?: string; // IP do usuário (se disponível)
  latitude?: number; // Geolocalização
  longitude?: number;
  validadoPor: 'senha' | 'pin' | 'biometria'; // Método de validação
  usuarioNome: string;
  usuarioEmail: string;
}

interface AssinaturaDigitalProps {
  usuarioNome: string;
  usuarioEmail: string;
  onAssinaturaConcluida: (dados: DadosAssinatura) => void;
  onCancelar: () => void;
  titulo?: string;
  descricao?: string;
  requerSenha?: boolean; // Exigir validação por senha
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function AssinaturaDigital({
  usuarioNome,
  usuarioEmail,
  onAssinaturaConcluida,
  onCancelar,
  titulo = 'Assinatura Digital',
  descricao = 'Assine digitalmente para confirmar a veracidade das informações',
  requerSenha = true
}: AssinaturaDigitalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [senha, setSenha] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuração do canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar tamanho do canvas
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 200; // Altura fixa
    }

    // Configurar estilo do desenho
    ctx.strokeStyle = '#1f2937'; // Cor da caneta (cinza escuro)
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Preencher fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Adicionar linha guia
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, canvas.height / 2);
    ctx.lineTo(canvas.width - 20, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Resetar configurações
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
  }, []);

  // Detectar tipo de dispositivo
  const detectarDispositivo = (): string => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  };

  // Detectar navegador
  const detectarNavegador = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Desconhecido';
  };

  // Obter coordenadas do ponto (mouse ou touch)
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  // Iniciar desenho
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  // Desenhar
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Parar desenho
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Limpar assinatura
  const limparAssinatura = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preencher fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redesenhar linha guia
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, canvas.height / 2);
    ctx.lineTo(canvas.width - 20, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Resetar configurações
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;

    setHasSignature(false);
    setSenha('');
    setValidationError('');
  };

  // Gerar hash SHA-256
  const gerarHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  // Obter geolocalização
  const obterGeolocalizacao = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  };

  // Confirmar assinatura (mostrar modal de validação)
  const handleConfirmar = () => {
    if (!hasSignature) {
      alert('Por favor, assine no campo acima');
      return;
    }

    if (requerSenha) {
      setShowValidation(true);
    } else {
      processarAssinatura();
    }
  };

  // Processar e enviar assinatura
  const processarAssinatura = async () => {
    if (requerSenha && !senha) {
      setValidationError('Por favor, digite sua senha');
      return;
    }

    setIsProcessing(true);
    setValidationError('');

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas não encontrado');

      // Converter canvas para base64
      const assinaturaBase64 = canvas.toDataURL('image/png');

      // Gerar timestamp
      const timestamp = new Date().toISOString();

      // Gerar hash
      const hash = await gerarHash(`${assinaturaBase64}${timestamp}${usuarioEmail}`);

      // Obter geolocalização
      const geolocalizacao = await obterGeolocalizacao();

      // Montar dados da assinatura
      const dadosAssinatura: DadosAssinatura = {
        assinaturaBase64,
        timestamp,
        hash,
        dispositivo: detectarDispositivo(),
        navegador: detectarNavegador(),
        latitude: geolocalizacao?.latitude,
        longitude: geolocalizacao?.longitude,
        validadoPor: requerSenha ? 'senha' : 'pin',
        usuarioNome,
        usuarioEmail
      };

      console.log('✅ [AssinaturaDigital] Assinatura processada:', {
        hash: dadosAssinatura.hash,
        timestamp: dadosAssinatura.timestamp,
        dispositivo: dadosAssinatura.dispositivo
      });

      // Callback com os dados
      onAssinaturaConcluida(dadosAssinatura);

    } catch (error) {
      console.error('❌ [AssinaturaDigital] Erro ao processar assinatura:', error);
      setValidationError('Erro ao processar assinatura. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">{titulo}</h2>
                <p className="text-blue-100 text-sm mt-1">{descricao}</p>
              </div>
            </div>
            <button
              onClick={onCancelar}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Informações do Responsável */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Responsável pela Assinatura:
                </p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><span className="font-semibold">Nome:</span> {usuarioNome}</p>
                  <p><span className="font-semibold">Email:</span> {usuarioEmail}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Esta assinatura terá validade jurídica e não poderá ser alterada após confirmação.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas de Assinatura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PenTool className="h-4 w-4 inline mr-1" />
              Assine no campo abaixo:
            </label>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
              {detectarDispositivo() === 'mobile' ? (
                <>
                  <Smartphone className="h-4 w-4" />
                  Use o dedo para assinar
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Use o mouse para assinar
                </>
              )}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={limparAssinatura}
              disabled={!hasSignature}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${hasSignature
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <RotateCcw className="h-4 w-4" />
              Limpar
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onCancelar}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={!hasSignature}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium
                  ${hasSignature
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Check className="h-5 w-5" />
                Confirmar Assinatura
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Validação por Senha */}
        {showValidation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 rounded-lg">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Validação de Identidade
                </h3>
                <p className="text-sm text-gray-600">
                  Digite sua senha para confirmar a autenticidade da assinatura
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && processarAssinatura()}
                    autoFocus
                  />
                </div>

                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {validationError}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowValidation(false);
                      setSenha('');
                      setValidationError('');
                    }}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={processarAssinatura}
                    disabled={!senha || isProcessing}
                    className={`
                      flex-1 px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2
                      ${senha && !isProcessing
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Validar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
