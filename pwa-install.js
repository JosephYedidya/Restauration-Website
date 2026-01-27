/**
 * PWA Install Manager for Bistro Rive
 * Handles the install prompt and install banner
 */

const pwaInstallManager = {
  deferredPrompt: null,
  isBannerDismissed: false,
  isInitialized: false,

  init() {
    // Éviter l'initialisation multiple
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    // Vérifier si déjà installé en tant que PWA
    if (this.isPWAInstalled()) {
      console.log('🍽️ PWA déjà installé, bannière masquée');
      return;
    }

    // Vérifier si l'utilisateur a déjà fermé la bannière
    this.isBannerDismissed = this.wasBannerDismissed();

    // Masquer le bouton installer par défaut (sera affiché si le prompt est disponible)
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }

    // Afficher la bannière après un délai sur mobile (même sans beforeinstallprompt)
    if (!this.isBannerDismissed && this.isMobileDevice()) {
      console.log('🍽️ Affichage de la bannière PWA sur mobile');
      setTimeout(() => {
        // Vérifier à nouveau si pas encore installé
        if (!this.isPWAInstalled() && !this.isBannerDismissed) {
          this.showBanner();
        }
      }, 5000);
    }

    // Écouter l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('🍽️ beforeinstallprompt reçu');
      // Empêcher l'affichage automatique du prompt
      e.preventDefault();
      // Stocker l'événement pour utilisation ultérieure
      this.deferredPrompt = e;

      // Afficher le bouton installer si la bannière est visible
      if (installBtn) {
        installBtn.style.display = 'flex';
        installBtn.textContent = 'Installer';
      }

      // Si la bannière n'est pas encore visible, l'afficher maintenant
      if (!this.isBannerDismissed) {
        this.showBanner();
      }
    });

    // Écouter l'événement appinstalled
    window.addEventListener('appinstalled', (event) => {
      console.log('🍽️ Application installée');
      // Cacher la bannière et réinitialiser l'état
      this.hideBanner();
      this.resetDismissalState();
      this.showToast('Application installée avec succès ! 🎉', 'success');
    });

    // Gérer le clic sur le bouton installer
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        this.installPWA();
      });
    }

    // Gérer le clic sur le bouton fermer
    const dismissBtn = document.getElementById('pwaDismissBtn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.dismissBanner();
      });
    }

    console.log('🍽️ PWA Install Manager initialisé');
  },

  isPWAInstalled() {
    // Vérifier si l'application est déjà installée
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://') ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches;
  },

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && window.innerHeight <= 1024);
  },

  wasBannerDismissed() {
    try {
      const dismissed = localStorage.getItem('pwa_install_banner_dismissed');
      return dismissed === 'true';
    } catch (e) {
      return false;
    }
  },

  showBanner() {
    const banner = document.getElementById('pwaInstallBanner');
    const installBtn = document.getElementById('pwaInstallBtn');
    if (banner) {
      banner.classList.add('show');
    }
    // Si pas de prompt disponible, afficher instructions manuelles
    if (installBtn && !this.deferredPrompt) {
      installBtn.style.display = 'flex';
      installBtn.textContent = 'Comment installer';
    }
  },

  hideBanner() {
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) {
      banner.classList.remove('show');
    }
  },

  dismissBanner() {
    this.isBannerDismissed = true;
    this.hideBanner();

    try {
      localStorage.setItem('pwa_install_banner_dismissed', 'true');
    } catch (e) {
      console.warn('🍽️ Impossible de sauvegarder l\'état de la bannière');
    }
  },

  resetDismissalState() {
    try {
      localStorage.removeItem('pwa_install_banner_dismissed');
    } catch (e) {
      console.warn('🍽️ Impossible de réinitialiser l\'état de la bannière');
    }
  },

  async installPWA() {
    if (this.deferredPrompt) {
      // Le prompt est disponible, l'afficher
      this.deferredPrompt.prompt();

      // Attendre le choix de l'utilisateur
      const { outcome } = await this.deferredPrompt.userChoice;

      // Nettoyer le prompt
      this.deferredPrompt = null;

      if (outcome === 'accepted') {
        console.log('🍽️ L\'utilisateur a accepté l\'installation');
        this.showToast('Téléchargement en cours... 📱', 'info');
      } else {
        console.log('🍽️ L\'utilisateur a refusé l\'installation');
      }
    } else {
      // Pas de prompt disponible, afficher des instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isMobile = this.isMobileDevice();

      let title = '📱 Installer Bistro Rive';
      let message = '';

      if (isIOS) {
        message = `
1. Appuyez sur le bouton Partager
2. Sélectionnez « Sur l'écran d'accueil »
3. Appuyez sur « Ajouter »

L'application sera ajoutée à votre écran d'accueil !
        `;
      } else if (isAndroid) {
        message = `
1. Appuyez sur le menu (⋮)
2. Sélectionnez « Installer l'application » ou « Ajouter à l'écran d'accueil »
3. Appuyez sur « Installer »

L'application sera ajoutée à votre écran d'accueil !
        `;
      } else if (isMobile) {
        message = `
1. Appuyez sur le menu de votre navigateur
2. Sélectionnez « Ajouter à l'écran d'accueil »
3. Confirmez l'installation

L'application sera disponible hors-ligne !
        `;
      } else {
        message = `
💻 Pour installer sur ordinateur :

Chrome/Edge :
1. Cliquez sur le menu (⋮)
2. Sélectionnez « Installer Bistro Rive » ou « Installer l'application »
3. L'application s'installera comme une application native

L'application fonctionnera hors-ligne !
        `;
      }

      // Use popup if available, otherwise use alert
      if (typeof popupManager !== 'undefined') {
        popupManager.show(title, message.trim(), 'info', null, null, 'Instructions');
      } else if (typeof cartManager !== 'undefined' && cartManager.showModal) {
        cartManager.showModal(title, message.trim(), 'info');
      } else {
        alert(`${title}\n\n${message.trim()}`);
      }
    }
  },

  showToast(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    
    const icon = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    }[type] || 'ℹ';
    
    toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast-show'), 10);
    
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Exposer le gestionnaire au global scope
window.pwaInstallManager = pwaInstallManager;

// Auto-initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => pwaInstallManager.init());
} else {
  pwaInstallManager.init();
}

