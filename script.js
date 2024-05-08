const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let shipImg = new Image();
shipImg.src = 'nave.png';

const shipSize = 50;
const shipSpeed = 5;
let shipX = (canvas.width - shipSize) / 2;
let shipY = canvas.height - shipSize - 10;
let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;

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
const blueMeteorWidth = 40;
const blueMeteorHeight = 40;
const purpleMeteorWidth = 50;
const purpleMeteorHeight = 50;
const meteorSpeed = 2;
let meteors = [];

let score = 0;
let phase = 1;
let phaseMessage = '';
let phaseStartTime = 0;
let gameEnded = false;
let lives = 3; // Vidas iniciais

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawShip();
  drawBullets();
  drawMeteors();
  drawScore();
  drawPhaseMessage();
  drawWinMessage();
  moveShip();
  moveBullets();
  moveMeteors();
  checkCollisions();
  checkMeteorBottom();
  checkPhase();
  requestAnimationFrame(draw);
}

function drawBackground() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Desenha a barra superior para o score e vidas
  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 0, canvas.width, 40);
  ctx.fillStyle = 'white';
  ctx.font = '20px Roboto';
  ctx.fillText(`Vidas: ${lives.toString().padStart(2, '0')}`, canvas.width - 100, 30);
}

function drawShip() {
  ctx.drawImage(shipImg, shipX, shipY, shipSize, shipSize);
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
  if (leftPressed && shipX > 0) {
    shipX -= shipSpeed;
  }
  if (rightPressed && shipX < canvas.width - shipSize) {
    shipX += shipSpeed;
  }
  if (upPressed && shipY > 0) {
    shipY -= shipSpeed;
  }
  if (downPressed && shipY < canvas.height - shipSize) {
    shipY += shipSpeed;
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
  meteors = meteors.filter(meteor => meteor.y < canvas.height);
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
    if (meteor.y + meteor.height >= canvas.height) {
      score -= 5; // Diminui 5 pontos quando o meteoro atinge a parte inferior
      drawExplosion(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2);
      meteors.splice(meteorIndex, 1);
    }
  });
}

function checkPhase() {
  if (score >= 1000 && phase === 1) {
    phase = 2;
    phaseMessage = 'Venceu';
    phaseStartTime = Date.now();
    increaseLife(); // Aumenta uma vida ao passar de fase
  }
  if (score >= 2000 && phase === 2) {
    phase = 3;
    phaseMessage = 'Venceu';
    phaseStartTime = Date.now();
    increaseLife(); // Aumenta uma vida ao passar de fase
  }
  if (score >= 5000 && phase === 3) {
    phaseMessage = 'Vencedor';
    gameEnded = true;
  }
}

function increaseLife() {
  lives++; // Incrementa uma vida
}

