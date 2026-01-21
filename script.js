document.addEventListener('DOMContentLoaded', () => {
    
    const star = document.getElementById('starTrigger');
    const body = document.body;
    const content = document.querySelector('.content'); // Seleciona o texto
    const menu = document.getElementById('menuNav');    // Seleciona a área do menu

    function triggerExplosion() {
        // 1. Explosão inicial
        star.classList.add('boom');
        body.classList.add('exploded');

        // 2. Agendar a movimentação do texto para cima
        // Esperamos 2500ms (2.5s) para dar tempo do texto aparecer e ser lido
        setTimeout(() => {
            // Sobe o texto
            content.classList.add('move-up');
            
            // Mostra a área dos botões (opcionalmente com um leve delay extra)
            setTimeout(() => {
                menu.classList.add('show');
            }, 500); // Menu aparece 0.5s depois do texto começar a subir

        }, 2500); 
    }

    star.addEventListener('click', triggerExplosion);

});