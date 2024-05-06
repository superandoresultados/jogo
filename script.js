const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const shipSize = 50;
const shipSpeed = 5;
let shipX = (canvasWidth - shipSize) / 2;
let shipY = canvasHeight - shipSize - 10;
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const bulletWidth = 5;
const bulletHeight = 15;
const bulletSpeed = 5;
let bullets = [];

const yellowMeteorWidth = 30;
const yellowMeteorHeight = 30;
const greenMeteorWidth = 45;
const greenMeteorHeight = 45;
const redMeteorWidth = 60;
const redMeteorHeight = 60;
const meteorSpeed = 2;
let meteors = [];

let score = 0;
let phase = 1;
let phaseMessage = '';
let phaseStartTime = 0;
let gameEnded = false;

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  drawShip();
  drawBullets();
  drawMeteors();
  drawScore();
  drawWinMessage();
  moveShip();
  moveBullets();
  moveMeteors();
  checkCollisions();
  checkMeteorBottom();
  checkPhase();
  checkGameOver();
  requestAnimationFrame(draw);
}

function drawBackground() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  // Desenha a barra superior para o score
  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 0, canvasWidth, 40);
}

function drawShip() {
  // Corpo da nave
  ctx.fillStyle = 'gray';
  ctx.beginPath();
  ctx.moveTo(shipX + shipSize / 2, shipY);
  ctx.lineTo(shipX, shipY + shipSize);
  ctx.lineTo(shipX + shipSize, shipY + shipSize);
  ctx.closePath();
  ctx.fill();

  // Asas da nave
  ctx.fillStyle = 'gray';
  ctx.beginPath();
  ctx.moveTo(shipX + shipSize / 4, shipY + shipSize / 2);
  ctx.lineTo(shipX + shipSize / 2, shipY - shipSize / 4);
  ctx.lineTo(shipX + shipSize * 3 / 4, shipY + shipSize / 2);
  ctx.closePath();
  ctx.fill();
}

function drawBullets() {
  ctx.fillStyle = 'red';
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
  });
}

