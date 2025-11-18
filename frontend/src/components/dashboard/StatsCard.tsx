// ===================================================================
// STATS CARD - ECOFIELD SYSTEM
// Localização: src/components/dashboard/StatsCard.tsx
// ===================================================================

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  textColor?: string;
  loading?: boolean;
  progressPercent?: number;
  progressColor?: string;
  statusBadge?: string | null | undefined;
}

const StatsCard: React.FC<StatsCardProps> = memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-600',
  iconColor = 'text-white',
  textColor = 'text-gray-900',
  loading = false,
  progressPercent,
  progressColor,
  statusBadge
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className={`w-10 h-10 rounded-lg ${iconBgColor} ${iconColor} flex items-center justify-center`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${textColor} mb-2 leading-tight`}>{title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-2xl font-bold text-neutral-900 leading-tight">{value}</p>
            {statusBadge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 capitalize">
                {statusBadge.replace('_', ' ')}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-neutral-500 leading-tight">{subtitle}</p>
          )}
          {typeof progressPercent === 'number' && !Number.isNaN(progressPercent) && (
            <div className="mt-3">
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`${progressColor || iconBgColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} ${iconColor} flex items-center justify-center flex-shrink-0 ml-3`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

// Componente para seção de estatísticas
interface StatsSectionProps {
  title: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  textColor: string;
  children: React.ReactNode;
  className?: string;
  layoutClassName?: string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  title,
  icon: Icon,
  iconBgColor,
  iconColor,
  textColor,
  children,
  className = '',
  layoutClassName = 'grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6',
}) => {
  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow-sm border overflow-x-hidden ${className}`}>
      <h3 className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center ${textColor}`}>
        <div className={`w-8 h-8 mr-3 rounded-lg flex items-center justify-center shadow-sm ${iconBgColor} flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className="leading-tight">{title}</span>
      </h3>
      <div className={layoutClassName}>
        {children}
      </div>
    </div>
  );
};

export default StatsCard; 