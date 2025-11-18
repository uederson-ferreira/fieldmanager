// ===================================================================
// CRUD USUÁRIOS MIGRADO - ECOFIELD SYSTEM
// ===================================================================

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Save,
  X,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { usuariosAPI } from "../../lib/usuariosAPI";
import { perfisAPI } from "../../lib/perfisAPI";
import { getAuthToken } from "../../utils/authUtils";
import { validatePasswordStrength } from "../../utils/authUtils";

import type { UserData } from "../../types/entities";

const CrudUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UserData | null>(null);
  const [filtro, setFiltro] = useState("");
  const [perfilFiltro, setPerfilFiltro] = useState("");

  // Estado do formulário
  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    matricula: "",
    telefone: "",
    perfil: "",
    ativo: true,
    senha: "",
    showPassword: false
  });

  // Verificar autenticação
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      console.error("❌ [CRUD USUARIOS] Usuário não autenticado");
      alert("Você precisa estar logado para acessar esta página");
      window.location.href = "/";
      return;
    }
    console.log("✅ [CRUD USUARIOS] Usuário autenticado");
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      console.log("🔄 [CRUD USUARIOS] Iniciando carregamento de dados...");
      setCarregando(true);

      // Verificar token novamente
      const token = getAuthToken();
      if (!token) {
        console.error("❌ [CRUD USUARIOS] Token não encontrado durante carregamento");
        setCarregando(false);
        return;
      }

      // Carregar perfis primeiro para mapeamento
      console.log("📋 [CRUD USUARIOS] Carregando perfis...");
      const { perfis: perfisData, error: perfisError } = await perfisAPI.getPerfis();
      if (perfisError) {
        console.error("❌ Erro ao carregar perfis:", perfisError);
      } else {
        console.log("✅ [CRUD USUARIOS] Perfis carregados:", perfisData?.length || 0);
        setPerfis(perfisData || []);
      }

      // Criar mapeamento de ID para nome do perfil
      const mapeamentoPerfis = new Map();
      if (perfisData) {
        perfisData.forEach(perfil => {
          mapeamentoPerfis.set(perfil.id, perfil.nome);
        });
      }

      // Carregar usuários usando nova API (MIGRADO)
      console.log("👥 [CRUD USUARIOS] Carregando usuários...");
      try {
        const { usuarios, error } = await usuariosAPI.getUsuariosAtivos();
        if (error) {
          console.error("❌ Erro ao carregar usuários:", error);
          setUsuarios([]);
        } else {
          console.log("✅ [CRUD USUARIOS] Usuários carregados:", usuarios?.length || 0);
          // Converter Usuario para UserData
          const usuariosConvertidos = usuarios.map(usuario => ({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            matricula: usuario.matricula || '',
            perfil: usuario.perfis?.nome || mapeamentoPerfis.get(usuario.perfil_id) || usuario.perfil_id,
            funcao: usuario.perfis?.descricao || '',
            telefone: usuario.telefone || '',
            ativo: usuario.ativo,
            ultimo_login: usuario.ultimo_login || null,
            created_at: usuario.created_at,
            updated_at: usuario.updated_at
          }));
          setUsuarios(usuariosConvertidos);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar usuários:", error);
        setUsuarios([]);
      }
    } catch (error) {
      console.error("💥 Erro inesperado ao carregar dados:", error);
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  };

  // Filtrar usuários (MIGRADO: usar perfil direto)
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchFiltro =
      filtro === "" ||
      usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filtro.toLowerCase()) ||
      usuario.matricula.toLowerCase().includes(filtro.toLowerCase());

    const matchPerfil =
      perfilFiltro === "" || usuario.perfil === perfilFiltro;

    return matchFiltro && matchPerfil;
  });

  // Abrir modal para novo usuário
  const novoUsuario = () => {
    setUsuarioEditando(null);
    setFormulario({
      nome: "",
      email: "",
      matricula: "",
      telefone: "",
      perfil: perfis.length > 0 ? perfis[0].nome : "",
      ativo: true,
      senha: "",
      showPassword: false
    });
    setModalAberto(true);
  };

  // Abrir modal para editar usuário
  const editarUsuario = (usuario: UserData) => {
    setUsuarioEditando(usuario);
    setFormulario({
      nome: usuario.nome,
      email: usuario.email,
      matricula: usuario.matricula,
      telefone: usuario.telefone || "",
      perfil: usuario.perfil, // Já convertido para o nome do perfil
      ativo: usuario.ativo,
      senha: "",
      showPassword: false
    });
    setModalAberto(true);
  };

  // Salvar usuário
  const salvarUsuario = async () => {
    try {
      if (
        !formulario.nome ||
        !formulario.email ||
        !formulario.matricula ||
        !formulario.perfil
      ) {
        alert("Preencha todos os campos obrigatórios");
        return;
      }

      // Obter ID do perfil pelo nome
      const perfilEncontrado = perfis.find(p => p.nome === formulario.perfil);
      if (!perfilEncontrado) {
        alert("Perfil não encontrado");
        return;
      }

      if (usuarioEditando) {
        // Atualizar usuário existente (MIGRADO)
        try {
          await usuariosAPI.atualizarUsuario(usuarioEditando.id, {
            nome: formulario.nome,
            matricula: formulario.matricula,
            telefone: formulario.telefone,
            perfil_id: perfilEncontrado.id,
            ativo: formulario.ativo,
          });
        } catch (error) {
          console.error("❌ Erro ao atualizar usuário:", error);
          alert(`Erro ao atualizar usuário: ${error}`);
          return;
        }
      } else {
        // Criar novo usuário (MIGRADO)
        const senhaUsuario = formulario.senha || "temp123";

        try {
          await usuariosAPI.criarUsuario({
            nome: formulario.nome,
            email: formulario.email,
            matricula: formulario.matricula,
            telefone: formulario.telefone,
            perfil_id: perfilEncontrado.id,
            senha: senhaUsuario,
          });
        } catch (error) {
          console.error("❌ Erro ao criar usuário:", error);
          alert(`Erro ao criar usuário: ${error}`);
          return;
        }
      }

      alert(
        usuarioEditando
          ? "Usuário atualizado com sucesso!"
          : "Usuário criado com sucesso!"
      );
      setModalAberto(false);
      carregarDados();
    } catch (error) {
      console.error("💥 Erro inesperado ao salvar usuário:", error);
      alert("Erro interno do servidor");
    }
  };

  // Deletar usuário (MIGRADO)
  const deletarUsuario = async (usuario: UserData) => {
    if (!confirm(`Deseja realmente deletar o usuário ${usuario.nome}?`)) {
      return;
    }

    try {
      console.log("🗑️ Deletando usuário:", usuario.email);

      try {
        await usuariosAPI.deletarUsuario(usuario.id);
      } catch (error) {
        console.error("❌ Erro ao deletar usuário:", error);
        alert(`Erro ao deletar usuário: ${error}`);
        return;
      }

      console.log("🎉 Usuário deletado com sucesso!");
      alert("Usuário deletado com sucesso!");
      carregarDados();
    } catch (error) {
      console.error("💥 Erro inesperado ao deletar usuário:", error);
      alert("Erro interno do servidor");
    }
  };

  if (carregando) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Gerenciar Usuários
              </h2>
              <p className="text-gray-600">
                Cadastre e gerencie usuários do sistema
              </p>
            </div>
          </div>
          <button
            onClick={novoUsuario}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Usuário</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={perfilFiltro}
              onChange={(e) => setPerfilFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os perfis</option>
              {perfis.map((perfil) => (
                <option key={perfil.id} value={perfil.nome}>
                  {perfil.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600 self-center">
            {usuariosFiltrados.length} usuário(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mat: {usuario.matricula}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      {usuario.email}
                    </div>
                    {usuario.telefone && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        {usuario.telefone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {usuario.perfil || "Sem perfil"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {usuario.ativo ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => editarUsuario(usuario)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletarUsuario(usuario)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usuariosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum usuário encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtro || perfilFiltro
                ? "Tente ajustar os filtros."
                : "Comece criando um novo usuário."}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {usuarioEditando ? "Editar Usuário" : "Novo Usuário"}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(e) =>
                    setFormulario((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formulario.email}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matrícula *
                </label>
                <input
                  type="text"
                  value={formulario.matricula}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      matricula: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MAT001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formulario.telefone}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      telefone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil *
                </label>
                <select
                  value={formulario.perfil}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      perfil: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um perfil</option>
                  {perfis.map((perfil) => (
                    <option key={perfil.id} value={perfil.nome}>
                      {perfil.nome}
                    </option>
                  ))}
                </select>
              </div>

              {!usuarioEditando && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Inicial
                  </label>
                  <div className="relative">
                    <input
                      type={formulario.showPassword ? "text" : "password"}
                      value={formulario.senha}
                      onChange={(e) =>
                        setFormulario((prev) => ({
                          ...prev,
                          senha: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Deixe vazio para usar 'temp123'"
                    />
                    <button
                      type="button"
                      onClick={() => setFormulario(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                      {formulario.showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Indicador de Força da Senha */}
                  {formulario.senha && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Força da senha:</span>
                        <span className={`font-medium ${
                          formulario.senha.length >= 8 && 
                          /[A-Z]/.test(formulario.senha) && 
                          /[a-z]/.test(formulario.senha) && 
                          /\d/.test(formulario.senha) && 
                          /[@#$%^&*!]/.test(formulario.senha)
                            ? 'text-green-600'
                            : formulario.senha.length >= 6
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {formulario.senha.length >= 8 && 
                           /[A-Z]/.test(formulario.senha) && 
                           /[a-z]/.test(formulario.senha) && 
                           /\d/.test(formulario.senha) && 
                           /[@#$%^&*!]/.test(formulario.senha)
                            ? 'Forte'
                            : formulario.senha.length >= 6
                            ? 'Média'
                            : 'Fraca'
                          }
                        </span>
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            formulario.senha.length >= 8 && 
                            /[A-Z]/.test(formulario.senha) && 
                            /[a-z]/.test(formulario.senha) && 
                            /\d/.test(formulario.senha) && 
                            /[@#$%^&*!]/.test(formulario.senha)
                              ? 'bg-green-500 w-full'
                              : formulario.senha.length >= 6
                              ? 'bg-yellow-500 w-2/3'
                              : 'bg-red-500 w-1/3'
                          }`}
                        ></div>
                      </div>
                      
                      {/* Requisitos */}
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <div className={`flex items-center ${formulario.senha.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                          {formulario.senha.length >= 8 ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Mínimo 8 caracteres
                        </div>
                        <div className={`flex items-center ${/[A-Z]/.test(formulario.senha) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/[A-Z]/.test(formulario.senha) ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Pelo menos uma letra maiúscula
                        </div>
                        <div className={`flex items-center ${/[a-z]/.test(formulario.senha) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/[a-z]/.test(formulario.senha) ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Pelo menos uma letra minúscula
                        </div>
                        <div className={`flex items-center ${/\d/.test(formulario.senha) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/\d/.test(formulario.senha) ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Pelo menos um número
                        </div>
                        <div className={`flex items-center ${/[@#$%^&*!]/.test(formulario.senha) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/[@#$%^&*!]/.test(formulario.senha) ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Pelo menos um símbolo (@#$%^&*!)
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Aviso de Segurança */}
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-md p-2">
                    <AlertCircle className="h-3 w-3 inline-block mr-1 text-blue-500" />
                    <strong>Dica:</strong> Use uma senha forte para maior segurança. 
                    O usuário poderá alterá-la no primeiro login.
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formulario.ativo}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      ativo: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Usuário ativo
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarUsuario}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudUsuarios;
