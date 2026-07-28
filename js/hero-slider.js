/**
 * HERO SLIDER — Lishaq Solutions
 * Premium hero slider with autoplay, keyboard, swipe, and progress indicators
 */

(function() {
    'use strict';

    // --- DOM Elements ---
    const container = document.getElementById('heroSlidesContainer');
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-progress-dot');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    const slider = document.getElementById('heroSlider');

    // --- State ---
    let current = 0;
    const total = slides.length;
    let autoPlayInterval = null;
    let isPaused = false;
    let isTransitioning = false;

    // --- Guard: if elements are missing, exit ---
    if (!container || !slides.length || !dots.length || !slider) {
        console.warn('Hero slider: Required elements not found. Aborting.');
        return;
    }

    // --- Core Functions ---

    /**
     * Navigate to a specific slide index
     */
    function goTo(index) {
        // Prevent rapid-fire transitions
        if (isTransitioning) return;

        // Wrap around
        if (index < 0) index = total - 1;
        else if (index >= total) index = 0;

        // If already at target, do nothing
        if (index === current) return;

        isTransitioning = true;
        current = index;

        // Move the slides container
        container.style.transform = `translateX(-${current * 100}%)`;

        // Update dots / progress bars
        dots.forEach((dot, i) => {
            const isActive = i === current;
            dot.classList.toggle('active', isActive);
            const bar = dot.querySelector('.hero-bar');
            if (!bar) return;

            if (isActive) {
                // Reset and animate the bar
                bar.style.transition = 'none';
                bar.style.width = '0%';
                requestAnimationFrame(() => {
                    bar.style.transition = 'width 6s linear';
                    bar.style.width = '100%';
                });
            } else {
                bar.style.transition = 'none';
                bar.style.width = '0%';
            }
        });

        // Update ARIA attributes
        slides.forEach((s, i) => {
            s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
        });

        // Allow transition to complete
        setTimeout(() => {
            isTransitioning = false;
        }, 850);
    }

    /**
     * Go to next slide
     */
    function nextSlide() {
        if (isTransitioning) return;
        goTo(current + 1);
    }

    /**
     * Go to previous slide
     */
    function prevSlide() {
        if (isTransitioning) return;
        goTo(current - 1);
    }

    /**
     * Reset / restart autoplay
     */
    function resetAutoplay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        if (!isPaused) {
            autoPlayInterval = setInterval(nextSlide, 6000);
        }
    }

    /**
     * Pause autoplay
     */
    function pauseAutoplay() {
        isPaused = true;
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    /**
     * Resume autoplay
     */
    function resumeAutoplay() {
        isPaused = false;
        resetAutoplay();
    }

    // --- Event Listeners ---

    // --- Hover: pause on hover, resume on leave ---
    slider.addEventListener('mouseenter', pauseAutoplay);
    slider.addEventListener('mouseleave', resumeAutoplay);

    // --- Dot clicks ---
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', function() {
            if (idx === current) return;
            goTo(idx);
            resetAutoplay();
        });

        dot.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (idx === current) return;
                goTo(idx);
                resetAutoplay();
            }
        });
    });

    // --- Arrow buttons ---
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            nextSlide();
            resetAutoplay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            prevSlide();
            resetAutoplay();
        });
    }

    // --- Keyboard support ---
    document.addEventListener('keydown', function(e) {
        // Only if slider is in viewport (optional: check if slider is visible)
        const rect = slider.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isVisible) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
            resetAutoplay();
        }
    });

    // --- Swipe support (touch) ---
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchmove', function(e) {
        // Optional: prevent default to avoid page scroll while swiping
        // Only prevent if horizontal swipe is detected
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(deltaX) > 20) {
            // e.preventDefault(); // Uncomment if you want to block vertical scroll during swipe
        }
    }, { passive: true });

    slider.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetAutoplay();
        }
    }, { passive: true });

    // --- Visibility change (pause when tab hidden) ---
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            pauseAutoplay();
        } else {
            resumeAutoplay();
        }
    });

    // --- Window resize: maintain progress bar consistency ---
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Re-trigger progress bar animation for the active slide
            const activeDot = dots[current];
            if (activeDot) {
                const bar = activeDot.querySelector('.hero-bar');
                if (bar) {
                    bar.style.transition = 'none';
                    bar.style.width = '0%';
                    requestAnimationFrame(() => {
                        bar.style.transition = 'width 6s linear';
                        bar.style.width = '100%';
                    });
                }
            }
        }, 300);
    });

    // --- Initialize ---
    function init() {
        // Set initial position
        container.style.transform = 'translateX(0%)';

        // Set initial active dot and progress bar
        dots.forEach((dot, i) => {
            const isActive = i === 0;
            dot.classList.toggle('active', isActive);
            const bar = dot.querySelector('.hero-bar');
            if (bar) {
                if (isActive) {
                    bar.style.transition = 'none';
                    bar.style.width = '0%';
                    requestAnimationFrame(() => {
                        bar.style.transition = 'width 6s linear';
                        bar.style.width = '100%';
                    });
                } else {
                    bar.style.transition = 'none';
                    bar.style.width = '0%';
                }
            }
        });

        // Set initial ARIA
        slides.forEach((s, i) => {
            s.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
        });

        // Start autoplay
        resetAutoplay();
    }

    init();

})();