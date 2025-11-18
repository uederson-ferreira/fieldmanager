# 🔐 NECESSIDADE: RECUPERAÇÃO DE SENHA - ECOFIELD SYSTEM

## 📋 **RESUMO EXECUTIVO**

**Status:** ❌ **NÃO IMPLEMENTADO**
**Prioridade:** 🔴 **ALTA** (Segurança e UX)
**Complexidade:** 🟡 **MÉDIA**
**Tempo Estimado:** 4-6 horas

---

## 🎯 **PROBLEMA IDENTIFICADO**

### **❌ Situação Atual:**

- Usuários não conseguem recuperar senhas esquecidas
- Não há fluxo de reset de senha
- Interface de login limitada
- Falta de funcionalidade essencial de segurança

### **✅ Necessidade:**

- Implementar recuperação de senha completa
- Integrar com Supabase Auth
- Criar interface amigável
- Garantir segurança do processo

---

## 🏗️ **ARQUITETURA NECESSÁRIA**

### **1️⃣ Frontend - Componentes**

#### **Login.tsx - Modificações:**

```typescript
// Adicionar link de recuperação
<div className="text-center mt-4">
  <button
    type="button"
    onClick={() => setShowForgotPassword(true)}
    className="text-sm text-green-600 hover:text-green-700 underline"
  >
    Esqueci minha senha
  </button>
</div>
```

#### **Novo Componente - ForgotPassword.tsx:**

```typescript
interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await authAPI.resetPassword(email);
      if (result.success) {
        setMessage('Email de recuperação enviado!');
        onSuccess();
      } else {
        setMessage(result.error || 'Erro ao enviar email');
      }
    } catch (error) {
      setMessage('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl px-8 pt-8 pb-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recuperar Senha</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="seu.email@empresa.com"
            required
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('enviado') 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Enviando...' : 'Enviar Email'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

#### **Novo Componente - ResetPassword.tsx:**

```typescript
interface ResetPasswordProps {
  token: string;
  onSuccess: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authAPI.updatePassword(token, password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl px-8 pt-8 pb-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nova Senha</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nova Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
};
```

### **2️⃣ Backend - API Functions**

#### **authAPI.ts - Novas Funções:**

```typescript
// Recuperação de senha
async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔐 [AUTH API] Iniciando recuperação de senha:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error('❌ [AUTH API] Erro na recuperação:', error.message);
      return { success: false, error: 'Erro ao enviar email de recuperação' };
    }

    console.log('✅ [AUTH API] Email de recuperação enviado');
    return { success: true };
  } catch (error) {
    console.error('💥 [AUTH API] Erro inesperado na recuperação:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
},

// Atualizar senha com token
async updatePassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔐 [AUTH API] Atualizando senha com token');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('❌ [AUTH API] Erro ao atualizar senha:', error.message);
      return { success: false, error: 'Erro ao alterar senha' };
    }

    console.log('✅ [AUTH API] Senha atualizada com sucesso');
    return { success: true };
  } catch (error) {
    console.error('💥 [AUTH API] Erro inesperado ao atualizar senha:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
```

### **3️⃣ Rotas - App.tsx**

#### **Novas Rotas:**

```typescript
// Adicionar rotas no App.tsx
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));

