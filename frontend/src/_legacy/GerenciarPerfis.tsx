// ===================================================================
// COMPONENTE PARA GERENCIAR PERFIS - ECOFIELD SYSTEM
// Localização: src/components/admin/GerenciarPerfis.tsx
// ===================================================================

import { useState, useEffect } from 'react';
// import useAuth from '../../hooks/useAuth';
import { usePermissoesUsuarios } from '../../hooks/usePerfis';
import { usersAPI } from '../../lib/usersAPI';
import { perfisOfflineAPI } from '../../lib/perfisOfflineAPI';
import type { UserData } from '../../types/entities';
import type { Perfil } from '../../lib/perfisOfflineAPI';

export default function GerenciarPerfis() {
  const { podeVer } = usePermissoesUsuarios();

  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UserData | null>(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState<string>('');

  // Verificar permissões
  if (!podeVer()) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Acesso Negado:</strong> Você não tem permissão para gerenciar perfis.
        </div>
      </div>
    );
  }

  // Carregar dados
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setErro(null);

        // Carregar usuários e perfis em paralelo
        const [usuariosResult, perfisResult] = await Promise.all([
          usersAPI.listUsers(),
          perfisOfflineAPI.getPerfis()
        ]);

        if (usuariosResult.error) {
          setErro(usuariosResult.error);
        } else {
          setUsuarios(usuariosResult.users);
        }

        if (perfisResult.error) {
          setErro(perfisResult.error);
        } else {
          setPerfis(perfisResult.perfis);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErro('Erro interno do servidor');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  // Aplicar perfil
  const aplicarPerfil = async () => {
    if (!usuarioSelecionado || !perfilSelecionado) {
      setErro('Selecione um usuário e um perfil');
      return;
    }

    try {
      setErro(null);

      const { error } = await perfisOfflineAPI.aplicarPerfil(usuarioSelecionado.id, perfilSelecionado);

      if (error) {
        setErro(error);
      } else {
        // Recarregar usuários para atualizar dados
        const { users } = await usersAPI.listUsers();
        if (users) {
          setUsuarios(users);
        }
        
        // Limpar seleção
        setUsuarioSelecionado(null);
        setPerfilSelecionado('');
        
        alert('Perfil aplicado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao aplicar perfil:', error);
      setErro('Erro interno do servidor');
    }
  };

  if (carregando) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> {erro}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Gerenciar Perfis de Usuários
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Usuários */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Usuários</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    usuarioSelecionado?.id === usuario.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUsuarioSelecionado(usuario)}
                >
                  <div className="font-medium text-gray-900">{usuario.nome}</div>
                  <div className="text-sm text-gray-600">{usuario.email}</div>
                  <div className="text-xs text-gray-500">
                    Perfil atual: {usuario.perfil || 'Não definido'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seleção de Perfil */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Aplicar Perfil</h2>
            
            {usuarioSelecionado ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900">
                    Usuário selecionado: {usuarioSelecionado.nome}
                  </div>
                  <div className="text-sm text-blue-700">
                    {usuarioSelecionado.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o perfil:
                  </label>
                  <select
                    value={perfilSelecionado}
                    onChange={(e) => setPerfilSelecionado(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione um perfil...</option>
                    {perfis.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} - {p.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={aplicarPerfil}
                  disabled={!perfilSelecionado}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Aplicar Perfil
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                Selecione um usuário para aplicar um perfil
              </div>
            )}
          </div>
        </div>

        {/* Lista de Perfis Disponíveis */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Perfis Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {perfis.map((p) => (
              <div key={p.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-900">{p.nome}</div>
                <div className="text-sm text-gray-600">{p.descricao}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Admin: {p.permissoes.admin ? '✅ Sim' : '❌ Não'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 