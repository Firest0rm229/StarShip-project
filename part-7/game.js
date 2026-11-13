// 7. osa. Täisväärtuslik mäng + Muusika
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const player = { x: width / 2 - 16, y: height - 64, w: 32, h: 32, speed: 280 };
const keys = {};
let lastTime = 0;
let bullets = [];
let shotTimer = 0;
let enemies = [];
let enemyTimer = 0;
let score = 0;
let lives = 3;
let gameOver = false;
let paused = false;
const restartButton = document.querySelector('#restart');
if (restartButton) restartButton.addEventListener('click', restart);

// Muusika kaivitamine 
const bgMusic = new Audio('AmongUsTheme.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;

// Esimese klikke paneme muusika käima, kuna brauserid keelavad automaatse taasesituse.
window.addEventListener('keydown', () => {
    if (bgMusic.paused) bgMusic.play().catch(() => {});
}, { once: true });

window.addEventListener('click', () => {
    if (bgMusic.paused) bgMusic.play().catch(() => {});
}, { once: true });


// Joonistame tausta uuesti, et kustutada eelmine kaader.
function drawSpace() {
    ctx.fillStyle = '#080d22';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#7185ad';
    for (let i = 0; i < 65; i++) {
        const x = (i * 137 + 23) % width;
        const y = (i * 97 + 41) % height;
        ctx.fillRect(x, y, 2, 2);
    }
}

// Kosmoselaev koosneb lihtsatest ristkülikutest.
function drawPlayer() {
    ctx.fillStyle = '#73eed8';
    ctx.fillRect(player.x + 12, player.y, 8, 8);
    ctx.fillRect(player.x + 8, player.y + 8, 16, 16);
    ctx.fillRect(player.x, player.y + 20, 32, 12);
    ctx.fillStyle = '#e7fbff';
    ctx.fillRect(player.x + 12, player.y + 10, 8, 10);
    ctx.fillStyle = '#ffbd69';
    ctx.fillRect(player.x + 4, player.y + 32, 6, 8);
    ctx.fillRect(player.x + 22, player.y + 32, 6, 8);
}

// event.code tähistab klahvi füüsilist asukohta ega sõltu klaviatuuripaigutusest.
document.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
    }
    keys[event.code] = true;
    if (event.code === 'KeyP' && !event.repeat && !gameOver) paused = !paused;
    if (event.code === 'Enter' && gameOver) restart();
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Akna fookuse kadumisel lähtestame klahvide oleku, et liikumine ei jätkuks.
window.addEventListener('blur', () => {
    for (const code in keys) keys[code] = false;
    if (!gameOver) paused = true;
});

// Kaks ristkülikut kattuvad, kui need kattuvad mõlema telje suunas.
function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

function restart() {
    player.x = width / 2 - player.w / 2;
    bullets = [];
    enemies = [];
    score = 0;
    lives = 3;
    shotTimer = 0;
    enemyTimer = 0;
    gameOver = false;
    paused = false;
    if (restartButton) restartButton.hidden = true;
    for (const code in keys) keys[code] = false;
}

function loseLife() {
    lives -= 1;
    if (lives <= 0) {
        gameOver = true;
        if (restartButton) restartButton.hidden = false;
    }
}

function update(dt) {
    if (gameOver || paused) return;
    if (keys.ArrowLeft || keys.KeyA) player.x -= player.speed * dt;
    if (keys.ArrowRight || keys.KeyD) player.x += player.speed * dt;
    player.x = Math.max(0, Math.min(width - player.w, player.x));

    // Laskude vaheline viivitus piirab laskekiirust ka tühikuklahvi all hoides.
    shotTimer -= dt;
    if (keys.Space && shotTimer <= 0) {
        bullets.push({ x: player.x + 14, y: player.y, w: 4, h: 14 });
        shotTimer = 0.22;
    }
    for (const bullet of bullets) bullet.y -= 430 * dt;
    bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0);

    enemyTimer -= dt;
    if (enemyTimer <= 0) {
        enemies.push({ x: Math.random() * (width - 28), y: -28, w: 28, h: 28 });
        enemyTimer = Math.max(0.3, 0.9 - Math.floor(score / 100) * 0.08);
    }
    for (const enemy of enemies) enemy.y += (110 + Math.floor(score / 100) * 12) * dt;

    // Läbime massiivi lõpust alates: splice eemaldab elemendi ja nihutab järgmisi elemente.
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (overlaps(enemies[i], bullets[j])) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                break;
            }
        }
    }

    // Kaotame ühe elu, kui vaenlane põrkab laevaga kokku või jõuab ekraani alaservani.
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].y > height || overlaps(enemies[i], player)) {
            enemies.splice(i, 1);
            loseLife();
            if (gameOver) break;
        }
    }
}

function draw() {
    drawSpace();
    drawPlayer();
    ctx.fillStyle = '#ffdc83';
    for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
    for (const enemy of enemies) {
        ctx.fillStyle = '#ff688c';
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h - 6);
        ctx.fillRect(enemy.x - 3, enemy.y + 5, 34, 8);
        ctx.fillStyle = '#080d22';
        ctx.fillRect(enemy.x + 5, enemy.y + 8, 5, 5);
        ctx.fillRect(enemy.x + 18, enemy.y + 8, 5, 5);
    }
    ctx.fillStyle = '#e4f7ff';
    ctx.font = '18px monospace';
    ctx.fillText('PUNKTID: ' + score, 18, 30);
    ctx.fillText('ELUD: ' + lives, width - 128, 30);
    if (gameOver || paused) {
        ctx.fillStyle = '#070b19dd';
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#73eed8';
        ctx.font = '28px monospace';
        ctx.fillText(gameOver ? 'MÄNG LÄBI' : 'PAUS', width / 2, height / 2 - 20);
        ctx.fillStyle = '#e4f7ff';
        ctx.font = '16px monospace';
        ctx.fillText(gameOver ? 'Punktid: ' + score : 'Jätkamiseks vajuta P', width / 2, height / 2 + 18);
        if (gameOver) ctx.fillText('Enter – uus katse', width / 2, height / 2 + 50);
        ctx.textAlign = 'left';
    }
}

// requestAnimationFrame kutsub funktsiooni loop välja enne järgmist kaadrit.
function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);