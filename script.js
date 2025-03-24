// Dynamisches Laden der Portfolio-Bilder
const portfolioData = [
    { src: "bilder/linzm1.jpg", alt: "Linz-Marathon", images: ["bilder/linzm1.jpg", "bilder/linzm2.jpg", "bilder/linzm3.jpg"] },
    { src: "bilder/rr1.jpg", alt: "Kasberg-Inferno", images: ["bilder/rr1.jpg", "bilder/rr2.jpg", "bilder/rr3.jpg", "bilder/rr4.jpg", "bilder/rr5.jpg"] },
    { src: "bilder/hochzeit1.jpg", alt: "Hochzeitsfotografie", images: ["bilder/hochzeit1.jpg", "bilder/hochzeit2.jpg", "bilder/hochzeit3.jpg"] },
    { src: "bilder/tiere1.jpg", alt: "Haustiere", images: ["bilder/tiere1.jpg", "bilder/tiere2.jpg", "bilder/tiere3.jpg", "bilder/tiere4.jpg", "bilder/tiere5.jpg", "bilder/tiere6.jpg", "bilder/tiere7.jpg", "bilder/tiere8.jpg"] },
    { src: "bilder/wildlife1.jpg", alt: "Wildlife", images: ["bilder/wildlife1.jpg", "bilder/wildlife2.jpg", "bilder/wildlife3.jpg", "bilder/wildlife4.jpg", "bilder/wildlife5.jpg", "bilder/wildlife6.jpg"] },
    { src: "bilder/party1.jpg", alt: "Partyfotografie", images: ["bilder/party1.jpg", "bilder/party2.jpg", "bilder/party3.jpg"] }
];

const portfolioGallery = document.getElementById("portfolio-gallery");

portfolioData.forEach(item => {
    const container = document.createElement("div");
    container.className = "image-container";
    container.innerHTML = `
        <img src="${item.src}" alt="${item.alt}" loading="lazy">
        <div class="overlay-text">${item.alt}</div>
    `;
    container.addEventListener("click", () => openLightbox(item.src, item.images));
    portfolioGallery.appendChild(container);
});

// Lightbox-Funktionen
let currentIndex = 0;
let images = [];
let nextImage = new Image(); // Für Vorladen des nächsten Bildes

// Tastatursteuerung
document.addEventListener("keydown", (event) => {
    const lightbox = document.getElementById("lightbox");
    if (lightbox.classList.contains("active")) {
        if (event.key === "ArrowRight") changeImage(1);
        if (event.key === "ArrowLeft") changeImage(-1);
        if (event.key === "Escape") closeLightbox();
    }
});

function openLightbox(imageSrc, imageList) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.style.opacity = "1"; // Sicherstellen, dass Bild sichtbar ist
    lightboxImg.src = imageSrc;
    lightbox.classList.add("active");
    images = imageList;
    currentIndex = images.indexOf(imageSrc);
    document.body.style.overflow = "hidden";
    
    // Vorladen der Nachbarbilder
    preloadNeighbors(currentIndex);
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
    
    // Reset aller Transforms
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.style.transform = "translateX(0)";
    lightboxImg.style.opacity = "1";
}

function changeImage(n) {
    const newIndex = (currentIndex + n + images.length) % images.length;
    lightboxImg.src = images[newIndex]; // Direkter Wechsel
    currentIndex = newIndex;
    preloadNeighbors(newIndex);
}

// Hilfsfunktion zum Vorladen
function preloadNeighbors(index) {
    const prevImg = new Image();
    const nextImg = new Image();
    prevImg.src = images[(index - 1 + images.length) % images.length];
    nextImg.src = images[(index + 1) % images.length];
	if (window.innerWidth <= 768) {
    [-2, -1, 1, 2].forEach(offset => {
      const img = new Image();
      img.src = images[(index + offset + images.length) % images.length];
    });
  }
}

// Touch-Events für Wischfunktion
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;
let lightboxImg = document.getElementById('lightbox-img');
let nextImageElement = null;
let currentDirection = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY; // FEHLTE
    isSwiping = true; // WICHTIG! Dieser Flag wurde nicht gesetzt
    nextImageElement?.remove();
}

