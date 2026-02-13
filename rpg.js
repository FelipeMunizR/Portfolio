// Aguarda o menu carregar antes de inicializar o RPG
document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('rpg-canvas');
    const ctx = canvas.getContext('2d');
    
    // UI Elements
    const dialogBox = document.getElementById('dialog-box');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogText = document.getElementById('dialog-text');

    // Variável de controle do loop
    let animationFrameId;
    let isGameRunning = false;
    let isDialogActive = false; // Pausa o jogador se estiver lendo

    // Controle de Teclado
    const keys = {
        w: false, a: false, s: false, d: false,
        ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
        Space: false
    };

    // O Jogador
    const player = {
        x: 400, y: 300,
        width: 32, height: 55,
        speed: 4,
        color: '#00ffff'
    };

    // Objetos do Cenário (Móveis, Estantes, etc)
    const interactables = [
        {
            x: 100, y: 100, width: 64, height: 87, color: '#ff5555',
            title: "O Computador",
            text: "Aqui é onde a mágica acontece... Aqui estão meus projetos da Unity, ."
        },
        {
            x: 600, y: 150, width: 80, height: 103, color: '#55ff55',
            title: "Estante de Livros",
            text: "Livros de filosofia... pedagogia... direito... inglês, fantasia e... programação?. Com certeza minha vida acadêmica é bem diversificada..."
        }
    ];

    // --- INPUTS ---
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key) || e.key === ' ') {
            if (e.key === ' ') keys.Space = true;
            else keys[e.key] = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key) || e.key === ' ') {
            if (e.key === ' ') {
                keys.Space = false;
                handleInteraction(); // Tenta interagir ou fechar diálogo ao soltar o espaço
            }
            else keys[e.key] = false;
        }
    });

    // --- LÓGICA DE INTERAÇÃO ---
    function handleInteraction() {
        if (isDialogActive) {
            // Se o diálogo está aberto, o espaço fecha ele
            closeDialog();
            return;
        }

        // Se o diálogo está fechado, verifica se está perto de algum objeto
        for (let obj of interactables) {
            // Cria uma "área de interação" um pouco maior que o objeto
            const reach = 20; 
            if (player.x < obj.x + obj.width + reach &&
                player.x + player.width > obj.x - reach &&
                player.y < obj.y + obj.height + reach &&
                player.y + player.height > obj.y - reach) {
                
                openDialog(obj.title, obj.text);
                break; // Interage apenas com o primeiro objeto próximo
            }
        }
    }

    function openDialog(title, text) {
        dialogTitle.innerText = title;
        dialogText.innerText = text;
        dialogBox.classList.remove('hidden');
        isDialogActive = true;
    }

    function closeDialog() {
        dialogBox.classList.add('hidden');
        isDialogActive = false;
    }

    // --- FÍSICA E COLISÃO (AABB) ---
    function checkCollision(newX, newY) {
        // Verifica limites do Canvas
        if (newX < 0 || newX + player.width > canvas.width || 
            newY < 0 || newY + player.height > canvas.height) {
            return true;
        }

        // Verifica colisão com os objetos do cenário
        for (let obj of interactables) {
            if (newX < obj.x + obj.width &&
                newX + player.width > obj.x &&
                newY < obj.y + obj.height &&
                newY + player.height > obj.y) {
                return true; // Bateu!
            }
        }
        return false; // Caminho livre
    }

    // --- UPDATE (Lógica de Movimento) ---
    function update() {
        if (!isGameRunning || isDialogActive) return; // Pausa física se estiver lendo

        let dx = 0;
        let dy = 0;

        if (keys.w || keys.ArrowUp) dy -= player.speed;
        if (keys.s || keys.ArrowDown) dy += player.speed;
        if (keys.a || keys.ArrowLeft) dx -= player.speed;
        if (keys.d || keys.ArrowRight) dx += player.speed;

        // Tenta mover no eixo X
        if (dx !== 0 && !checkCollision(player.x + dx, player.y)) {
            player.x += dx;
        }
        
        // Tenta mover no eixo Y separadamente (permite deslizar na parede)
        if (dy !== 0 && !checkCollision(player.x, player.y + dy)) {
            player.y += dy;
        }
    }

    // --- DRAW (Renderização Visual) ---
    function draw() {
        // Limpa a tela a cada frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha os objetos do cenário
        for (let obj of interactables) {
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // Desenha um contorno para indicar que é interativo
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x - 2, obj.y - 2, obj.width + 4, obj.height + 4);
        }

        // Desenha o jogador
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // --- O GAME LOOP ---
    function gameLoop() {
        update();
        draw();
        
        if (isGameRunning) {
            // Chama o próximo frame de forma otimizada pelo navegador
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    // --- EXPORTAR CONTROLES PARA O main.js ---
    // Colocamos as funções no window para o main.js poder iniciar/parar o jogo
    window.startRPG = function() {
        canvas.style.display = 'block';
        isGameRunning = true;
        player.x = 400; // Reseta a posição
        player.y = 300;
        gameLoop();
    };

    window.stopRPG = function() {
        canvas.style.display = 'none';
        isGameRunning = false;
        closeDialog();
        cancelAnimationFrame(animationFrameId);
    };

});