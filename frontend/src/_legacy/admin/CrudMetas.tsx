// ===================================================================
// CONTAINER PRINCIPAL - CRUD METAS - ECOFIELD SYSTEM
// Localização: src/components/admin/CrudMetas.tsx
// Módulo: Container principal que orquestra componentes modulares
// ===================================================================

import React from 'react';
import { CrudMetasContainer } from './CrudMetasContainer';
import type { UserData } from '../../types/entities';

interface CrudMetasProps {
  user: UserData;
}

const CrudMetas: React.FC<CrudMetasProps> = ({ user }) => {
  return <CrudMetasContainer user={user} />;
};

export default CrudMetas; 