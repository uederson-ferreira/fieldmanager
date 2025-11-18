import React from 'react';
import { Share, Home, X } from 'lucide-react';

interface InstallGuideIOSProps {
  onClose: () => void;
}

const InstallGuideIOS: React.FC<InstallGuideIOSProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Como Instalar no iPhone
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Passo 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Toque no botão Compartilhar
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                No Safari, toque no ícone de compartilhar (caixa com seta para cima) na barra inferior
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 flex items-center justify-center">
                <Share className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Selecione "Adicionar à Tela de Início"
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Role para baixo no menu e toque em "Adicionar à Tela de Início"
              </p>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center gap-2">
                <Home className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Adicionar à Tela de Início
                </span>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Confirme
              </h3>
              <p className="text-sm text-gray-600">
                Toque em "Adicionar" no canto superior direito. O ícone do EcoField aparecerá na sua tela inicial!
              </p>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h4 className="font-semibold text-emerald-800 mb-2">
            ✨ Vantagens do App Instalado:
          </h4>
          <ul className="text-sm text-emerald-700 space-y-1">
            <li>⚡ Abre mais rápido</li>
            <li>📱 Funciona offline</li>
            <li>🚀 Acesso direto da tela inicial</li>
            <li>🔔 Notificações (em breve)</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Entendi!
        </button>
      </div>
    </div>
  );
};

export default InstallGuideIOS;
