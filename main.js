document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos das telas
    const titleScreen = document.getElementById('title-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const gameScreen = document.getElementById('game-screen');
    
    // Botões e interações
    const startBtn = document.getElementById('start-btn');
    const backBtn = document.getElementById('back-to-menu');
    const cartridges = document.querySelectorAll('.cartridge');
    const loadingText = document.getElementById('loading-text');

    // Função auxiliar para trocar telas
    function showScreen(screenToShow) {
        // Remove 'active' de todas
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        // Adiciona 'active' na desejada
        screenToShow.classList.add('active');
    }

    // 1. Clique no PRESS START -> Vai para o Menu Principal
    startBtn.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

   // 2. Clique em um Cartucho -> Vai para a tela de jogo
    cartridges.forEach(cart => {
        cart.addEventListener('click', (e) => {
            const gameType = cart.getAttribute('data-game');
            showScreen(gameScreen);

            if (gameType === 'about-rpg') {
                // Inicia o motor do RPG que criamos no rpg.js
                window.startRPG();
            } else {
                // Para os outros jogos (ainda não feitos)
                document.getElementById('loading-text').innerText = "EM DESENVOLVIMENTO...";
                document.getElementById('loading-text').style.display = 'block';
            }
        });
    });

    // 3. Clique em Exit Game -> Volta para o Menu Principal
    backBtn.addEventListener('click', () => {
        // Para o jogo se estiver rodando
        if (typeof window.stopRPG === 'function') {
            window.stopRPG();
        }
        document.getElementById('loading-text').style.display = 'none';
        showScreen(mainMenuScreen);
    });

});