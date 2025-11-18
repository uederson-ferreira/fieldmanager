// ===================================================================
// CONTAINER PRINCIPAL - TERMO FORM V2 - ECOFIELD SYSTEM
// Localização: src/components/tecnico/TermoFormV2.tsx
// Módulo: Container principal que orquestra componentes modulares
// ===================================================================

import React from 'react';
import { TermoFormContainer } from './TermoFormContainer';
import type { TermoAmbiental } from '../../types/termos';

interface TermoFormV2Props {
  onSalvar?: () => void;
  onCancelar?: () => void;
  modoEdicao?: boolean;
  termoParaEditar?: TermoAmbiental;
}

const TermoFormV2: React.FC<TermoFormV2Props> = ({ 
  onSalvar, 
  onCancelar, 
  modoEdicao = false, 
  termoParaEditar 
}) => {
  return (
    <TermoFormContainer
      modoEdicao={modoEdicao}
      termoParaEditar={termoParaEditar}
      onSalvar={onSalvar}
      onCancelar={onCancelar}
    />
  );
};

export default TermoFormV2; 