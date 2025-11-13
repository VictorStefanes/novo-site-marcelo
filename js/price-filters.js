/**
 * SISTEMA DE FILTROS DE PREÇO
 * Para ser usado nas páginas específicas (mais-procurados, lancamentos, etc.)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Atualização dos filtros de preço
    const precoMin = document.getElementById("precoMin");
    const precoMax = document.getElementById("precoMax");
    const valorMin = document.getElementById("valorMin");
    const valorMax = document.getElementById("valorMax");

    if (precoMin && precoMax && valorMin && valorMax) {
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

        // Inicializa os valores
        atualizarPrecos();
    }
});