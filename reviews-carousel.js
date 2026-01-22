// Reviews Carousel Module
const reviewsCarousel = {
  currentSlide: 0,
  autoPlayInterval: null,
  
  init(reviews) {
    this.reviews = reviews;
    this.renderCarousel();
    this.startAutoPlay();
  },
  
  renderCarousel() {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';
    
    if (!this.reviews || this.reviews.length === 0) {
      reviewsList.innerHTML = `
        <div class="reviews-empty">
          <div class="reviews-empty-icon">💬</div>
          <h4>Aucun avis pour le moment</h4>
          <p>Soyez le premier à partager votre expérience<br>et à donner votre avis sur notre restaurant !</p>
        </div>
      `;
      return;
    }
    
    // Create carousel container
    const carousel = document.createElement('div');
    carousel.className = 'reviews-carousel';
    
    // Create inner container for slides
    const carouselInner = document.createElement('div');
    carouselInner.className = 'reviews-carousel-inner';
    
    this.reviews.forEach((review, index) => {
      const reviewItem = document.createElement('div');
      reviewItem.className = 'reviews-carousel-item' + (index === 0 ? ' active' : '');
      
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
      
      // Format date
      const date = new Date(review.date);
      const formattedDate = date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      reviewItem.innerHTML = `
        <div class="review-item">
          <div class="review-header">
            <div class="review-author-info">
              <div class="review-avatar">${initials}</div>
              <div class="review-author-details">
                <div class="review-author">${review.name}</div>
                <div class="review-rating">${starsHtml}</div>
            </div>
            <div class="review-meta">
              <div class="review-date">${formattedDate}</div>
              <span class="review-verified">✓ Vérifié</span>
            </div>
          <div class="review-comment">${review.comment}</div>
      `;
      
      carouselInner.appendChild(reviewItem);
    });
    
    carousel.appendChild(carouselInner);
    
    // Create controls
    const controls = document.createElement('div');
    controls.className = 'reviews-carousel-controls';
    
    controls.innerHTML = `
      <button class="reviews-carousel-btn" id="reviewsPrevBtn" aria-label="Avis précédent">‹</button>
      <div class="reviews-carousel-dots" id="reviewsDots"></div>
      <div class="reviews-carousel-counter">
        <span id="currentSlide">1</span> / <span id="totalSlides">${this.reviews.length}</span>
      </div>
      <button class="reviews-carousel-btn" id="reviewsNextBtn" aria-label="Avis suivant">›</button>
    `;
    
    carousel.appendChild(controls);
    reviewsList.appendChild(carousel);
    
    // Create dots
    const dotsContainer = document.getElementById('reviewsDots');
    if (dotsContainer) {
      for (let i = 0; i < this.reviews.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'reviews-carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Aller à l\'avis ' + (i + 1));
        dot.addEventListener('click', () => this.goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }
    
    // Add event listeners
    const prevBtn = document.getElementById('reviewsPrevBtn');
    const nextBtn = document.getElementById('reviewsNextBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
    
    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
    carousel.addEventListener('mouseleave', () => this.startAutoPlay());
  },
  
  goToSlide(index) {
    if (index < 0 || index >= this.reviews.length) return;
    
    this.currentSlide = index;
    this.updateCarousel();
  },
  
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.reviews.length;
    this.updateCarousel();
  },
  
  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.reviews.length) % this.reviews.length;
    this.updateCarousel();
  },
  
  updateCarousel() {
    const items = document.querySelectorAll('.reviews-carousel-item');
    const dots = document.querySelectorAll('.reviews-carousel-dot');
    
    items.forEach((item, index) => {
      item.classList.remove('active', 'prev');
      if (index === this.currentSlide) {
        item.classList.add('active');
      } else if (index < this.currentSlide) {
        item.classList.add('prev');
      }
    });
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
    });
    
    // Update counter
    const counterEl = document.getElementById('currentSlide');
    if (counterEl) counterEl.textContent = this.currentSlide + 1;
    
    // Update button states
    const prevBtn = document.getElementById('reviewsPrevBtn');
    const nextBtn = document.getElementById('reviewsNextBtn');
    if (prevBtn) prevBtn.disabled = this.reviews.length <= 1;
    if (nextBtn) nextBtn.disabled = this.reviews.length <= 1;
  },
  
  startAutoPlay() {
    this.stopAutoPlay();
    if (this.reviews && this.reviews.length > 1) {
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  },
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  },
  
  destroy() {
    this.stopAutoPlay();
  }
};
