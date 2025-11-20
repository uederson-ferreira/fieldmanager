// ===================================================================
// COMPONENTE ESPECIALIZADO PARA UPLOAD DE FOTOS - ECOFIELD SYSTEM
// Localização: src/components/lv/components/LVPhotoUpload.tsx
// ===================================================================

import React from 'react';
import { Camera, Eye, Download, Trash2 } from 'lucide-react';
import type { LVFoto } from '../types/lv';

interface LVPhotoUploadProps {
  itemId: number;
  fotos: LVFoto[];
  onCapturarFoto: (itemId: number) => void;
  onRemoverFoto: (itemId: number, fotoIndex: number) => void;
  onVisualizarFoto: (foto: LVFoto) => void;
  onDownloadFoto: (foto: LVFoto) => void;
  disabled?: boolean;
}

const LVPhotoUpload: React.FC<LVPhotoUploadProps> = ({
  itemId,
  fotos,
  onCapturarFoto,
  onRemoverFoto,
  onVisualizarFoto,
  onDownloadFoto,
  disabled = false,
}) => {
  const getFotoUrl = (foto: LVFoto): string => {
    if (foto.urlOriginal) return foto.urlOriginal;
    if (foto.base64Data) return foto.base64Data;
    if (foto.arquivo) return URL.createObjectURL(foto.arquivo);
    if (foto.url_arquivo) return foto.url_arquivo;
    return '';
  };

  const getFotoAlt = (foto: LVFoto, index: number): string => {
    if (foto.arquivo) return `Foto ${index + 1} - ${foto.arquivo.name}`;
    return `Foto ${index + 1}`;
  };

  return (
    <div className="space-y-4">
      {/* Botão de Captura */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onCapturarFoto(itemId)}
          disabled={disabled}
          className={`flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Adicionar Foto</span>
        </button>

        {fotos.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {fotos.length} foto(s)
            </span>
          </div>
        )}
      </div>

      {/* Grid de Fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map((foto, index) => (
            <div key={index} className="relative group">
              {/* Imagem */}
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={getFotoUrl(foto)}
                  alt={getFotoAlt(foto, index)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyOEMyOC40MTggMjggMzIgMjQuNDE4IDMyIDIwQzMyIDE1LjU4MiAyOC40MTggMTIgMjQgMTJDMjAuNTgyIDEyIDE3IDE1LjU4MiAxNyAyMEMxNyAyNC40MTggMjAuNTgyIDI4IDI0IDI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              </div>

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onVisualizarFoto(foto)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onDownloadFoto(foto)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onRemoverFoto(itemId, index)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Badge de número */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
              </div>

              {/* Indicador de tipo */}
              <div className="absolute top-2 right-2">
                {foto.arquivo && (
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Novo
                  </div>
                )}
                {foto.url_arquivo && !foto.arquivo && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Salvo
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem quando não há fotos */}
      {fotos.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Nenhuma foto adicionada
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Clique em "Adicionar Foto" para capturar
          </p>
        </div>
      )}
    </div>
  );
};

export default LVPhotoUpload; 