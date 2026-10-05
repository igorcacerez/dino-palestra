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
    keys: {},
    frameCount: 0
};

// Elementos do DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restart');

// Funções de desenho de objetos
function drawDino(x, y, width, height) {
    // Corpo do dinossauro
    ctx.fillStyle = '#2e8b57';
    ctx.fillRect(x, y, width, height);
    
    // Olho
    ctx.fillStyle = 'white';
    ctx.fillRect(x + 35, y + 15, 10, 10);
    ctx.fillStyle = 'black';
    ctx.fillRect(x + 38, y + 18, 4, 4);
    
    // Patas
    ctx.fillStyle = '#3cb371';
    ctx.fillRect(x + 10, y + height - 10, 15, 10);
    ctx.fillRect(x + 30, y + height - 10, 15, 10);
}

function drawMeteoro(x, y, width, height) {
    // Corpo do meteoro
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Detalhes do meteoro
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/2 - 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Brilho
    ctx.fillStyle = '#ff6347';
    ctx.beginPath();
    ctx.arc(x + width/3, y + height/3, width/6, 0, Math.PI * 2);
    ctx.fill();
}

function drawComida(x, y, width, height) {
    // Maçã
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2, width/2, height/1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Talinho
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + width/2 - 2, y - 5, 4, 5);
    
    // Folha
    ctx.fillStyle = '#32cd32';
    ctx.beginPath();
    ctx.moveTo(x + width/2, y - 5);
    ctx.lineTo(x + width/2 + 8, y - 15);
    ctx.lineTo(x + width/2 + 12, y - 10);
    ctx.fill();
}

function drawVida(x, y, width, height) {
    // Coração
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height);
    ctx.bezierCurveTo(
        x + width, y + height, 
        x + width, y, 
        x + width/2, y
    );
    ctx.bezierCurveTo(
        x, y, 
        x, y + height, 
        x + width/2, y + height
    );
    ctx.fill();
    
    // Brilho
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(x + width/3, y + height/3, width/6, 0, Math.PI * 2);
    ctx.fill();
}

// Restante do código permanece igual até a função draw...

function draw() {
    // Limpar canvas
    ctx.clearRect(0, 0, config.width, config.height);
    
    // Desenhar céu (gradiente)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, config.groundLevel);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F7FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, config.width, config.groundLevel);
    
    // Desenhar chão
    ctx.fillStyle = '#555';
    ctx.fillRect(0, config.groundLevel, config.width, config.height - config.groundLevel);
    
    // Desenhar dinossauro
    drawDino(100, gameState.positionY, config.dinoWidth, config.dinoHeight);
    
    // Desenhar obstáculos
    gameState.obstacles.forEach(obj => {
        if (obj.type === 'meteoro') {
            drawMeteoro(obj.x, obj.y, obj.width, obj.height);
        }
    });
    
    // Desenhar itens
    gameState.items.forEach(item => {
        if (item.type === 'comida') {
            drawComida(item.x, item.y, item.width, item.height);
        } else if (item.type === 'vida') {
            drawVida(item.x, item.y, item.width, item.height);
        }
    });
    
    // Nuvens de fundo (decoração)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 3; i++) {
        const cloudX = (gameState.frameCount * 0.5 + i * 300) % (config.width + 200) - 100;
        ctx.beginPath();
        ctx.arc(cloudX, 50, 20, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, 50, 25, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, 50, 20, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, 35, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Se game over, mostrar tela
    if (gameState.isGameOver) {
        gameOverElement.style.display = 'block';
    }
    
    gameState.frameCount++;
}


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

function drawAntes() {
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