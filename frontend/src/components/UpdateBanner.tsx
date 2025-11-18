import React from 'react';
import { RefreshCw, X, Download } from 'lucide-react';

interface UpdateBannerProps {
  version: string;
  changelog?: string;
  onUpdate: () => void;
  onDismiss: () => void;
  forceUpdate?: boolean;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({
  version,
  changelog,
  onUpdate,
  onDismiss,
  forceUpdate = false
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">
                  🔄 Nova versão disponível!
                </span>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  v{version}
                </span>
              </div>
              {changelog && (
                <p className="text-xs text-green-100 mt-1 max-w-md truncate">
                  {changelog}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!forceUpdate && (
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={onUpdate}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${forceUpdate 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30 border border-white border-opacity-30'
                }
              `}
            >
              <Download className="h-4 w-4" />
              <span>
                {forceUpdate ? 'Atualizar Agora' : 'Atualizar'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBanner; 