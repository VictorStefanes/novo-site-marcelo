const precoMin = document.getElementById("precoMin");
const precoMax = document.getElementById("precoMax");
const valorMin = document.getElementById("valorMin");
const valorMax = document.getElementById("valorMax");

precoMin.addEventListener("input", atualizarPrecos);
precoMax.addEventListener("input", atualizarPrecos);

function atualizarPrecos() {
    let min = parseInt(precoMin.value);
    let max = parseInt(precoMax.value);

    if (min > max) {
        precoMin.value = max;
        min = max;
    }

    valorMin.textContent = min.toLocaleString("pt-BR");
    valorMax.textContent = max.toLocaleString("pt-BR");
}

atualizarPrecos();

document.querySelectorAll('.property-card').forEach(card => {
    const slides = card.querySelectorAll('.property-slide');
    const prevButton = card.querySelector('.nav-arrow.prev');
    const nextButton = card.querySelector('.nav-arrow.next');
    let currentIndex = 0;

    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== currentIndex);
        });
    }

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides();
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides();
    });

    updateSlides(); // Inicializa o estado dos slides
});