function handleTouchMove(event) {
    if (!isSwiping) return;
	
	event.preventDefault(); // WICHTIGSTER FIX
    
    const touchCurrentX = event.touches[0].clientX;
    const touchCurrentY = event.touches[0].clientY;
    const deltaX = touchCurrentX - touchStartX;
    const deltaY = touchCurrentY - touchStartY;
	
	// Vertikales Scrollen
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
        const dampenedDelta = deltaY * 0.5;
        lightboxImg.style.transform = `translateY(${dampenedDelta}px)`;
        return;
    }
    
    if (window.innerWidth > 768) return; // Nur für Mobilgeräte
    
    // Aktuelles Bild bewegen
    lightboxImg.style.transform = `translateX(${deltaX}px)`;
    
    // Nächstes Bild vorbereiten
    currentDirection = Math.sign(deltaX);
    const nextIndex = (currentIndex - currentDirection + images.length) % images.length;
    
    if (!nextImageElement) {
        nextImageElement = new Image();
        nextImageElement.className = 'next-image';
        nextImageElement.src = images[nextIndex];
        lightbox.appendChild(nextImageElement);
    }
    
    // Position des nächsten Bildes berechnen
    const nextImageOffset = currentDirection === 1 ? -100 + deltaX : 100 + deltaX;
    nextImageElement.style.transform = `translateX(${nextImageOffset}px)`;
}

function handleTouchEnd(event) {
	isSwiping = false; // WICHTIG! Reset des Flags
    if (window.innerWidth > 768) return;
    
    const deltaX = event.changedTouches[0].clientX - touchStartX;
	const deltaY = event.changedTouches[0].clientY - touchStartY; // FEHLTE
    const absDeltaX = Math.abs(deltaX);
	const absDeltaY = Math.abs(deltaY); // FEHLTE
    const threshold = window.innerWidth * 0.2;
	
	if (absDeltaY > 100) {
        closeLightbox();
        return;
    }

    if (absDeltaX > threshold) {
        // Animation starten
        lightboxImg.style.transition = 'transform 0.4s';
        nextImageElement.style.transition = 'transform 0.4s';
        
        // Endpositionen setzen
        lightboxImg.style.transform = `translateX(${currentDirection * 100}%)`;
        nextImageElement.style.transform = 'translateX(0)';
        
        // Nach Animation aktualisieren
        const animationEnd = () => {
            lightboxImg.src = nextImageElement.src;
			preloadNeighbors(currentIndex); // FEHLTE HIER
            lightboxImg.style.transform = 'translateX(0)';
            lightboxImg.style.transition = 'none';
            nextImageElement.remove();
            nextImageElement = null;
            currentIndex = (currentIndex - currentDirection + images.length) % images.length;
            lightboxImg.removeEventListener('transitionend', animationEnd);
        };
        
        lightboxImg.addEventListener('transitionend', animationEnd);
    } else {
        // Zurücksetzen wenn nicht weit genug gewischt
        lightboxImg.style.transform = 'translateX(0)';
        nextImageElement.remove();
        nextImageElement = null;
    }
}

// Event-Listener
const lightbox = document.getElementById('lightbox');
lightbox.addEventListener('touchstart', handleTouchStart, { passive: false });
lightbox.addEventListener('touchmove', handleTouchMove, { passive: true });
lightbox.addEventListener('touchend', handleTouchEnd, { passive: true });

// Kopieren in die Zwischenablage
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Kopiert: " + text);
    }).catch(() => {
        alert("Kopieren fehlgeschlagen. Bitte manuell kopieren: " + text);
    });
}

// Smooth Scroll für interne Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Verhindert das Standardverhalten
        const targetId = this.getAttribute('href').substring(1); // Holt die Ziel-ID
        const targetElement = document.getElementById(targetId); // Findet das Ziel-Element

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth', // Sanftes Scrollen
                block: 'start' // Scrollt zum Anfang des Abschnitts
            });
        }
    });
});
