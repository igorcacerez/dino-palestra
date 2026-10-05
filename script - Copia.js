// Configurações do jogo
const config = {
    width: 800,
    height: 300,
    gravity: 0.5,
    jumpForce: -12,
    dinoWidth: 50,
    dinoHeight: 70,
    groundLevel: 250,
    gameSpeed: 5,
    speedIncrease: 0.005
};

// Estado do jogo
const gameState = {
    score: 0,
    lives: 3,
    speed: config.gameSpeed,
    isGameOver: false,
    isJumping: false,
    velocityY: 0,
    positionY: config.groundLevel - config.dinoHeight,
    obstacles: [],
    items: [],
    lastSpawnTime: 0,
    spawnInterval: 1500,
    keys: {}
};

// Elementos do DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restart');

// Sons (seriam carregados de arquivos reais)
const sounds = {
    jump: new Audio('assets/jump.mp3'),
    collect: new Audio('assets/collect.mp3'),
    hit: new Audio('assets/hit.mp3')
};

// Imagens (seriam carregadas de arquivos reais)
const images = {
    dino: new Image(),
    comida: new Image(),
    meteoro: new Image(),
    vida: new Image()
};

// Carregar imagens
images.dino.src = 'assets/dino.png';
images.comida.src = 'assets/comida.png';
images.meteoro.src = 'assets/meteoro.png';
images.vida.src = 'assets/vida.png';

// Event listeners
document.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;
    
    if (e.code === 'Space' && gameState.isGameOver) {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
});

restartButton.addEventListener('click', restartGame);

// Funções do jogo
function update() {
    if (gameState.isGameOver) return;

    // Movimento do dinossauro
    if (gameState.keys['ArrowUp'] && !gameState.isJumping) {
        gameState.velocityY = config.jumpForce;
        gameState.isJumping = true;
        sounds.jump.play();
    }

    // Aplicar gravidade
    gameState.velocityY += config.gravity;
    gameState.positionY += gameState.velocityY;

    // Verificar se está no chão
    if (gameState.positionY >= config.groundLevel - config.dinoHeight) {
        gameState.positionY = config.groundLevel - config.dinoHeight;
        gameState.velocityY = 0;
        gameState.isJumping = false;
    }

    // Aumentar dificuldade
    gameState.speed += config.speedIncrease;

    // Gerar obstáculos e itens
    const now = Date.now();
    if (now - gameState.lastSpawnTime > gameState.spawnInterval) {
        spawnObject();
        gameState.lastSpawnTime = now;
        // Diminuir intervalo de spawn com o tempo
        gameState.spawnInterval = Math.max(500, 1500 - gameState.score * 2);
    }

    // Mover obstáculos e itens
    gameState.obstacles.forEach((obj, index) => {
        obj.x -= gameState.speed;
        
        // Verificar colisão com dinossauro
        if (checkCollision(
            {x: 100, y: gameState.positionY, width: config.dinoWidth, height: config.dinoHeight},
            obj
        )) {
            if (obj.type === 'meteoro') {
                gameState.lives--;
                sounds.hit.play();
                updateLivesDisplay();
                if (gameState.lives <= 0) {
                    gameOver();
                }
            }
            gameState.obstacles.splice(index, 1);
        }
    });

    gameState.items.forEach((item, index) => {
        item.x -= gameState.speed;
        
        // Verificar colisão com dinossauro
        if (checkCollision(
            {x: 100, y: gameState.positionY, width: config.dinoWidth, height: config.dinoHeight},
            item
        )) {
            if (item.type === 'comida') {
                gameState.score += 10;
                sounds.collect.play();
            } else if (item.type === 'vida') {
                gameState.lives = Math.min(3, gameState.lives + 1);
                sounds.collect.play();
                updateLivesDisplay();
            }
            gameState.items.splice(index, 1);
        }
    });

    // Remover objetos que saíram da tela
    gameState.obstacles = gameState.obstacles.filter(obj => obj.x + obj.width > 0);
    gameState.items = gameState.items.filter(item => item.x + item.width > 0);

    // Atualizar display
    scoreElement.textContent = `Pontos: ${gameState.score}`;
}

function draw() {
    // Limpar canvas
    ctx.clearRect(0, 0, config.width, config.height);
    
    // Desenhar chão
    ctx.fillStyle = '#555';
    ctx.fillRect(0, config.groundLevel, config.width, config.height - config.groundLevel);
    
    // Desenhar dinossauro
    ctx.drawImage(
        images.dino, 
        100, 
        gameState.positionY, 
        config.dinoWidth, 
        config.dinoHeight
    );
    
    // Desenhar obstáculos
    gameState.obstacles.forEach(obj => {
        ctx.drawImage(
            images[obj.type],
            obj.x,
            obj.y,
            obj.width,
            obj.height
        );
    });
    
    // Desenhar itens
    gameState.items.forEach(item => {
        ctx.drawImage(
            images[item.type],
            item.x,
            item.y,
            item.width,
            item.height
        );
    });
    
    // Se game over, mostrar tela
    if (gameState.isGameOver) {
        gameOverElement.style.display = 'block';
    }
}

function spawnObject() {
    const random = Math.random();
    
    if (random < 0.6) { // 60% de chance de obstáculo
        const isMeteoro = Math.random() > 0.3;
        const type = isMeteoro ? 'meteoro' : 'meteoro'; // Poderia ter outros tipos
        
        gameState.obstacles.push({
            type: type,
            x: config.width,
            y: config.groundLevel - (isMeteoro ? 40 : 30),
            width: isMeteoro ? 40 : 30,
            height: isMeteoro ? 40 : 30
        });
    } else { // 40% de chance de item
        const isVida = Math.random() > 0.8 && gameState.lives < 3; // 20% dos itens são vidas, se precisar
        const type = isVida ? 'vida' : 'comida';
        
        gameState.items.push({
            type: type,
            x: config.width,
            y: config.groundLevel - (isVida ? 30 : 40),
            width: isVida ? 30 : 40,
            height: isVida ? 30 : 40
        });
    }
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function updateLivesDisplay() {
    livesElement.textContent = 'Vidas: ' + '❤️'.repeat(gameState.lives);
}

function gameOver() {
    gameState.isGameOver = true;
    finalScoreElement.textContent = `Pontuação: ${gameState.score}`;
}

function restartGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.speed = config.gameSpeed;
    gameState.isGameOver = false;
    gameState.isJumping = false;
    gameState.velocityY = 0;
    gameState.positionY = config.groundLevel - config.dinoHeight;
    gameState.obstacles = [];
    gameState.items = [];
    gameState.lastSpawnTime = Date.now();
    gameState.spawnInterval = 1500;
    
    updateLivesDisplay();
    scoreElement.textContent = `Pontos: 0`;
    gameOverElement.style.display = 'none';
}

// Loop do jogo
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Iniciar jogo
updateLivesDisplay();
gameLoop();