document.addEventListener("DOMContentLoaded", function () {
    // Alternância entre SVGs
    const svg1 = document.getElementById("svg1");
    const svg2 = document.getElementById("svg2");
    let isSvg1Visible = true;

    // Inicialmente, exiba apenas o primeiro SVG
    svg1.classList.remove("hidden");
    svg2.classList.add("hidden");

    setInterval(() => {
        if (isSvg1Visible) {
            svg1.classList.add("hidden");
            svg2.classList.remove("hidden");
        } else {
            svg2.classList.add("hidden");
            svg1.classList.remove("hidden");
        }
        isSvg1Visible = !isSvg1Visible;
    }, 2500);

    // Função para lidar com o scroll
    function handleScroll() {
        const section = document.querySelector('.main-section');
        const imagemMarcelo = document.querySelector('.imagem-marcelo');
        const textoContainer = document.querySelector('.texto-container');
        const sectionPosition = section.getBoundingClientRect();

        const isVisible = sectionPosition.top < window.innerHeight && sectionPosition.bottom >= 0;
        if (isVisible) {
            imagemMarcelo.classList.add('visible');
            textoContainer.classList.add('visible');
        } else {
            imagemMarcelo.classList.remove('visible');
            textoContainer.classList.remove('visible');
        }
    }

    // Adiciona o evento de scroll
    window.addEventListener('scroll', handleScroll);

    // Script para enviar a pesquisa e exibir os resultados
    document.getElementById('search-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        const queryString = new URLSearchParams(formData).toString();

        fetch(`/search?${queryString}`)
            .then(response => response.json())
            .then(data => {
                const resultadosDiv = document.getElementById('resultados');
                resultadosDiv.innerHTML = '';
                if (data.length === 0) {
                    resultadosDiv.innerHTML = '<p>Nenhum resultado encontrado.</p>';
                } else {
                    data.forEach(imovel => {
                        const imovelDiv = document.createElement('div');
                        imovelDiv.classList.add('imovel');
                        imovelDiv.innerHTML = `
                            <h3>${imovel.titulo}</h3>
                            <p>${imovel.descricao}</p>
                            <p>Preço: ${imovel.preco}</p>
                            <p>Categoria: ${imovel.categoria}</p>
                        `;
                        resultadosDiv.appendChild(imovelDiv);
                    });
                }
            });
    });

});

/**
 * Classe principal que controla o carrossel de propriedades
 */
class PropertyCarousel {
    /**
     * @param {HTMLElement} container - Elemento raiz do card de propriedade
     */
    constructor(container) {
        this.container = container;
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 segundos

        this.initElements();
        this.initEvents();
        this.updateCarousel();
    }

    /**
     * Inicializa referências aos elementos DOM
     */
    initElements() {
        this.prevBtn = this.container.querySelector('.nav-arrow.prev');
        this.nextBtn = this.container.querySelector('.nav-arrow.next');
        this.dots = Array.from(this.container.querySelectorAll('.dot'));
        this.slides = Array.from(this.container.querySelectorAll('.property-slide'));

        if (!this.slides.length) {
            console.warn('Nenhum slide encontrado no carrossel', this.container);
        }
    }