// Dentro do componente App
if (!isAuthenticated || !user) {
  // Verificar se é rota de reset de senha
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    return <ResetPassword token={token} onSuccess={() => window.location.href = '/'} />;
  }

  return (
    <Login 
      onLogin={login}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

---

## 🔧 **CONFIGURAÇÃO SUPABASE**

### **1️⃣ Email Templates**

#### **Template de Recuperação:**

```html
<h2>Recuperação de Senha - EcoField</h2>
<p>Olá,</p>
<p>Você solicitou a recuperação de senha para sua conta no EcoField.</p>
<p>Clique no link abaixo para definir uma nova senha:</p>
<a href="{{ .ConfirmationURL }}">Redefinir Senha</a>
<p>Este link expira em 1 hora.</p>
<p>Se você não solicitou esta recuperação, ignore este email.</p>
```

### **2️⃣ Configurações de URL**

#### **URLs de Redirecionamento:**

```bash
https://ecofield.vercel.app/reset-password
http://localhost:5173/reset-password
```

### **3️⃣ Configurações SMTP**

#### **Verificar Configurações:**

- ✅ SMTP habilitado no Supabase
- ✅ Email de remetente configurado
- ✅ Templates personalizados
- ✅ URLs de redirecionamento

---

## 📱 **FLUXO COMPLETO**

### **🔄 Fluxo de Recuperação:**

```bash
1. Usuário clica "Esqueci minha senha"
2. Digita email
3. Sistema valida email
4. Supabase envia email com link
5. Usuário clica no link
6. Redireciona para /reset-password?token=xxx
7. Usuário define nova senha
8. Sistema atualiza senha
9. Redireciona para login
10. Usuário faz login com nova senha
```

### **🎨 Interface Final:**

#### **Tela de Login Atualizada:**

```bash
┌─────────────────────────────────┐
│ EcoField System                │
│ Sistema de Gestão Ambiental    │
│                                 │
│ Email: [________________]      │
│ Senha: [________________] [👁️] │
│                                 │
│ [Entrar no Sistema]            │
│                                 │
│ Esqueci minha senha ← NOVO     │
└─────────────────────────────────┘
```

#### **Tela de Recuperação:**

```bash
┌─────────────────────────────────┐
│ Recuperar Senha                │
│                                 │
│ Email: [________________]      │
│                                 │
│ [Enviar Email de Recuperação]  │
│                                 │
│ ✅ Email enviado com sucesso!   │
└─────────────────────────────────┘
```

#### **Tela de Nova Senha:**

```bash
┌─────────────────────────────────┐
│ Nova Senha                     │
│                                 │
│ Nova Senha: [________________] │
│ Confirmar: [________________]   │
│                                 │
│ [Alterar Senha]                │
└─────────────────────────────────┘
```

---

## ⚠️ **CONSIDERAÇÕES DE SEGURANÇA**

### **🔒 Medidas de Segurança:**

1. **Token de Recuperação:**
   - Expiração automática (1 hora)
   - Uso único
   - Criptografia segura

2. **Validação de Senha:**
   - Mínimo 6 caracteres
   - Confirmação obrigatória
   - Validação de força

3. **Rate Limiting:**
   - Máximo 3 tentativas por hora
   - Bloqueio temporário
   - Logs de tentativas

4. **Email de Confirmação:**
   - Template profissional
   - Informações claras
   - Link seguro

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **✅ Frontend:**

- [ ] Criar `ForgotPassword.tsx`
- [ ] Criar `ResetPassword.tsx`
- [ ] Modificar `Login.tsx`
- [ ] Adicionar rotas no `App.tsx`
- [ ] Testar interface responsiva

### **✅ Backend:**

- [ ] Adicionar `resetPassword()` no `authAPI.ts`
- [ ] Adicionar `updatePassword()` no `authAPI.ts`
- [ ] Testar integração com Supabase
- [ ] Implementar tratamento de erros

### **✅ Supabase:**

- [ ] Configurar email templates
- [ ] Configurar URLs de redirecionamento
- [ ] Testar envio de emails
- [ ] Verificar configurações SMTP

### **✅ Testes:**

- [ ] Testar fluxo completo
- [ ] Testar casos de erro
- [ ] Testar responsividade
- [ ] Testar segurança

---

## 🎯 **PRIORIDADE E CRONOGRAMA**

### **📅 Cronograma Sugerido:**

**Fase 1 (2h):** Frontend Components

- Criar componentes básicos
- Implementar interface

**Fase 2 (2h):** Backend Integration

- Implementar funções de API
- Integrar com Supabase

**Fase 3 (1h):** Supabase Configuration

- Configurar templates
- Configurar URLs

**Fase 4 (1h):** Testing & Polish

- Testar fluxo completo
- Ajustes finais

### **🚀 Próximos Passos:**

1. **Implementar Frontend** (Prioridade 1)
2. **Implementar Backend** (Prioridade 1)
3. **Configurar Supabase** (Prioridade 2)
4. **Testar e Ajustar** (Prioridade 3)

---

## 📝 **NOTAS IMPORTANTES**

### **💡 Considerações:**

- **UX:** Interface deve ser intuitiva e amigável
- **Segurança:** Implementar todas as medidas de segurança
- **Responsividade:** Funcionar em mobile e desktop
- **Acessibilidade:** Seguir padrões de acessibilidade
- **Logs:** Implementar logs detalhados para debugging

### **🔧 Dependências:**

- Supabase Auth configurado
- Email SMTP configurado
- Templates de email personalizados
- URLs de redirecionamento configuradas

---

**📅 Criado em:** 02/08/2025
**👤 Responsável:** Equipe de Desenvolvimento
**🏷️ Tags:** #segurança #ux #autenticação #recuperação-senha