function drawMeteors() {
  meteors.forEach(meteor => {
    ctx.fillStyle = meteor.color;
    ctx.beginPath();
    ctx.moveTo(meteor.x + meteor.width * 0.25, meteor.y + meteor.height * 0.25);
    ctx.lineTo(meteor.x + meteor.width * 0.75, meteor.y + meteor.height * 0.25);
    ctx.lineTo(meteor.x + meteor.width, meteor.y + meteor.height * 0.5);
    ctx.lineTo(meteor.x + meteor.width * 0.75, meteor.y + meteor.height * 0.75);
    ctx.lineTo(meteor.x + meteor.width * 0.25, meteor.y + meteor.height * 0.75);
    ctx.lineTo(meteor.x, meteor.y + meteor.height * 0.5);
    ctx.closePath();
    ctx.fill();
  });
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function moveShip() {
  if (upPressed && shipY > 0) {
    shipY -= shipSpeed;
  }
  if (downPressed && shipY < canvasHeight - shipSize) {
    shipY += shipSpeed;
  }
  if (leftPressed && shipX > 0) {
    shipX -= shipSpeed;
  }
  if (rightPressed && shipX < canvasWidth - shipSize) {
    shipX += shipSpeed;
  }
}

function moveBullets() {
  bullets.forEach(bullet => {
    bullet.y -= bulletSpeed;
  });
  bullets = bullets.filter(bullet => bullet.y > 0);
}

function moveMeteors() {
  meteors.forEach(meteor => {
    meteor.y += meteorSpeed;
  });
  meteors = meteors.filter(meteor => meteor.y < canvasHeight);
}

function checkCollisions() {
  bullets.forEach(bullet => {
    meteors.forEach((meteor, meteorIndex) => {
      if (bullet.x < meteor.x + meteor.width &&
          bullet.x + bulletWidth > meteor.x &&
          bullet.y < meteor.y + meteor.height &&
          bullet.y + bulletHeight > meteor.y) {
        bullets = bullets.filter(b => b !== bullet);
        score += getMeteorScore(meteor.color);
        drawExplosion(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2);
        meteors.splice(meteorIndex, 1);
      }
    });
  });
}

function checkMeteorBottom() {
  meteors.forEach((meteor, meteorIndex) => {
    if (meteor.y + meteor.height >= canvasHeight) {
      score -= 5; // Diminui 5 pontos quando o meteoro atinge a parte inferior
      drawExplosion(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2);
      meteors.splice(meteorIndex, 1);
    }
  });
}

function checkPhase() {
  if (score >= 1000 && phase === 1) {
    phase = 2;
    phaseMessage = 'Você venceu a Fase 1!';
    phaseStartTime = Date.now();
  }
  if (score >= 2000 && phase === 2) {
    phaseMessage = 'Você venceu o jogo!';
    gameEnded = true;
  }
  if (phase === 1 || phase === 2) {
    drawPhaseMessage();
  }
}

function drawPhaseMessage() {
  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.fillText(phaseMessage, canvasWidth / 2 - 250, canvasHeight / 2);
  if (phase === 2 && !gameEnded) {
    // Contagem regressiva de 3 segundos para a próxima fase
    const elapsedTime = Date.now() - phaseStartTime;
    const countdown = 3 - Math.floor(elapsedTime / 1000);
    if (countdown > 0) {
      drawCountdown(countdown);
    } else {
      phaseMessage = ''; // Limpa a mensagem após a contagem regressiva
    }
  }
}

function drawCountdown(countdown) {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Próxima fase em ${countdown}...`, canvasWidth / 2 - 100, canvasHeight / 2 + 50);
}

function drawWinMessage() {
  if (score >= 2000 && phase === 2 && gameEnded) {
    // Desenha um troféu no centro da tela
    const trophyImg = new Image();
    trophyImg.src = 'trophy.png'; // Substitua 'trophy.png' pelo caminho para sua imagem de troféu
    trophyImg.onload = function() {
      const trophyX = (canvasWidth - trophyImg.width) / 2;
      const trophyY = (canvasHeight - trophyImg.height) / 2;
      ctx.drawImage(trophyImg, trophyX, trophyY);
    };
  }
}

function getMeteorScore(color) {
  if (color === 'yellow') {
    return 10;
  } else if (color === 'green') {
    return 20;
  } else if (color === 'red') {
    return 30;
  }
}

function drawExplosion(x, y) {
  const explosionRadius = 50;
  const explosionGradient = ctx.createRadialGradient(x, y, 0, x, y, explosionRadius);
  explosionGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  explosionGradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.5)');
  explosionGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = explosionGradient;
  ctx.beginPath();
  ctx.arc(x, y, explosionRadius, 0, Math.PI * 2);
  ctx.fill();
}

function createMeteor() {
  const x = Math.random() * (canvasWidth - yellowMeteorWidth);
  const y = -yellowMeteorHeight;
  const colors = ['yellow', 'green', 'red'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  let width, height;
  if (randomColor === 'yellow') {
    width = yellowMeteorWidth;
    height = yellowMeteorHeight;
  } else if (randomColor === 'green') {
    width = greenMeteorWidth;
    height = greenMeteorHeight;
  } else if (randomColor === 'red') {
    width = redMeteorWidth;
    height = redMeteorHeight;
  }
  meteors.push({ x, y, color: randomColor, width, height });
}

setInterval(createMeteor, 1000);

draw();

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp') {
    upPressed = true;
  }
  if (e.key === 'ArrowDown') {
    downPressed = true;
  }
  if (e.key === 'ArrowLeft') {
    leftPressed = true;
  }
  if (e.key === 'ArrowRight') {
    rightPressed = true;
  }
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp') {
    upPressed = false;
  }
  if (e.key === 'ArrowDown') {
    downPressed = false;
  }
  if (e.key === 'ArrowLeft') {
    leftPressed = false;
  }
  if (e.key === 'ArrowRight') {
    rightPressed = false;
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === ' ') {
    bullets.push({ x: shipX + (shipSize / 2) - (bulletWidth / 2), y: shipY });
  }
});

function checkGameOver() {
  const unhitMeteors = meteors.filter(meteor => meteor.y >= canvasHeight);
  if (unhitMeteors.length >= 5) {
    gameEnded = true;
    drawGameOver();
  }
}

function drawGameOver() {
  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.fillText('Game Over', canvasWidth / 2 - 150, canvasHeight / 2 - 50);

  // Botão Reiniciar
  ctx.fillStyle = '#181818';
  ctx.fillRect(canvasWidth / 2 - 100, canvasHeight / 2 + 50, 200, 50);
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText('Reiniciar', canvasWidth / 2 - 50, canvasHeight / 2 + 85);
}

canvas.addEventListener('click', function(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  if (gameEnded && mouseX >= canvasWidth / 2 - 100 && mouseX <= canvasWidth / 2 + 100 && mouseY >= canvasHeight / 2 + 50 && mouseY <= canvasHeight / 2 + 100) {
    restartGame();
  }
});

function restartGame() {
  score = 0;
  phase = 1;
  phaseMessage = '';
  phaseStartTime = 0;
  gameEnded = false;
  bullets = [];
  meteors = [];
  draw();
}
