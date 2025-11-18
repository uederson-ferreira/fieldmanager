// ===================================================================
// COMPONENTE DE DEMONSTRAÇÃO - DESIGN SYSTEM ECOFIELD
// Localização: src/components/design/DesignSystem.tsx
// ===================================================================

import React from 'react';
import { Check, Star, Heart, Zap, Shield, Leaf } from 'lucide-react';

const DesignSystemDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gradient">
            EcoField Design System
          </h1>
          <p className="text-xl text-neutral-600">
            Nova identidade visual - Sustentabilidade + Tecnologia
          </p>
        </div>

        {/* Paleta de Cores */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-800">🎨 Paleta de Cores</h2>
          
          {/* Cores Primárias */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-700">Verde Natural</h3>
              <div className="space-y-1">
                <div className="h-12 bg-primary-300 rounded-lg flex items-center justify-center text-white text-sm">300</div>
                <div className="h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white text-sm">500</div>
                <div className="h-12 bg-primary-700 rounded-lg flex items-center justify-center text-white text-sm">700</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-700">Azul Tecnológico</h3>
              <div className="space-y-1">
                <div className="h-12 bg-secondary-300 rounded-lg flex items-center justify-center text-white text-sm">300</div>
                <div className="h-12 bg-secondary-500 rounded-lg flex items-center justify-center text-white text-sm">500</div>
                <div className="h-12 bg-secondary-700 rounded-lg flex items-center justify-center text-white text-sm">700</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-700">Estados</h3>
              <div className="space-y-1">
                <div className="h-12 bg-success-500 rounded-lg flex items-center justify-center text-white text-sm">Sucesso</div>
                <div className="h-12 bg-warning-500 rounded-lg flex items-center justify-center text-white text-sm">Aviso</div>
                <div className="h-12 bg-error-500 rounded-lg flex items-center justify-center text-white text-sm">Erro</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-700">Natureza</h3>
              <div className="space-y-1">
                <div className="h-12 bg-nature-forest rounded-lg flex items-center justify-center text-white text-sm">Floresta</div>
                <div className="h-12 bg-nature-ocean rounded-lg flex items-center justify-center text-white text-sm">Oceano</div>
                <div className="h-12 bg-nature-sun rounded-lg flex items-center justify-center text-white text-sm">Sol</div>
              </div>
            </div>
          </div>
        </section>

        {/* Gradientes */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-800">🌈 Gradientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 gradient-primary rounded-xl flex items-center justify-center text-white font-semibold">
              Gradiente Primário
            </div>
            <div className="h-24 gradient-secondary rounded-xl flex items-center justify-center text-white font-semibold">
              Gradiente Secundário
            </div>
            <div className="h-24 gradient-nature rounded-xl flex items-center justify-center text-white font-semibold">
              Gradiente Natureza
            </div>
          </div>
        </section>

        {/* Botões */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-800">🔘 Botões</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Primário
            </button>
            <button className="btn-secondary flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Secundário
            </button>
            <button className="bg-success-500 hover:bg-success-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-soft hover:shadow-medium flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Sucesso
            </button>
            <button className="bg-warning-500 hover:bg-warning-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-soft hover:shadow-medium flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Aviso
            </button>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-800">📄 Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-primary-500 mr-3" />
                <h3 className="text-lg font-semibold text-neutral-800">Segurança</h3>
              </div>
              <p className="text-neutral-600">
                Sistema robusto com autenticação segura e controle de acesso.
              </p>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-4">
                <Leaf className="w-8 h-8 text-primary-500 mr-3" />
                <h3 className="text-lg font-semibold text-neutral-800">Sustentabilidade</h3>
              </div>
              <p className="text-neutral-600">
                Foco em práticas ambientais responsáveis e gestão eficiente.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <Zap className="w-8 h-8 text-secondary-500 mr-3" />
                <h3 className="text-lg font-semibold text-neutral-800">Performance</h3>
              </div>
              <p className="text-neutral-600">
                Interface rápida e responsiva para melhor experiência do usuário.
              </p>
            </div>
          </div>
        </section>

        {/* Formulários */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-800">📝 Formulários</h2>
          <div className="card max-w-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Senha
                </label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                />
              </div>
              <button className="btn-primary w-full">
                Entrar no Sistema
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DesignSystemDemo; 