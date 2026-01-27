// Configuration du menu
const menuData = [
{id: 1, title: 'Tartare de saumon', desc: 'Saumon sauvage, avocat, mangue, coriandre, perles de citron vert', price: 8200, tag: 'Poisson', img: 'https://images.unsplash.com/photo-1534482421-64566f76d2e7?w=600&h=400&fit=crop&q=80'},
  {id: 2, title: 'Burger signature', desc: 'Wagyu A5, foie gras, truffe noire,-Comté 18 mois, pain brioche toasté', price: 7200, tag: 'Viande', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&q=80'},
  {id: 3, title: 'Pizza au feu de bois', desc: 'Fior di latte, basilico genovese, pomodorini, huile EVO truffle', price: 6200, tag: 'Végétarien', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&q=80'},
  {id: 4, title: 'Salade quinoa & avocat', desc: 'Quinoa rouge, avocat Hass, grenades, feta, noisettes, miel-tahini', price: 5500, tag: 'Sain', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80'},
  {id: 5, title: 'Risotto champignons', desc: 'Carnaroli, porcini boletus, parmesan affiné, marsala, beurre noisette', price: 8500, tag: 'Végétarien', img: 'https://images.unsplash.com/photo-1476124369491-b79e5ff2f1f7?w=600&h=400&fit=crop&q=80'},
  {id: 6, title: 'Ceviche du jour', desc: 'Thon rouge, lait de coco, citron vert, piment rouge, coriandre fraîche', price: 9200, tag: 'Poisson', img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop&q=80'},
  {id: 7, title: 'Steak frites', desc: 'Filet de bœuf, béarnaise maison, frites aldente, herbes de Provence', price: 11800, tag: 'Viande', img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop&q=80'},
{id: 8, title: 'Tiramisu classique', desc: 'Mascarpone, espresso, ladyfingers imbibés, cacao Valrhona, Marsala', price: 4200, tag: 'Dessert', img: 'https://images.unsplash.com/photo-1550614000-4b9519e02099?w=600&h=400&fit=crop&q=80'},
  {id: 9, title: 'Smoothie bowl', desc: 'Açaí, mangue, banane, granola, fruits rouges, graines de chia, miel', price: 4600, tag: 'Sain', img: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop&q=80'}
];

// État global
const state = {
  menu: menuData,
  cart: [],
  favorites: [],
  currentFilter: 'Tous',
  cartOpen: false
};

// Utilitaires
const utils = {
  formatCurrency: (amount) => {
    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount));
    return `${formattedAmount} FCFA`;
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Gestion des filtres
const filterManager = {
  init() {
    const tags = ['Tous', ...new Set(menuData.map(item => item.tag))];
    const filtersEl = document.getElementById('filters');
    
    tags.forEach(tag => {
      const button = document.createElement('button');
      button.className = 'chip' + (tag === 'Tous' ? ' active' : '');
      button.textContent = tag;
      button.setAttribute('aria-pressed', tag === 'Tous');
      
      button.addEventListener('click', () => {
        this.setActiveFilter(tag);
        menuManager.render(this.getFilteredMenu(tag));
      });
      
      filtersEl.appendChild(button);
    });
  },
  
  setActiveFilter(tag) {
    state.currentFilter = tag;
    document.querySelectorAll('.filters .chip').forEach(chip => {
      const isActive = chip.textContent === tag;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-pressed', isActive);
    });
  },
  
  getFilteredMenu(tag) {
    return tag === 'Tous' 
      ? state.menu 
      : state.menu.filter(item => item.tag === tag);
  }
};

// Gestion du menu
const menuManager = {
  render(items, targetGrid = 'menuGrid') {
    const menuGrid = document.getElementById(targetGrid);
    const template = document.getElementById('cardTpl');
    
    menuGrid.innerHTML = '';
    
    if (items.length === 0 && targetGrid === 'favoritesGrid') {
      menuGrid.innerHTML = `
        <div class="favorites-empty" style="grid-column: 1/-1;">
          <div class="favorites-empty-icon">💔</div>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Aucun favori</div>
          <div>Ajoutez des plats à vos favoris en cliquant sur ❤️</div>
      `;
      return;
    }
    
    items.forEach((item, index) => {
      const clone = template.content.cloneNode(true);
      
      const img = clone.querySelector('[data-role="img"]');
      img.src = item.img;
      img.alt = item.title;
      
      // Gestion d'erreur pour les images
      img.onerror = function() {
        this.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80';
        this.alt = 'Image non disponible';
      };
      
      // Bouton favori
      const favoriteBtn = clone.querySelector('[data-role="favorite"]');
      const isFavorite = state.favorites.includes(item.id);
      favoriteBtn.textContent = isFavorite ? '♥' : '♡';
      favoriteBtn.classList.toggle('active', isFavorite);
      favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        favoritesManager.toggle(item.id);
      });
      
      clone.querySelector('[data-role="tag"]').textContent = item.tag;
      clone.querySelector('[data-role="title"]').textContent = item.title;
      clone.querySelector('[data-role="desc"]').textContent = item.desc;
      clone.querySelector('[data-role="price"]').textContent = utils.formatCurrency(item.price);
      
      const addBtn = clone.querySelector('[data-role="add"]');
      addBtn.addEventListener('click', () => cartManager.addItem(item));
      
      const detailBtn = clone.querySelector('[data-role="detail"]');
      detailBtn.addEventListener('click', () => this.showDetails(item));
      
      // Animation en cascade
      const card = clone.querySelector('.card');
      card.style.animationDelay = `${index * 0.05}s`;
      
      menuGrid.appendChild(clone);
    });
  },
  
  showDetails(item) {
    const heroImg = document.getElementById('heroImg');
    const previousSrc = heroImg.src;
    
    // Animation de changement d'image
    heroImg.style.opacity = '0.5';
    setTimeout(() => {
      heroImg.src = item.img;
      heroImg.style.opacity = '1';
    }, 200);
    
    // Restaurer l'image après 4 secondes
    setTimeout(() => {
      heroImg.style.opacity = '0.5';
      setTimeout(() => {
        heroImg.src = previousSrc;
        heroImg.style.opacity = '1';
      }, 200);
    }, 4000);
    
    // Message de détails
    const message = `${item.title}\n\n${item.desc}\n\nPrix: ${utils.formatCurrency(item.price)}\nCatégorie: ${item.tag}`;
    alert(message);
  }
};

// Gestion des favoris
const favoritesManager = {
  init() {
    try {
      const savedFavorites = localStorage.getItem('bistro_favorites');
      if (savedFavorites) {
        state.favorites = JSON.parse(savedFavorites);
        this.updateVisibility();
      }
    } catch (e) {
      console.warn('Impossible de charger les favoris');
    }
  },

  save() {
    try {
      localStorage.setItem('bistro_favorites', JSON.stringify(state.favorites));
    } catch (e) {
      console.warn('Impossible de sauvegarder les favoris');
    }
  },

  toggle(itemId) {
    const index = state.favorites.indexOf(itemId);
    const item = menuData.find(i => i.id === itemId);
    
    if (index > -1) {
      state.favorites.splice(index, 1);
      cartManager.showToast(`${item.title} retiré des favoris`, 'info');
    } else {
      state.favorites.push(itemId);
      cartManager.showToast(`${item.title} ajouté aux favoris`, 'success');
    }
    
    this.save();
    this.updateVisibility();
    
    // Re-render les grilles pour mettre à jour les icônes
    menuManager.render(filterManager.getFilteredMenu(state.currentFilter));
    this.renderFavorites();
  },

  renderFavorites() {
    const favoriteItems = menuData.filter(item => state.favorites.includes(item.id));
    menuManager.render(favoriteItems, 'favoritesGrid');
  },

  updateVisibility() {
    const favSection = document.getElementById('favorites');
    if (state.favorites.length > 0) {
      favSection.style.display = 'block';
    } else {
      favSection.style.display = 'none';
    }
  }
};

// Gestion du panier
const cartManager = {
  init() {
    // Charger le panier sauvegardé
    try {
      const savedCart = localStorage.getItem('bistro_cart');
      if (savedCart) {
        state.cart = JSON.parse(savedCart);
        this.render();
      }
    } catch (e) {
      console.warn('Impossible de charger le panier sauvegardé');
    }

    // Charger l'état du panier (ouvert/fermé)
    try {
      const savedCartState = localStorage.getItem('bistro_cart_state');
      if (savedCartState) {
        state.cartOpen = JSON.parse(savedCartState);
        this.updateCartVisibility();
      }
    } catch (e) {
      console.warn('Impossible de charger l\'état du panier');
    }

    // Event listener pour le bouton panier
    document.getElementById('cartToggle').addEventListener('click', () => {
      this.toggleCart();
    });
  },

  saveCart() {
    try {
      localStorage.setItem('bistro_cart', JSON.stringify(state.cart));
    } catch (e) {
      console.warn('Impossible de sauvegarder le panier');
    }
  },

  addItem(item) {
    const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.qty++;
    } else {
      state.cart.push({ ...item, qty: 1 });
    }
    
    this.render();
    this.animateCartBadge();
    this.saveCart();
    this.showToast(`${item.title} ajouté au panier`, 'success');
  },
  
  removeItem(id) {
    const item = state.cart.find(cartItem => cartItem.id === id);
    const index = state.cart.findIndex(cartItem => cartItem.id === id);
    if (index > -1) {
      state.cart.splice(index, 1);
      if (item) {
        this.showToast(`${item.title} retiré du panier`, 'info');
      }
    }
    this.render();
    this.saveCart();
  },
  
  updateQuantity(id, delta) {
    const item = state.cart.find(cartItem => cartItem.id === id);
    
    if (!item) return;
    
    item.qty += delta;
    
    if (item.qty < 1) {
      this.removeItem(id);
    } else {
      this.render();
      this.saveCart();
    }
  },
  
  render() {
    const cartList = document.getElementById('cartList');
    const totalEl = document.getElementById('total');
    const badgeEl = document.getElementById('cartBadge');
    
    cartList.innerHTML = '';
    
    if (state.cart.length === 0) {
      cartList.innerHTML = '<div class="cart-empty">Votre panier est vide</div>';
      totalEl.textContent = '0 FCFA';
      badgeEl.textContent = '0';
      return;
    }
    
    let total = 0;
    let totalItems = 0;
    
    state.cart.forEach(item => {
      total += item.price * item.qty;
      totalItems += item.qty;
      
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      
      cartItem.innerHTML = `
        <img src="${item.img}" alt="${item.title}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${item.qty} × ${utils.formatCurrency(item.price)}</div>
        <div class="cart-item-controls">
          <div class="cart-item-total">${utils.formatCurrency(item.price * item.qty)}</div>
          <div class="cart-item-buttons">
            <button class="cart-btn" onclick="cartManager.updateQuantity(${item.id}, -1)" aria-label="Diminuer la quantité">−</button>
            <button class="cart-btn" onclick="cartManager.updateQuantity(${item.id}, 1)" aria-label="Augmenter la quantité">+</button>
            <button class="cart-btn" onclick="cartManager.removeItem(${item.id})" aria-label="Retirer du panier">✕</button>
          </div>
      `;
      
      cartList.appendChild(cartItem);
    });
    
    totalEl.textContent = utils.formatCurrency(total);
    badgeEl.textContent = totalItems;
    
    // Mettre à jour le badge de navigation
    this.updateCartBadge();
  },
  
  animateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const badgeNav = document.getElementById('cartBadgeNav');
    
    if (badge) {
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => {
        badge.style.transform = 'scale(1)';
      }, 200);
    }
    
    if (badgeNav) {
      badgeNav.style.transform = 'scale(1.3)';
      setTimeout(() => {
        badgeNav.style.transform = 'scale(1)';
      }, 200);
    }
  },
  
  checkout() {
    if (state.cart.length === 0) {
      this.showToast('Votre panier est vide. Ajoutez des plats pour commander.', 'warning');
      return;
    }
    
    let summary = '🛒 Récapitulatif de votre commande\n\n';
    
    state.cart.forEach(item => {
      summary += `${item.qty} × ${item.title}\n`;
      summary += `   ${utils.formatCurrency(item.price * item.qty)}\n\n`;
    });
    
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    summary += `━━━━━━━━━━━━━━━━━━━━\n`;
    summary += `Total: ${utils.formatCurrency(total)}\n\n`;
    summary += `✓ Merci pour votre commande !\n`;
    summary += `Temps de préparation estimé : 25-35 min`;
    
    alert(summary);
    
    // Vider le panier après commande
    state.cart = [];
    this.render();
    this.saveCart();
    this.showToast('Commande validée avec succès !', 'success');
  },

  toggleCart() {
    state.cartOpen = !state.cartOpen;
    this.updateCartVisibility();
    this.saveCartState();
  },

  updateCartVisibility() {
    const cart = document.getElementById('cart');
    const cartToggle = document.getElementById('cartToggle');
    
    if (state.cartOpen) {
      cart.classList.remove('hidden');
      cartToggle.classList.add('active');
      cartToggle.setAttribute('aria-label', 'Fermer le panier');
    } else {
      cart.classList.add('hidden');
      cartToggle.classList.remove('active');
      cartToggle.setAttribute('aria-label', 'Ouvrir le panier');
    }
  },

  saveCartState() {
    try {
      localStorage.setItem('bistro_cart_state', JSON.stringify(state.cartOpen));
    } catch (e) {
      console.warn('Impossible de sauvegarder l\'état du panier');
    }
  },

  updateCartBadge() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const badgeNav = document.getElementById('cartBadgeNav');
    
    if (badgeNav) {
      badgeNav.textContent = totalItems;
      
      // Animation du badge
      badgeNav.style.transform = 'scale(1.3)';
      setTimeout(() => {
        badgeNav.style.transform = 'scale(1)';
      }, 200);
    }
  },

  showToast(message, type = 'info') {
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

// Gestion de la recherche
const searchManager = {
  init() {
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('searchBtn');
    
    const performSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      
      if (!query) {
        filterManager.setActiveFilter('Tous');
        menuManager.render(state.menu);
        return;
      }
      
      const results = state.menu.filter(item => {
        const searchText = `${item.title} ${item.desc} ${item.tag}`.toLowerCase();
        return searchText.includes(query);
      });
      
      // Désactiver les filtres lors d'une recherche
      document.querySelectorAll('.filters .chip').forEach(chip => {
        chip.classList.remove('active');
        chip.setAttribute('aria-pressed', 'false');
      });
      
      menuManager.render(results);
      
      // Message si aucun résultat
      if (results.length === 0) {
        document.getElementById('menuGrid').innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--muted);">
            <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Aucun résultat trouvé</div>
            <div>Essayez avec d'autres mots-clés</div>
        `;
      }
    };
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    // Recherche en temps réel (debounced)
    searchInput.addEventListener('input', utils.debounce(performSearch, 500));
  }
};

// Gestion de la lightbox
const lightboxManager = {
  images: [],
  currentIndex: 0,

  init() {
    const galleryImages = document.querySelectorAll('.gallery-grid img');
    this.images = Array.from(galleryImages);
    
    galleryImages.forEach((img, index) => {
      img.addEventListener('click', () => this.open(index));
    });

    document.getElementById('lightboxClose').addEventListener('click', () => this.close());
    document.getElementById('lightboxPrev').addEventListener('click', () => this.prev());
    document.getElementById('lightboxNext').addEventListener('click', () => this.next());
    
    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Fermer en cliquant sur le fond
    document.getElementById('lightbox').addEventListener('click', (e) => {
      if (e.target.id === 'lightbox') this.close();
    });
  },

  open(index) {
    this.currentIndex = index;
    this.show();
  },

  show() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    
    img.src = this.images[this.currentIndex].src;
    img.alt = this.images[this.currentIndex].alt;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  },

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.show();
  },

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.show();
  }
};

// Gestion des avis clients
const reviewManager = {
  reviews: [],

init() {
    this.loadReviews();
    this.initForm();
    // Initialize carousel after loading reviews
    if (typeof reviewsCarousel !== 'undefined') {
      reviewsCarousel.init(this.reviews);
    } else {
      this.renderReviews();
    }
  },

  loadReviews() {
    try {
      const savedReviews = localStorage.getItem('bistro_reviews');
      if (savedReviews) {
        this.reviews = JSON.parse(savedReviews);
      } else {
        // Avis par défaut
        this.reviews = [
          {
            id: 1,
            name: 'Marie Dupont',
            rating: 5,
            comment: 'Excellent restaurant ! La nourriture est délicieuse et le service impeccable. Je recommande vivement.',
            date: '2024-01-15'
          },
          {
            id: 2,
            name: 'Pierre Martin',
            rating: 4,
            comment: 'Très bonne expérience. Les plats sont savoureux et l\'ambiance est agréable. Petit bémol sur le temps d\'attente.',
            date: '2024-01-10'
          },
          {
            id: 3,
            name: 'Sophie Leroy',
            rating: 5,
            comment: 'Un vrai coup de cœur ! Tout était parfait, de l\'entrée au dessert. À refaire absolument.',
            date: '2024-01-08'
          }
        ];
        this.saveReviews();
      }
    } catch (e) {
      console.warn('Impossible de charger les avis');
      this.reviews = [];
    }
  },

  saveReviews() {
    try {
      localStorage.setItem('bistro_reviews', JSON.stringify(this.reviews));
    } catch (e) {
      console.warn('Impossible de sauvegarder les avis');
    }
  },

  initForm() {
    const form = document.getElementById('reviewForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addReview();
    });
  },

  addReview() {
    const name = document.getElementById('reviewName').value.trim();
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();

    if (!name || !rating || !comment) {
      cartManager.showToast('Veuillez remplir tous les champs', 'warning');
      return;
    }

    const newReview = {
      id: Date.now(),
      name: name,
      rating: parseInt(rating),
      comment: comment,
      date: new Date().toISOString().split('T')[0]
    };

    this.reviews.unshift(newReview); // Ajouter au début
    this.saveReviews();
    this.renderReviews();

    // Réinitialiser le formulaire
    document.getElementById('reviewForm').reset();

    cartManager.showToast('Votre avis a été publié avec succès !', 'success');
  },

  renderReviews() {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';

    if (this.reviews.length === 0) {
      reviewsList.innerHTML = `
        <div class="reviews-empty">
          <div class="reviews-empty-icon">💬</div>
          <h4>Aucun avis pour le moment</h4>
          <p>Soyez le premier à partager votre expérience<br>et à donner votre avis sur notre restaurant !</p>
        </div>
      `;
      return;
    }

    // Add header with count
    const header = document.createElement('div');
    header.className = 'reviews-list-header';
    header.innerHTML = `
      <h4>⭐ Avis des clients</h4>
      <span class="reviews-count">${this.reviews.length} avis</span>
    `;
    reviewsList.appendChild(header);

    this.reviews.forEach((review, index) => {
      const reviewItem = document.createElement('div');
      reviewItem.className = 'review-item fade-in';
      reviewItem.style.animationDelay = `${index * 0.1}s`;

      // Generate initials from name
      const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      // Generate star rating HTML
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= review.rating) {
          starsHtml += '<span class="review-star">★</span>';
        } else {
          starsHtml += '<span class="review-star empty">★</span>';
        }
      }

      reviewItem.innerHTML = `
        <div class="review-header">
          <div class="review-author-info">
            <div class="review-avatar">${initials}</div>
            <div class="review-author-details">
              <div class="review-author">${review.name}</div>
              <div class="review-rating">${starsHtml}</div>
            </div>
          </div>
          <div class="review-meta">
            <div class="review-date">${this.formatDate(review.date)}</div>
            <span class="review-verified">✓ Vérifié</span>
          </div>
        </div>
        <div class="review-comment">${review.comment}</div>
      `;

      reviewsList.appendChild(reviewItem);
    });
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Gestion du thème
const themeManager = {
  init() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Récupérer le thème sauvegardé ou utiliser le thème sombre par défaut
    try {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      this.setTheme(savedTheme);
    } catch (e) {
      this.setTheme('dark');
    }
    
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    });
  },
  
  setTheme(theme) {
    const themeIcon = document.getElementById('themeIcon');
    document.documentElement.setAttribute('data-theme', theme);
    
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Impossible de sauvegarder le thème');
    }
    
    // Changer l'icône avec animation
    themeIcon.style.transform = 'rotate(180deg) scale(0)';
    setTimeout(() => {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
      themeIcon.style.transform = 'rotate(0deg) scale(1)';
    }, 150);
  }
};

// Initialisation de l'application
const app = {
  init() {
    filterManager.init();
    searchManager.init();
    cartManager.init();
    favoritesManager.init();
    lightboxManager.init();
    menuManager.render(state.menu);
    favoritesManager.renderFavorites();
    cartManager.render();
    themeManager.init();
    reviewManager.init();
    this.initScrollToTop();
    pwaInstallManager.init();
    
    // Gestion du bouton de commande
    document.getElementById('checkoutBtn').addEventListener('click', () => {
      cartManager.checkout();
    });
    
    // Smooth scroll pour la navigation
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      });
    });
    
    console.log('🍽️ Bistro Rive - Application initialisée avec succès');

    // Enregistrement du Service Worker pour PWA
    this.registerServiceWorker();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Enregistrer le Service Worker immédiatement (pas besoin d'attendre load)
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('🍽️ Service Worker enregistré avec succès:', registration.scope);

          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  cartManager.showToast('Nouvelle version disponible ! Actualisez pour mettre à jour.', 'info');
                }
              });
            }
          });
          
          // Vérifier si une mise à jour est déjà disponible
          if (registration.waiting) {
            cartManager.showToast('Nouvelle version disponible ! Actualisez pour mettre à jour.', 'info');
          }

          // Notifier que le PWA peut maintenant être installé
          // Le beforeinstallprompt devrait maintenant être disponible
          console.log('🍽️ PWA est prêt à être installé');
        })
        .catch((error) => {
          console.error('🍽️ Erreur lors de l\'enregistrement du Service Worker:', error);
        });
    } else {
      console.warn('🍽️ Service Worker non supporté par ce navigateur');
    }
  },

  initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Retour en haut');
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add('show');
      } else {
        scrollBtn.classList.remove('show');
      }
    });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

// Exposer les fonctions nécessaires au global scope pour les handlers inline
window.cartManager = cartManager;

// Gestion du PWA Install Banner
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
      cartManager.showToast('Application installée avec succès ! 🎉', 'success');
    });

    // Réessayer l'affichage de la bannière après interaction utilisateur
    // Certains navigateurs nécessitent une interaction pour déclencher beforeinstallprompt
    document.addEventListener('click', () => {
      if (!this.isBannerDismissed && !this.isPWAInstalled() && !this.deferredPrompt) {
        console.log('🍽️ Interaction détectée, vérifiant la disponibilité du prompt PWA');
      }
    }, { once: true });

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
  },

  isPWAInstalled() {
    // Vérifier si l'application est déjà installée
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://') ||
           window.matchMedia('(display-mode: fullscreen)').matches;
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
      } else {
        console.log('🍽️ L\'utilisateur a refusé l\'installation');
      }
    } else {
      // Pas de prompt disponible, afficher des instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      let instructions = '';
      if (isIOS) {
        instructions = '📱 Pour installer sur iPhone/iPad:\n\n1. Appuyez sur le bouton Partager\n2. Sélectionnez "Sur l\'écran d\'accueil"\n3. Appuyez sur "Ajouter"';
      } else if (isAndroid) {
        instructions = '📱 Pour installer sur Android:\n\n1. Appuyez sur le menu (⋮)\n2. Sélectionnez "Installer l\'application"\n3. Appuyez sur "Installer"';
      } else {
        instructions = '💡 Pour installer l\'application:\n\n- Chrome: Menu → Installer Bistro Rive\n- Edge: Menu → Applications → Installer ce site';
      }

      alert(`Installez Bistro Rive\n\n${instructions}`);
    }
  }
};

// Démarrage de l'application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}


 

   // Alerte visuelle simple
   function showAlert() {
    const box = document.getElementById("alertBox");
    box.style.display = "block";
    setTimeout(() => { box.style.display = "none"; }, 2000);
    return false;
  }

  // Obfuscation légère du JavaScript
  (function(){
    const msg = ["Ce site appartient à Joseph Yedidya", "Toute copie est interdite 🚫"];
    console.log(msg[Math.floor(Math.random()*msg.length)]);
  })();
