// 1. osa. Kosmoselaev.
// Mõõtmed on antud pikslites ja kiirused pikslites sekundis.
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const player = { x: width / 2 - 16, y: height - 64, w: 32, h: 32, speed: 280 };

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

function draw() {
    drawSpace();
    drawPlayer();
}

draw();
