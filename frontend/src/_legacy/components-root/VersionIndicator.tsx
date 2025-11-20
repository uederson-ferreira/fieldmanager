import React from 'react';
import { Info, RefreshCw } from 'lucide-react';

interface VersionIndicatorProps {
  version: string;
  buildDate?: string;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  showBuildDate?: boolean;
  onCheckUpdate?: () => void;
  className?: string;
}

export const VersionIndicator: React.FC<VersionIndicatorProps> = ({
  version,
  buildDate,
  position = 'bottom-right',
  showBuildDate = false,
  onCheckUpdate,
  className = ''
}) => {
  // Determinar posição baseada na prop
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  // Formatar data de build
  const formatBuildDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className={`
      fixed ${getPositionClasses()} z-30
      bg-white bg-opacity-95 backdrop-blur-sm
      border border-gray-200 rounded-lg shadow-lg
      px-3 py-2 text-xs text-gray-600
      hover:bg-opacity-100 transition-all duration-200
      group cursor-pointer
      ${className}
    `}>
      <div className="flex items-center space-x-2">
        <Info className="h-3 w-3 text-gray-400 group-hover:text-green-600 transition-colors" />
        
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="font-medium text-gray-700">v{version}</span>
            {onCheckUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckUpdate();
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Verificar atualizações"
              >
                <RefreshCw className="h-3 w-3 text-gray-400 hover:text-green-600" />
              </button>
            )}
          </div>
          
          {showBuildDate && buildDate && (
            <span className="text-gray-500 text-[10px]">
              Build: {formatBuildDate(buildDate)}
            </span>
          )}
        </div>
      </div>
      
      {/* Tooltip informativo */}
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Versão atual do EcoField
        <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
};

export default VersionIndicator; 