function drawPhaseMessage() {
  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  const messageWidth = ctx.measureText(phaseMessage).width;
  const messageX = (canvas.width - messageWidth) / 2; // Centraliza o texto na tela
  ctx.fillText(phaseMessage, messageX, canvas.height / 2);
  if ((phase === 2 || phase === 3) && !gameEnded) {
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
  ctx.fillText(`Próxima fase em ${countdown}...`, canvas.width / 2 - 100, canvas.height / 2 + 50);
}

function drawWinMessage() {
  if (score >= 5000 && phase === 3 && gameEnded) {
    // Desenha um botão para reiniciar o jogo
    const restartButton = document.querySelector('.restart-button');
    restartButton.style.display = 'block';
  }
}

function getMeteorScore(color) {
  if (color === 'yellow') {
    return 10;
  } else if (color === 'green') {
    return 20;
  } else if (color === 'red') {
    return 30;
  } else if (color === 'blue') {
    return 50;
  } else if (color === 'purple') {
    return 100;
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
  let x, y, color, width, height;
  if (phase === 1) {
    // Fase 1: Apenas meteoros amarelos, verdes e vermelhos
    x = Math.random() * (canvas.width - yellowMeteorWidth);
    y = -yellowMeteorHeight;
    const colors = ['yellow', 'green', 'red'];
    color = colors[Math.floor(Math.random() * colors.length)];
    if (color === 'yellow') {
      width = yellowMeteorWidth;
      height = yellowMeteorHeight;
    } else if (color === 'green') {
      width = greenMeteorWidth;
      height = greenMeteorHeight;
    } else if (color === 'red') {
      width = redMeteorWidth;
      height = redMeteorHeight;
    }
  } else if (phase === 2) {
    // Fase 2: Além dos meteoros da fase 1, também adiciona meteoros azuis
    x = Math.random() * (canvas.width - blueMeteorWidth);
    y = -blueMeteorHeight;
    const colors = ['yellow', 'green', 'red', 'blue'];
    color = colors[Math.floor(Math.random() * colors.length)];
    if (color === 'yellow') {
      width = yellowMeteorWidth;
      height = yellowMeteorHeight;
    } else if (color === 'green') {
      width = greenMeteorWidth;
      height = greenMeteorHeight;
    } else if (color === 'red') {
      width = redMeteorWidth;
      height = redMeteorHeight;
    } else if (color === 'blue') {
      width = blueMeteorWidth;
      height = blueMeteorHeight;
    }
  } else if (phase === 3) {
    // Fase 3: Além dos meteoros das fases anteriores, também adiciona meteoros roxos
    x = Math.random() * (canvas.width - purpleMeteorWidth);
    y = -purpleMeteorHeight;
    const colors = ['yellow', 'green', 'red', 'blue', 'purple'];
    color = colors[Math.floor(Math.random() * colors.length)];
    if (color === 'yellow') {
      width = yellowMeteorWidth;
      height = yellowMeteorHeight;
    } else if (color === 'green') {
      width = greenMeteorWidth;
      height = greenMeteorHeight;
    } else if (color === 'red') {
      width = redMeteorWidth;
      height = redMeteorHeight;
    } else if (color === 'blue') {
      width = blueMeteorWidth;
      height = blueMeteorHeight;
    } else if (color === 'purple') {
      width = purpleMeteorWidth;
      height = purpleMeteorHeight;
    }
  }
  meteors.push({ x, y, color, width, height });
}

setInterval(createMeteor, 1000);

draw();

function handleTouch(event) {
  event.preventDefault();
  const touch = event.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;

  if (score >= 5000 && phase === 3 && gameEnded) {
    // Verifica se o toque foi no botão de reiniciar o jogo
    const buttonX = canvas.width / 2 - 100;
    const buttonY = canvas.height / 2 + 100;
    if (touchX >= buttonX && touchX <= buttonX + 200 && touchY >= buttonY && touchY <= buttonY + 50) {
      restartGame();
      return;
    }
  }

  if (touchX < canvas.width / 2 && touchY < canvas.height / 2) {
    upPressed = true;
  } else if (touchX > canvas.width / 2 && touchY < canvas.height / 2) {
    upPressed = true;
  } else if (touchX < canvas.width / 2 && touchY > canvas.height / 2) {
    downPressed = true;
  } else if (touchX > canvas.width / 2 && touchY > canvas.height / 2) {
    downPressed = true;
  }

  if (touchX < canvas.width / 2) {
    leftPressed = true;
  } else {
    rightPressed = true;
  }

  // Adiciona um tiro quando tocar na tela
  bullets.push({ x: shipX + (shipSize / 2) - (bulletWidth / 2), y: shipY });
}

function handleTouchEnd(event) {
  event.preventDefault();
  leftPressed = false;
  rightPressed = false;
  upPressed = false;
  downPressed = false;
}

canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchend', handleTouchEnd);

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    leftPressed = true;
  }
  if (e.key === 'ArrowRight' || e.key === 'Right') {
    rightPressed = true;
  }
  if (e.key === 'ArrowUp' || e.key === 'Up') {
    upPressed = true;
  }
  if (e.key === 'ArrowDown' || e.key === 'Down') {
    downPressed = true;
  }
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    leftPressed = false;
  }
  if (e.key === 'ArrowRight' || e.key === 'Right') {
    rightPressed = false;
  }
  if (e.key === 'ArrowUp' || e.key === 'Up') {
    upPressed = false;
  }
  if (e.key === 'ArrowDown' || e.key === 'Down') {
    downPressed = false;
  }
});

function restartGame() {
  score = 0;
  phase = 1;
  phaseMessage = '';
  phaseStartTime = 0;
  gameEnded = false;
  lives = 3;
  bullets = [];
  meteors = [];
  const restartButton = document.querySelector('.restart-button');
  restartButton.style.display = 'none';
}
