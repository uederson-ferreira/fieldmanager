// ===================================================================
// COMPONENTE EXIBIÇÃO DE FOTOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/TermoPhotoDisplay.tsx
// Módulo: Exibição de fotos com preview e exclusão
// ===================================================================

import React from 'react';
import { X } from 'lucide-react';
import type { ProcessedPhotoData } from '../../utils/TermoPhotoProcessor';

interface TermoPhotoDisplayProps {
  fotos: ProcessedPhotoData[];
  categoria: string;
  onRemoverFoto: (categoria: string, index: number) => void;
  onAdicionarFoto: (categoria: string) => Promise<void>;
}

export const TermoPhotoDisplay: React.FC<TermoPhotoDisplayProps> = ({
  fotos,
  categoria,
  onRemoverFoto,
  onAdicionarFoto
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fotos
      </label>
      
      {/* Botão Adicionar Foto */}
      <button
        type="button"
        onClick={() => onAdicionarFoto(categoria)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
      >
        📷 Adicionar Foto
      </button>

      {/* Área de Fotos */}
      {fotos.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-2">📷</div>
          <p className="text-gray-500 text-sm">Nenhuma foto adicionada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {fotos.map((foto, index) => (
            <div key={index} className="relative group">
              {/* Imagem */}
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={foto.preview}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                
                {/* Overlay com informações */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
                  {/* Tamanho do arquivo */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {formatFileSize(foto.tamanho)}
                  </div>
                  
                  {/* Coordenadas GPS (se disponível) */}
                  {foto.latitude && foto.longitude && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      📍 GPS
                    </div>
                  )}
                </div>
                
                {/* Botão de Exclusão */}
                <button
                  type="button"
                  onClick={() => onRemoverFoto(categoria, index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 