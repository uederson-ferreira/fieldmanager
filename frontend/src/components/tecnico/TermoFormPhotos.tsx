// ===================================================================
// COMPONENTE FOTOS DO FORMULÁRIO DE TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/TermoFormPhotos.tsx
// Módulo: Gestão de fotos do formulário de termos
// ===================================================================

import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import type { ProcessedPhotoData } from '../../utils/TermoPhotoProcessor';

interface TermoFormPhotosProps {
  fotos: { [categoria: string]: ProcessedPhotoData[] };
  adicionarFoto: (categoria: string) => Promise<void>;
  removerFoto: (categoria: string, index: number) => void;
  obterLocalizacaoGPS: (automatico?: boolean) => Promise<void>;
  gpsCarregando: boolean;
  gpsObtidoAutomaticamente: boolean;
  dadosFormulario: {
    latitude?: number;
    longitude?: number;
    precisao_gps?: number;
  };
}

export const TermoFormPhotos: React.FC<TermoFormPhotosProps> = ({
  fotos,
  adicionarFoto,
  removerFoto,
  obterLocalizacaoGPS,
  gpsCarregando,
  gpsObtidoAutomaticamente,
  dadosFormulario
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
        11. Localização GPS e Fotos Gerais
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GPS */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <h4 className="text-md font-medium text-gray-900">Coordenadas GPS</h4>
            <button
              type="button"
              onClick={() => obterLocalizacaoGPS(false)}
              disabled={gpsCarregando}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {gpsCarregando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Obtendo...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Obter GPS</span>
                </>
              )}
            </button>
          </div>

          {dadosFormulario.latitude && dadosFormulario.longitude && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              {gpsObtidoAutomaticamente && (
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-green-700 font-medium">GPS obtido automaticamente</span>
                </div>
              )}
              <div className="text-sm text-green-800">
                <p><strong>Latitude:</strong> {dadosFormulario.latitude.toFixed(6)}</p>
                <p><strong>Longitude:</strong> {dadosFormulario.longitude.toFixed(6)}</p>
                <p><strong>Precisão:</strong> ±{dadosFormulario.precisao_gps?.toFixed(0)}m</p>
              </div>
            </div>
          )}
        </div>

        {/* Fotos Gerais */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <h4 className="text-md font-medium text-gray-900">Fotos Gerais</h4>
            <button
              type="button"
              onClick={() => adicionarFoto('geral')}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Camera className="h-4 w-4" />
              <span>Adicionar Fotos</span>
            </button>
          </div>

          {fotos.geral?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {fotos.geral.map((foto, index) => (
                <div key={index} className="relative">
                  <img 
                    src={foto.base64Data || foto.preview || ''} 
                    alt={`Foto geral ${index + 1}`}
                    className="w-full h-20 sm:h-24 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {(foto.tamanho / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <button
                    onClick={() => removerFoto('geral', index)}
                    className="absolute top-0 right-0 w-1 h-1 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                    style={{ fontSize: '10px', lineHeight: '1' }}
                    title="Remover foto"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Camera className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma foto adicionada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 