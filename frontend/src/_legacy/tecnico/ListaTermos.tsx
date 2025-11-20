// ===================================================================
// CONTAINER PRINCIPAL - LISTA TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/ListaTermos.tsx
// Módulo: Container principal que orquestra componentes modulares
// ===================================================================

import React from 'react';
import { ListaTermosContainer } from './ListaTermosContainer';
import type { UserData } from '../../types/entities';

interface ListaTermosProps {
  user: UserData;
  onBack?: () => void;
}

const ListaTermos: React.FC<ListaTermosProps> = ({ user, onBack }) => {
  return <ListaTermosContainer user={user} onBack={onBack} />;
};

export default ListaTermos; 