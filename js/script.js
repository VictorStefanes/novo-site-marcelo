// Script principal do site
document.addEventListener("DOMContentLoaded", function () {
    // Alternância entre SVGs do logo
    const svg1 = document.getElementById("svg1");
    const svg2 = document.getElementById("svg2");
    let isSvg1Visible = true;

    if (svg1 && svg2) {
        svg1.classList.remove("hidden");
        svg2.classList.add("hidden");

        setInterval(function() {
            if (isSvg1Visible) {
                svg1.classList.add("hidden");
                svg2.classList.remove("hidden");
            } else {
                svg2.classList.add("hidden");
                svg1.classList.remove("hidden");
            }
            isSvg1Visible = !isSvg1Visible;
        }, 2500);
    }

    // Animação de scroll
    function handleScroll() {
        const section = document.querySelector('.main-section');
        const imagemMarcelo = document.querySelector('.imagem-marcelo');
        const textoContainer = document.querySelector('.texto-container');
        
        if (section && imagemMarcelo && textoContainer) {
            const sectionPosition = section.getBoundingClientRect();
            const isVisible = sectionPosition.top < window.innerHeight && sectionPosition.bottom >= 0;
            
            if (isVisible) {
                imagemMarcelo.classList.add('visible');
                textoContainer.classList.add('visible');
            }
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Botão de Login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'html/login.html';
        });
    }
});

// Funções para Property Cards
function contactAboutProperty(propertyId) {
    const message = 'Olá! Tenho interesse no imóvel ' + propertyId + '. Gostaria de mais informações.';
    const phoneNumber = '5582988780126';
    const url = 'https://wa.me/' + phoneNumber + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank');
}

function toggleFavorite(propertyId) {
    const button = event.target.closest('.btn-favorite');
    const heartIcon = button.querySelector('i');
    const isFavorite = heartIcon.classList.contains('fas');
    
    if (isFavorite) {
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        heartIcon.style.color = '#6c757d';
        button.setAttribute('title', 'Adicionar aos favoritos');
    } else {
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        heartIcon.style.color = '#e74c3c';
        button.setAttribute('title', 'Remover dos favoritos');
    }
}
