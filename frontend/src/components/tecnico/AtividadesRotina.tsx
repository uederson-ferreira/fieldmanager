// ===================================================================
// CONTAINER PRINCIPAL - ATIVIDADES DE ROTINA - ECOFIELD SYSTEM
// Localização: src/components/tecnico/AtividadesRotina.tsx
// Módulo: Container principal que orquestra componentes modulares
// ===================================================================

import React from 'react';
import AtividadesRotinaContainer from './AtividadesRotinaContainer';
import type { UserData } from '../../types/entities';

interface AtividadesRotinaProps {
  user: UserData;
  onBack: () => void;
}

const AtividadesRotina: React.FC<AtividadesRotinaProps> = ({ user, onBack }) => {
  return <AtividadesRotinaContainer user={user} onBack={onBack} />;
};

export default AtividadesRotina; 