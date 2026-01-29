 // ========================================
// NOUVELLES FONCTIONNALITÉS
// Daily Specials, Sort, Reservation, Timer
// ========================================

// Données des plats du jour (Specials)
const specialsData = [
  {
    id: 100,
    title: 'Pavé de Saumon rôti',
    desc: 'Saumon sauvage, asperges grillées, sauce hollandaise au citron, échalotes confites',
    price: 12500,
    originalPrice: 15000,
    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop&q=80',
    badge: 'Plat du Jour',
    discount: '17%'
  },
  {
    id: 101,
    title: 'Carré d\'Agneau',
    desc: 'Agneau de Nouvelle Zélande, gratin dauphinois, romarin frais, jus corsé au thym',
    price: 18500,
    originalPrice: 22000,
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=80',
    badge: 'Chef\'s Choice',
    discount: '16%'
  },
  {
    id: 102,
    title: 'Lassi Mangue Maison',
    desc: 'Lassi onctueux, mangue Alphonso, cardamome, pistaches grillées, miel de lavande',
    price: 3500,
    originalPrice: 4500,
    img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop&q=80',
    badge: 'Offre Limitée',
    discount: '22%'
  }
];

// Gestion des plats du jour
const specialsManager = {
  init() {
    this.renderSpecials();
    this.startCountdown();
  },

  renderSpecials() {
    const specialsGrid = document.getElementById('specialsGrid');
    if (!specialsGrid) return;

    specialsGrid.innerHTML = '';

    specialsData.forEach((special, index) => {
      const specialCard = document.createElement('div');
      specialCard.className = 'special-card fade-in';
      specialCard.style.animationDelay = `${index * 0.1}s`;

      specialCard.innerHTML = `
        <span class="special-badge">${special.badge}</span>
        <span class="special-timer-badge" data-special-id="${special.id}">--:--</span>
        <img src="${special.img}" alt="${special.title}" class="special-card-img" loading="lazy">
        <div class="special-card-content">
          <h4>${special.title}</h4>
          <p>${special.desc}</p>
          <div class="special-price">
            <span class="current">${utils.formatCurrency(special.price)}</span>
            <span class="original">${utils.formatCurrency(special.originalPrice)}</span>
            <span class="discount">-${special.discount}</span>
          </div>
        </div>
      `;

      specialsGrid.appendChild(specialCard);
    });
  },

  startCountdown() {
    // Définir une date de fin (24h à partir de maintenant)
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);
    endTime.setMinutes(0);
    endTime.setSeconds(0);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        // Recommencer le countdown
        endTime.setHours(endTime.getHours() + 24);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const timerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      // Mettre à jour tous les badges de timer
      document.querySelectorAll('.special-timer-badge').forEach(badge => {
        badge.textContent = timerText;
      });

      const countdownEl = document.getElementById('countdown');
      if (countdownEl) countdownEl.textContent = timerText;
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }
};

// Gestion du tri du menu
const sortManager = {
  init() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', () => {
      this.sortMenu(sortSelect.value);
    });
  },

  sortMenu(sortType) {
    let sortedMenu = [...state.menu];

    switch (sortType) {
      case 'price-asc':
        sortedMenu.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedMenu.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sortedMenu.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
        sortedMenu.sort((a, b) => b.price - a.price);
        break;
      default:
        sortedMenu = state.menu;
    }

    menuManager.render(sortedMenu);
  }
};

// Gestion des réservations
const reservationManager = {
  init() {
    const form = document.getElementById('reservationForm');
    if (!form) return;

    // Définir la date minimum à aujourd'hui
    const dateInput = document.getElementById('resDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleReservation();
    });
  },

  handleReservation() {
    const name = document.getElementById('resName').value.trim();
    const email = document.getElementById('resEmail').value.trim();
    const phone = document.getElementById('resPhone').value.trim();
    const date = document.getElementById('resDate').value;
    const time = document.getElementById('resTime').value;
    const guests = document.getElementById('resGuests').value;
    const message = document.getElementById('resMessage').value.trim();

    // Vérifier que tous les champs obligatoires sont remplis
    if (!name || !email || !phone || !date || !time || !guests) {
      if (typeof cartManager !== 'undefined' && cartManager.showModal) {
        cartManager.showModal('Champs manquants', 'Veuillez remplir tous les champs obligatoires', 'warning');
      } else {
        alert('Veuillez remplir tous les champs obligatoires');
      }
      return;
    }

    const reservationDetails = `
🗓️ **Réservation confirmée!**

📅 Date: ${date} à ${time}
👥 Personnes: ${guests}
👤 Nom: ${name}
📧 Email: ${email}
📞 Téléphone: ${phone}
${message ? `📝 Notes: ${message}` : ''}

✅ Un e-mail de confirmation a été envoyé à ${email}
📱 Nous vous appellerons au ${phone} pour confirmer

Merci pour votre réservation ! 🍽️
    `;

    document.getElementById('reservationForm').reset();
    if (typeof cartManager !== 'undefined' && cartManager.showToast) {
      cartManager.showToast('Réservation effectuée avec succès !', 'success');
    }
    console.log(reservationDetails);
  }
};


// ========================================
// INITIALISATION DES NOUVELLES FONCTIONNALITÉS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  specialsManager.init();
  sortManager.init();
  reservationManager.init();
});