    /**
     * Configura os event listeners
     */
    initEvents() {
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Eventos para acessibilidade
        this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Autoplay opcional
        this.startAutoPlay();

        // Pausar autoplay quando o mouse estiver sobre o carrossel
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    /**
     * Navega para o slide anterior
     */
    prevSlide() {
        this.currentIndex = (this.currentIndex > 0)
            ? this.currentIndex - 1
            : this.slides.length - 1;
        this.updateCarousel();
    }

    /**
     * Navega para o próximo slide
     */
    nextSlide() {
        this.currentIndex = (this.currentIndex < this.slides.length - 1)
            ? this.currentIndex + 1
            : 0;
        this.updateCarousel();
    }

    /**
     * Vai para um slide específico
     * @param {number} index - Índice do slide desejado
     */
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentIndex = index;
            this.updateCarousel();
        }
    }

    /**
     * Atualiza a exibição do carrossel
     */
    updateCarousel() {
        // Esconde todos os slides
        this.slides.forEach((slide, index) => {
            const isActive = index === this.currentIndex;
            slide.style.display = isActive ? 'block' : 'none';
            slide.setAttribute('aria-hidden', !isActive);
        });

        // Atualiza os dots
        this.dots.forEach((dot, index) => {
            const isActive = index === this.currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive);
        });

        // Atualiza ARIA live region para leitores de tela
        this.updateLiveRegion();
    }

    /**
     * Inicia o autoplay do carrossel
     */
    startAutoPlay() {
        if (this.autoPlayInterval) return;

        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    /**
     * Para o autoplay do carrossel
     */
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    /**
     * Manipula eventos de teclado para acessibilidade
     * @param {KeyboardEvent} event 
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowLeft':
                this.prevSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
            case 'Home':
                this.goToSlide(0);
                break;
            case 'End':
                this.goToSlide(this.slides.length - 1);
                break;
        }
    }

    /**
     * Atualiza a região ARIA para leitores de tela
     */
    updateLiveRegion() {
        const liveRegion = this.container.querySelector('.carousel-live-region') ||
            this.createLiveRegion();

        liveRegion.textContent = `Slide ${this.currentIndex + 1} de ${this.slides.length}`;
    }

    /**
     * Cria uma região ARIA live se não existir
     * @returns {HTMLElement}
     */
    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.className = 'carousel-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.overflow = 'hidden';
        liveRegion.style.clip = 'rect(0 0 0 0)';
        liveRegion.style.height = '1px';
        liveRegion.style.width = '1px';
        liveRegion.style.margin = '-1px';
        liveRegion.style.padding = '0';
        liveRegion.style.border = '0';

        this.container.appendChild(liveRegion);
        return liveRegion;
    }
}

// Inicializa todos os carrosseis na página
document.addEventListener('DOMContentLoaded', () => {
    const propertyCards = document.querySelectorAll('.property-card');

    propertyCards.forEach(card => {
        try {
            new PropertyCarousel(card);
        } catch (error) {
            console.error('Erro ao inicializar carrossel:', error);
        }
    });
});

// Função para mover o carrossel horizontalmente de acordo com o seletor
function scrollCarouselBySelector(selector, direction) {
    const carousel = document.querySelector(selector);
    if (!carousel) return;
    const scrollAmount = carousel.offsetWidth * 0.7;
    if (direction === 'left') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Setas da seção principal (Mais Procurados)
const leftArrow = document.querySelector('.carousel-arrow.custom-arrow.left:not(.lancamentos-arrow):not(.pronto-arrow)');
const rightArrow = document.querySelector('.carousel-arrow.custom-arrow.right:not(.lancamentos-arrow):not(.pronto-arrow)');
if (leftArrow && rightArrow) {
    leftArrow.addEventListener('click', () => scrollCarouselBySelector('.carousel-cards', 'left'));
    rightArrow.addEventListener('click', () => scrollCarouselBySelector('.carousel-cards', 'right'));
}

// Setas da seção Lançamentos
const lancLeft = document.querySelector('.carousel-arrow.custom-arrow.left.lancamentos-arrow');
const lancRight = document.querySelector('.carousel-arrow.custom-arrow.right.lancamentos-arrow');
if (lancLeft && lancRight) {
    lancLeft.addEventListener('click', () => scrollCarouselBySelector('.lancamentos-cards', 'left'));
    lancRight.addEventListener('click', () => scrollCarouselBySelector('.lancamentos-cards', 'right'));
}

// Setas da seção Pronto para Morar
const prontoLeft = document.querySelector('.carousel-arrow.custom-arrow.left.pronto-arrow');
const prontoRight = document.querySelector('.carousel-arrow.custom-arrow.right.pronto-arrow');
if (prontoLeft && prontoRight) {
    prontoLeft.addEventListener('click', () => scrollCarouselBySelector('.pronto-cards', 'left'));
    prontoRight.addEventListener('click', () => scrollCarouselBySelector('.pronto-cards', 'right'));
}