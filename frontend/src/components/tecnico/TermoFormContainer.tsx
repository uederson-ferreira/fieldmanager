// ===================================================================
// CONTAINER PRINCIPAL - FORMULÁRIO DE TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/TermoFormContainer.tsx
// Módulo: Container principal que orquestra componentes modulares
// ===================================================================

import React from 'react';
import { useTermoForm } from '../../hooks/useTermoForm';
import { TermoFormFields } from './TermoFormFields';
import { TermoFormPhotos } from './TermoFormPhotos';
import { TermoFormActions } from './TermoFormActions';
import type { TermoAmbiental } from '../../types/termos';

interface TermoFormContainerProps {
  onSalvar?: () => void;
  onCancelar?: () => void;
  modoEdicao?: boolean;
  termoParaEditar?: TermoAmbiental;
}

export const TermoFormContainer: React.FC<TermoFormContainerProps> = ({
  onSalvar,
  onCancelar,
  modoEdicao = false,
  termoParaEditar
}) => {
  const {
    // Estado
    dadosFormulario,
    fotos,
    numeroTermo,
    salvando,
    gpsCarregando,
    gpsObtidoAutomaticamente,
    categoriasLV,
    
    // Ações principais
    setDadosFormulario,
    salvarTermo,
    limparCampos,
    obterLocalizacaoGPS,
    
    // Ações de fotos
    adicionarFoto,
    removerFoto,
    
    // Ações de não conformidades
    adicionarNC,
    removerNC,
    atualizarNC,
    
    // Ações de correção
    adicionarAcao,
    removerAcao,
    atualizarAcao,
    
    // Ações de liberação
    atualizarLiberacao,
    
    // Utilitários
    preencherFormularioTeste
  } = useTermoForm({
    modoEdicao,
    termoParaEditar,
    onSalvar,
    onCancelar
  });

  return (
    <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        
        {/* Componente de Campos */}
        <TermoFormFields
          dadosFormulario={dadosFormulario}
          setDadosFormulario={setDadosFormulario}
          numeroTermo={numeroTermo}
          categoriasLV={categoriasLV}
          adicionarNC={adicionarNC}
          removerNC={removerNC}
          atualizarNC={atualizarNC}
          adicionarAcao={adicionarAcao}
          removerAcao={removerAcao}
          atualizarAcao={atualizarAcao}
          atualizarLiberacao={atualizarLiberacao}
          limparCampos={limparCampos}
          adicionarFoto={adicionarFoto}
          removerFoto={removerFoto}
          fotos={fotos}
          preencherFormularioTeste={preencherFormularioTeste}
        />



        {/* Componente de Fotos e GPS */}
        <TermoFormPhotos
          fotos={fotos}
          adicionarFoto={adicionarFoto}
          removerFoto={removerFoto}
          obterLocalizacaoGPS={obterLocalizacaoGPS}
          gpsCarregando={gpsCarregando}
          gpsObtidoAutomaticamente={gpsObtidoAutomaticamente}
          dadosFormulario={dadosFormulario}
        />

        {/* Componente de Ações */}
        <TermoFormActions
          salvando={salvando}
          salvarTermo={salvarTermo}
          onCancelar={onCancelar}
          fotos={fotos}
          dadosFormulario={dadosFormulario}
        />
      </div>
    </div>
  );
}; 