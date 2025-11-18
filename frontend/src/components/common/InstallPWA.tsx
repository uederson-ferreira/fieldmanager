import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    if (isInstalled) {
      console.log('✅ PWA já está instalado');
      return;
    }

    // Verificar se o banner já foi dispensado
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
    const dismissedTime = bannerDismissed ? parseInt(bannerDismissed) : 0;
    const daysSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Mostrar banner novamente após 7 dias
    if (!bannerDismissed || daysSinceDismiss > 7) {
      // Aguardar 3 segundos para mostrar o banner (dar tempo do usuário ver o app)
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }

    // Capturar evento de instalação
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('📱 PWA pode ser instalado');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar prompt de instalação
    deferredPrompt.prompt();

    // Aguardar escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalar`);

    if (outcome === 'accepted') {
      setShowInstallButton(false);
      setShowBanner(false);
    }

    // Limpar prompt
    setDeferredPrompt(null);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Não mostrar nada se não puder instalar
  if (!showInstallButton && !showBanner) {
    return null;
  }

  // Banner flutuante (mobile)
  if (showBanner && window.innerWidth < 768) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-lg p-4 z-50 animate-slide-up">
        <button
          onClick={handleDismissBanner}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Download className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Instalar EcoField</h3>
            <p className="text-sm text-white/90 mb-3">
              Adicione à tela inicial para acesso rápido e uso offline!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Instalar Agora
              </button>
              <button
                onClick={handleDismissBanner}
                className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-white/70">
          ⚡ Funciona offline • 📸 Câmera • 📍 GPS
        </div>
      </div>
    );
  }

  // Botão fixo no header (desktop/sempre visível)
  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md"
      title="Instalar aplicativo"
    >
      <Download className="w-5 h-5" />
      <span className="hidden sm:inline">Instalar App</span>
    </button>
  );
};

export default InstallPWA;
