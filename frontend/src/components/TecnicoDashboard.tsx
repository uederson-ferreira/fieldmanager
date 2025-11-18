// ===================================================================
// DASHBOARD TÉCNICO - ECOFIELD SYSTEM
// Localização: src/components/TecnicoDashboard.tsx
// ===================================================================

import React from 'react';
import { DashboardProvider } from './dashboard/DashboardProvider';

import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardNavigation from "./dashboard/DashboardNavigation";
import DashboardMainContent from "./dashboard/DashboardMainContent";
import type { UserData } from "../types/entities";

interface TecnicoDashboardProps {
  user: UserData;
  onLogout: () => void;
  loginInfo: {
    method: "supabase" | "demo" | null;
    isSupabase: boolean;
    isDemo: boolean;
    source: string;
  };
}

const TecnicoDashboard: React.FC<TecnicoDashboardProps> = ({
  user,
  onLogout,
  loginInfo,
}) => {
  return (
    <DashboardProvider
      user={user}
      onLogout={onLogout}
      loginInfo={loginInfo}
    >
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 overflow-x-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Navegação Lateral */}
        <DashboardNavigation />

        {/* Conteúdo Principal */}
        <div className="lg:pl-0">
          <DashboardMainContent user={user} />
        </div>
      </div>
    </DashboardProvider>
  );
};

export default TecnicoDashboard;
