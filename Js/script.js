
class ImageSlider {
    constructor(selector) {
        this.slider = document.querySelector(selector);

        if (!this.slider) return;

        this.track = this.slider.querySelector(".slider-track");
        this.dotsContainer = document.querySelector(".dots");
        this.prevBtn = this.slider.querySelector(".prev");
        this.nextBtn = this.slider.querySelector(".next");

        this.originalSlides = Array.from(this.track.children);
        this.totalSlides = this.originalSlides.length;

        this.currentIndex = 0;
        this.isAnimating = false;
        this.transitionDuration = 500;
        this.autoSlideInterval = null;

        if (this.totalSlides === 0 || !this.dotsContainer) {
            return;
        }

        this.init();
    }

    init() {
        // Clone the first and last images for infinite looping.
        const firstClone =
            this.originalSlides[0].cloneNode(true);

        const lastClone =
            this.originalSlides[this.totalSlides - 1].cloneNode(true);

        this.track.prepend(lastClone);
        this.track.append(firstClone);

        this.slides = Array.from(this.track.children);

        this.createDots();

        // Start at the first original image.
        this.track.style.transition = "none";
        this.updatePosition();
        this.updateDots();

        this.bindEvents();

        // Enable sliding animation after initialization.
        requestAnimationFrame(() => {
            this.track.style.transition =
                `transform ${this.transitionDuration}ms ease-in-out`;
        });

        // Start automatic sliding.
        this.startAutoSlide();
    }

    updatePosition() {
        const width = this.slider.clientWidth;

        this.track.style.transform =
            `translateX(-${(this.currentIndex + 1) * width}px)`;
    }

    nextSlide() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.currentIndex++;

        this.updatePosition();
        this.updateDots();
    }

    prevSlide() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.currentIndex--;

        this.updatePosition();
        this.updateDots();
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) {
            return;
        }

        this.isAnimating = true;
        this.currentIndex = index;

        this.updatePosition();
        this.updateDots();
    }

    createDots() {
        this.dotsContainer.innerHTML = "";
        this.dots = [];

        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "dot";
            dot.setAttribute(
                "aria-label",
                `Go to image ${i + 1}`
            );

            dot.addEventListener("click", () => {
                this.goToSlide(i);
                this.restartAutoSlide();
            });

            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        }
    }

    updateDots() {
        const activeIndex =
            (this.currentIndex + this.totalSlides) % this.totalSlides;

        this.dots.forEach((dot, index) => {
            const active = index === activeIndex;

            dot.classList.toggle("active", active);

            if (active) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    bindEvents() {
        this.nextBtn.addEventListener("click", () => {
            this.nextSlide();
            this.restartAutoSlide();
        });

        this.prevBtn.addEventListener("click", () => {
            this.prevSlide();
            this.restartAutoSlide();
        });

        // Handle the end of each slide transition.
        this.track.addEventListener("transitionend", (event) => {
            if (
                event.target !== this.track ||
                event.propertyName !== "transform"
            ) {
                return;
            }

            // Wrap from the clone after the last image.
            if (this.currentIndex === this.totalSlides) {
                this.currentIndex = 0;
                this.resetPosition();
            }

            // Wrap from the clone before the first image.
            else if (this.currentIndex === -1) {
                this.currentIndex = this.totalSlides - 1;
                this.resetPosition();
            }

            this.isAnimating = false;
            this.updateDots();
        });

        // Recalculate the slide position when the window changes size.
        window.addEventListener("resize", () => {
            this.track.style.transition = "none";
            this.updatePosition();

            requestAnimationFrame(() => {
                this.track.style.transition =
                    `transform ${this.transitionDuration}ms ease-in-out`;
            });
        });

        // Pause while the mouse is over the slider.
        this.slider.addEventListener("mouseenter", () => {
            this.stopAutoSlide();
        });

        // Resume when the mouse leaves the slider.
        this.slider.addEventListener("mouseleave", () => {
            this.startAutoSlide();
        });

        // Pause when the browser tab is hidden.
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stopAutoSlide();
            } else {
                this.startAutoSlide();
            }
        });
    }

    resetPosition() {
        this.track.style.transition = "none";
        this.updatePosition();

        // Force the browser to apply the reset immediately.
        void this.track.offsetWidth;

        this.track.style.transition =
            `transform ${this.transitionDuration}ms ease-in-out`;
    }

    startAutoSlide() {
        this.stopAutoSlide();

        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval !== null) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    restartAutoSlide() {
        this.startAutoSlide();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new ImageSlider(".slider");
});
