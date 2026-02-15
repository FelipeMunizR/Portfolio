document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('rpg-canvas');
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;
    
    // --- NOVO CÓDIGO: CARREGANDO A IMAGEM ---
    const playerImage = new Image();
    playerImage.src = 'Playerportfolio.png'; // Certifique-se que o nome está igual!

    // Configuração da sua Grade (Grid)
    const spriteW = 32; // Largura de UM quadradinho (boneco)
    const spriteH = 32; // Altura de UM quadradinho (boneco)

    // UI Elements
    const dialogBox = document.getElementById('dialog-box');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogText = document.getElementById('dialog-text');

    // Variáveis de controle
    let animationFrameId;
    let isGameRunning = false;
    let isDialogActive = false;
    
    // Controle de Animação (Frame Counter)
    let gameFrame = 0;

    const keys = {
        w: false, a: false, s: false, d: false,
        ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
        Space: false
    };

    const player = {
        x: 300, y: 200,
        width: 48, height: 64, // Tamanho do boneco
        speed: 4,
        direction: 'down', // Começa olhando pra baixo
        isMoving: false,
        frameX: 0, // Qual passo ele está dando (0, 1 ou 2)
        frameY: 0  // Qual linha ele está usando (0, 1, 2 ou 3)
    };

    // MAPA DAS LINHAS (Baseado na sua imagem)
    const directionRows = {
        'down': 0,  // Linha 0
        'left': 1, // Linha 1
        'right': 2,  // Linha 2
        'up': 3     // Linha 3
    };

    const interactables = [
        {
            x: 100, y: 100, width: 40, height: 70, 
            type: 'computer', // Tipo define o desenho
            title: "O Computador",
            text: "Aqui é onde a mágica acontece... Projetos Unity, C#, roteiros e muito café."
        },
        {
            x: 600, y: 150, width: 50, height: 80, 
            type: 'bookshelf',
            title: "Estante de Livros",
            text: "Filosofia, Pedagogia, Direito e Código Limpo. Uma mistura caótica e necessária."
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
                handleInteraction();
            }
            else keys[e.key] = false;
        }
    });

    // --- LÓGICA DE INTERAÇÃO ---
    function handleInteraction() {
        if (isDialogActive) {
            closeDialog();
            return;
        }

        for (let obj of interactables) {
            const reach = 30; // Alcance um pouco maior
            if (player.x < obj.x + obj.width + reach &&
                player.x + player.width > obj.x - reach &&
                player.y < obj.y + obj.height + reach &&
                player.y + player.height > obj.y - reach) {
                
                // Olha para o objeto ao interagir
                if (player.y > obj.y) player.direction = 'up';
                else if (player.y < obj.y) player.direction = 'down';
                
                openDialog(obj.title, obj.text);
                break;
            }
        }
    }

    function openDialog(title, text) {
        dialogTitle.innerText = title;
        dialogText.innerText = text;
        dialogBox.classList.remove('hidden');
        isDialogActive = true;
        // Para o boneco imediatamente
        player.isMoving = false;
    }

    function closeDialog() {
        dialogBox.classList.add('hidden');
        isDialogActive = false;
    }

    // --- COLISÃO ---
    function checkCollision(newX, newY) {
        if (newX < 0 || newX + player.width > canvas.width || 
            newY < 0 || newY + player.height > canvas.height) {
            return true;
        }
        for (let obj of interactables) {
            // Caixa de colisão levemente menor que o desenho para dar sensação de profundidade (2.5D)
            const collisionY = obj.y + (obj.height / 2); // Só bate da metade pra baixo
            const collisionH = obj.height / 2;

            if (newX < obj.x + obj.width &&
                newX + player.width > obj.x &&
                newY + player.height > collisionY && // Pé do jogador
                newY + player.height < collisionY + collisionH + 10) { // +10 margem
                return true;
            }
        }
        return false;
    }

    // --- UPDATE ---
    function update() {
        if (!isGameRunning || isDialogActive) return;

        let dx = 0;
        let dy = 0;

        // Reset estado de movimento
        player.isMoving = false;

        // Definir direção e movimento
        if (keys.w || keys.ArrowUp) { dy -= player.speed; player.direction = 'up'; player.isMoving = true; }
        if (keys.s || keys.ArrowDown) { dy += player.speed; player.direction = 'down'; player.isMoving = true; }
        if (keys.a || keys.ArrowLeft) { dx -= player.speed; player.direction = 'left'; player.isMoving = true; }
        if (keys.d || keys.ArrowRight) { dx += player.speed; player.direction = 'right'; player.isMoving = true; }

        // Atualizar ciclo de caminhada
        if (player.isMoving) {
            player.walkFrame++;
        } else {
            player.walkFrame = 0; // Para com as pernas juntas
        }

        if (dx !== 0 && !checkCollision(player.x + dx, player.y)) player.x += dx;
        if (dy !== 0 && !checkCollision(player.x, player.y + dy)) player.y += dy;
    }

    // --- SISTEMA DE DESENHO (SPRITES SIMULADOS) ---
    
    function drawComputer(obj) {
        // Mesa
        ctx.fillStyle = '#8B4513'; // Marrom madeira
        ctx.fillRect(obj.x, obj.y + 30, obj.width, obj.height - 30);
        
        // Monitor (Base)
        ctx.fillStyle = '#333';
        ctx.fillRect(obj.x + 10, obj.y + 20, 20, 10);
        // Monitor (Tela)
        ctx.fillStyle = '#000';
        ctx.fillRect(obj.x + 2, obj.y, 36, 25);
        ctx.fillStyle = '#00ffff'; // Brilho da tela
        ctx.fillRect(obj.x + 4, obj.y + 2, 32, 21);
        
        // Teclado
        ctx.fillStyle = '#555';
        ctx.fillRect(obj.x + 5, obj.y + 35, 30, 8);
    }

    function drawBookshelf(obj) {
        // Corpo da estante
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Prateleiras
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(obj.x + 2, obj.y + 20, obj.width - 4, 2);
        ctx.fillRect(obj.x + 2, obj.y + 40, obj.width - 4, 2);
        ctx.fillRect(obj.x + 2, obj.y + 60, obj.width - 4, 2);

        // Livros (Cores aleatórias fixas pela posição)
        const colors = ['#F44336', '#2196F3', '#FFEB3B', '#4CAF50'];
        // Desenhando "livros" simples
        ctx.fillStyle = colors[0]; ctx.fillRect(obj.x + 5, obj.y + 5, 5, 15);
        ctx.fillStyle = colors[1]; ctx.fillRect(obj.x + 12, obj.y + 5, 5, 15);
        ctx.fillStyle = colors[2]; ctx.fillRect(obj.x + 5, obj.y + 25, 5, 15);
        ctx.fillStyle = colors[3]; ctx.fillRect(obj.x + 25, obj.y + 45, 10, 15);
    }

    function drawPlayer() {
        // 1. DESCOBRIR QUAL LINHA (Y) USAR
        // O código olha a direção atual ('left', 'up', etc) e pega o número da linha correspondente
        player.frameY = directionRows[player.direction];

        // 2. DESCOBRIR QUAL COLUNA (X) USAR (Animação)
        if (player.isMoving) {
            // gameFrame aumenta sem parar.
            // Dividir por 10 deixa a animação mais lenta (para não piscar muito rápido).
            // O % 3 faz o número "girar" entre 0, 1 e 2 (porque você tem 3 desenhos por linha).
            player.frameX = Math.floor(gameFrame / 10) % 3;
        } else {
            player.frameX = 0; // Se parar, volta para a pose parada (coluna 0)
        }

        // 3. O COMANDO DE DESENHO
        ctx.drawImage(
            playerImage,             // A: Quem eu vou cortar? (Sua imagem)
            
            // --- O RECORTE (SOURCE) ---
            player.frameX * spriteW, // B: Onde começa o corte X (Coluna * 32)
            player.frameY * spriteH, // C: Onde começa o corte Y (Linha * 32)
            spriteW,                 // D: Largura do corte (32px)
            spriteH,                 // E: Altura do corte (32px)
            
            // --- A COLAGEM (DESTINATION) ---
            player.x,                // F: Onde colar na tela X
            player.y,                // G: Onde colar na tela Y
            player.width * 2,        // H: Largura final (Multipliquei por 2 pra dar Zoom)
            player.height * 2        // I: Altura final (Zoom)
        );
    }

    // --- DRAW ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fundo (Chão de madeira simples)
        ctx.fillStyle = '#4e4e4e'; // Cinza escuro
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Grid do chão (opcional, para dar perspectiva)
        ctx.strokeStyle = '#555';
        ctx.beginPath();
        for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); }
        for(let i=0; i<canvas.height; i+=40) { ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); }
        ctx.stroke();

        // Desenhar Objetos
        // DICA: Desenhamos na ordem do Y para criar "fake 3D" (o que está mais embaixo cobre o que está em cima)
        
        // Cria lista de tudo que precisa ser desenhado (Objetos + Jogador)
        const renderList = [...interactables, { ...player, type: 'player' }];
        
        // Ordena por Y (quem tem Y maior é desenhado por último, ficando "na frente")
        renderList.sort((a, b) => (a.y + a.height) - (b.y + b.height));

        for (let item of renderList) {
            if (item.type === 'computer') drawComputer(item);
            else if (item.type === 'bookshelf') drawBookshelf(item);
            else if (item.type === 'player') drawPlayer();
        }
    }

    // --- GAME LOOP ---
    function gameLoop() {
        update();
        draw();
        gameFrame++;
        if (isGameRunning) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    // --- WINDOW EXPORTS ---
    window.startRPG = function() {
        canvas.style.display = 'block';
        isGameRunning = true;
        // Centraliza
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height / 2 - player.height / 2;
        player.direction = 'down';
        gameLoop();
    };

    window.stopRPG = function() {
        canvas.style.display = 'none';
        isGameRunning = false;
        closeDialog();
        cancelAnimationFrame(animationFrameId);
    };

});