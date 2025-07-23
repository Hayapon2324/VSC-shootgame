
// ゲームの初期設定
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// キャンバスのサイズ設定
canvas.width = 800;
canvas.height = 600;

// プレイヤー設定
let player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    isInvincible: false,
    specialPoint: 0,
    life: 10,
    isHoming: false
};

// プレイヤーの移動
let keys = {
    right: false,
    left: false,
    up: false,
    down: false,
    shot: false,
};

// ゲームオーバー確認
let isGameOver = false

// 一時停止確認
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "white";
ctx.font = "48px Arial";
ctx.fillText("Shooting game", canvas. width / 2 - 150, canvas.height / 2)
ctx.fillText("Pless 't' to start", canvas. width /2 -150, canvas.height / 2 + 50)
let isStop = true

// キー押下イベントの設定
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
    if (e.key === "ArrowUp" || e.key === "w") keys.up = true;
    if (e.key === "ArrowDown" || e.key === "s") keys.down = true;
    if (e.key === " ") keys.shot = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
    if (e.key === "ArrowUp" || e.key === "w") keys.up = false;
    if (e.key === "ArrowDown" || e.key === "s") keys.down = false;
    if (e.key === " ") keys.shot = false;
});

// 弾丸設定
let bullets = [];

// 弾丸の発射関数
let bulletcooldown = 0

function fireBullet() {
    if (bulletcooldown < 20){
        let bullet = {
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 10,
            kind: "player",
            speed: 7,
            life: 0,
            isDie: false,
            recordedEnemy: enemies[Math.floor(Math.random() * enemies.length)]
        }
        bullets.push(bullet);
        bulletcooldown ++
    }
}

function cooldown(){
    if(keys.shot == false && bulletcooldown >=1){
        bulletcooldown --
    }
}

// 敵配列
let enemies = [];

// 敵の出現
function spawnEnemy() {
    let randomEnemy = Math.random()
    if (!isStop && !isGameOver){
        if (randomEnemy <= 0.7){
            let x = Math.random() * (canvas.width - 30); // ランダムなX位置
            let y = -50; // 画面外上部から出現
            enemies.push(
                { 
                    x,
                    y,
                    width: 50,
                    height: 50,
                    speed: 5,
                    acceleration: 0.1,
                    color: "blue",
                    type: "normal",
                }
            );
        }
        else if (randomEnemy > 0.7 && randomEnemy <= 0.95){
            let x = Math.random() * (canvas.width - 30); // ランダムなX位置
            let y = -50; // 画面外上部から出現
            enemies.push(
                { 
                    x,
                    y,
                    width: 50,
                    height: 50,
                    speed: 10,
                    acceleration: 0.1,
                    color: "yellow",
                    type: "speed",
                }
            );

        }
        else if (randomEnemy > 0.95){
            let x = Math.random() * (canvas.width - 30); // ランダムなX位置
            let y = -50; // 画面外上部から出現
            enemies.push(
                {
                    x,
                    y,
                    width: 50,
                    height: 50,
                    speed: 3,
                    acceleration: 0.1,
                    color: "purple",
                    type: "shot",
                    bulletInterval: 50,
                }
            );
        }
    }
}

// 敵の更新
function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        enemy.y += enemy.speed;
        if (enemy.type == "shot"){
            enemy.bulletInterval --
            if (enemy.bulletInterval <= 0){
                enemy.bulletInterval = 50
                enemyFire(enemy)
            }
        }
        // 敵が画面下部に到達したら削除
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            i--;
        }
    }
    
}
// 敵の弾丸発射関数
function enemyFire(enemy) {
        let bullet = {
            x: enemy.x + enemy.width / 2 - 2.5,
            y: enemy.y + enemy.height,
            width: 5,
            height: 5,
            kind: "enemy",
            speed: enemy.speed + 4,
            life: 0,
            isDie: false,
        }
        bullets.push(bullet);
}

// スコア設定
let score = 0;

// 必殺技ゲージ設定
let gauge = {
    x: 20,
    y: 550,
    width: 30,
    height: 30,
}

// 衝突判定
function checkCollisions() {
    for (let bullet of bullets){
        switch (bullet.kind){
            case "player":
                for (let enemy of enemies){
                    // 弾丸と敵の衝突判定
                    if (
                            bullet.x < enemy.x + enemy.width &&
                            bullet.x + bullet.width > enemy.x &&
                            bullet.y < enemy.y + enemy.height &&
                            bullet.y + bullet.height > enemy.y
                        ) {
                            // 衝突したら弾丸と敵を削除
                            bullets.splice(bullets.indexOf(bullet), 1)
                            enemies.splice(enemies.indexOf(enemy), 1);
                            
                            // スコア加算
                            score += 10;

                            break;
                        }
                    }
                break;
            case "enemy":
                    if (
                        bullet.x < player.x + player.width &&
                        bullet.x + bullet.width > player.x &&
                        bullet.y < player.y + player.height &&
                        bullet.y + bullet.height > player.y
                    ) {
                        // 衝突したら弾丸を削除
                        bullets.splice(bullets.indexOf(bullet), 1);
                        
                        // ライフ減算
                        if(player.isInvincible == false)player.life -= 1;
                        else score += 10
                        break;
                    }
                break;
        }
    }

    // 自分と敵の衝突判定
    for (let j = 0; j < enemies.length; j++) {
        let enemy = enemies[j];
        
        
        if (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
        ) {
        // 衝突したら敵を削除
        enemies.splice(j, 1);

        // ライフ減算
        if(player.isInvincible == false)player.life -= 1;
        else score += 10
        break;
        }
    }
}

// プレイヤーの移動
function updatePlayer() {
    if (keys.right && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys.left && player.x > 0) player.x -= player.speed;
    if (keys.up && player.y > 0) player.y -= player.speed;
    if (keys.down && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys.shot) fireBullet()
    if(player.specialPoint < 4000){
        player.specialPoint++
    }
}

// 弾丸の更新
function updateBullets() {
    let interval = 0
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
    switch(bullet.kind){
        case "player":
            if(player.isHoming == false)bullet.y -= bullet.speed; // 上方向に移動
            else if (player.isHoming == true){
                calculateBulletVelocity(bullet.recordedEnemy,bullet)
                bullet.y += bullet.ySpeed; // 上下方向に移動
                bullet.x += bullet.xSpeed; // 左右方向に移動    
            }
            break;
        case "enemy":
            calculateBulletVelocity(player,bullet)
            bullet.y += bullet.ySpeed; // 上下方向に移動
            bullet.x += bullet.xSpeed; // 左右方向に移動
            bullet.life ++
            if(bullet.life >= 510){
                bullets.splice(i, 1);
            }
            else if (bullet.life >= 500){
                bullet.isDie = true
            }
            break;
            default:
            break;
    }

    // 画面外に出た弾丸は削除
    if (bullet.y < 0 && bullet.y > -30) {
        bullets.splice(i, 1);
        i--;
    }
    }
}

// 必殺技
window.addEventListener("keydown",(e) => {
    if (e.key ==="x")invincible();
})

let lightFlash = false

function invincible(){
    if (player.specialPoint >= 2000 && player.isInvincible == false){
        // 無敵処理
        player.specialPoint -= 2000;
        player.isInvincible = true;
        setTimeout(() => {
            for (i=0;i<10;i++){
                setTimeout(() => {
                    if(lightFlash == false)lightFlash = true
                    else if(lightFlash == true)lightFlash = false
                },100*(i+1))
            }
            setTimeout(() => {
                player.isInvincible = false
            },1000)
        }, 4000);
    }
}

window.addEventListener("keydown",(e) => {
    if (e.key === "z")homing()
})


function homing(){
    if (player.specialPoint >= 2000 && player.isHoming == false){
        player.specialPoint -= 2000;
            player.isHoming = true
            setTimeout(() => {
                player.isHoming =false
            },5000);
    }
}

// ゲームの描画
function draw() {
    // 画面のクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // プレイヤーの描画
    if (player.isInvincible == false){
        ctx.fillStyle = "white";
    }
    else if (player.isInvincible == true){
        if (lightFlash == false)ctx.fillStyle = "green";
        else if (lightFlash == true)ctx.fillStyle = "white";
    }
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 弾丸の描画
    for (let bullet of bullets) {
        if(bullet.isDie == false){
            ctx.fillStyle = "red";
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        else if(bullet.isDie == true){
            ctx.fillStyle = "red";
            ctx.fillRect(bullet.x, bullet.y, bullet.width * 2, bullet.height * 2);
            ctx.fillStyle = "black";
            ctx.fillRect(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width, bullet.height);
        }
    }

    // 敵の描画
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if(enemy.type == "normal"){
            ctx.fillStyle = "blue";
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        else if(enemy.type == "speed"){
            ctx.fillStyle = "yellow";
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        else if(enemy.type == "shot"){
            ctx.fillStyle = "purple";
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    }
    
    //必殺技ゲージの描画
    ctx.fillStyle = "green";
    ctx.fillRect(20, 550, player.specialPoint/10, 30);
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("skill gauge: " + Math.trunc(player.specialPoint/20) + "%", 20, 500)
    
    // スコアの描画
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 20, 30);
     
    // ライフの描画
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("life: " + player.life, 20, 50);
    
    // 残弾数の描画
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("bullet: " + (20 - bulletcooldown), 20, 70);

    // ゲームオーバーの描画
    if (isGameOver == true){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("Game over", canvas. width / 2 - 100, canvas.height / 2)
        ctx.fillText("your score: " + score, canvas. width /2 -120, canvas.height / 2 + 50)
    }
}

    // ゲームの更新処理
function updateGame() {
    if (isGameOver == false && isStop == false){
        updatePlayer();
        playerUpgrade();
        updateBullets();
        updateEnemies();
        checkCollisions();
        intervalCheck();
        cooldown();
        gameover();
        draw();
        requestAnimationFrame(updateGame);
    }
}

// 敵の定期的な出現
let interval = 0

function intervalCheck() {
    interval ++;
    if (interval >= 50 && score < 200){
        spawnEnemy();
        interval = 0;
    }
    else if (interval >= 25 && score >= 200){
        spawnEnemy();
        interval = 0;
    }
}

// ゲーム開始
updateGame();

// アップグレード
function playerUpgrade() {
    if (score > 99) {
        player.speed = 5;
    }
}

// リスタート
window.addEventListener("keydown", (e) => {
    if (e.key === "r") {
        isStop = false;
        player.x = canvas.width / 2,
        player.y = canvas.height - 60,
        player.speed = 5;
        enemies = [];
        bullets = [];
        score = 0;
        player.life = 10;
        player.isInvincible = false
        player.specialPoint = 0;
        if (isGameOver == true || isStop == true){
            isGameOver = false;
            updateGame();
        };
    }
})

// ゲームオーバー
function gameover() {
    if (player.life < 1 && isGameOver == false){
        isGameOver = true
    }
}

// 一時停止
window.addEventListener("keydown", (e) => {
    if (e.key === "t") {
        if (isStop == false){
            isStop = true
        }
        else if (isStop == true){
            isStop = false
            updateGame();
        }
    }
})

function calculateBulletVelocity(other,self){
    const delta_x = (other.x + other.width / 2) - (self.x + other.width / 2);
    const delta_y = (other.y + other.height /2) - (self.y + other.height /2);
    const distance = Math.sqrt(delta_x ** 2 + delta_y ** 2);

    self.xSpeed = 3*(delta_x / distance);
    self.ySpeed = 3*(delta_y / distance);
}
window.addEventListener("keydown", (e) => {
    if (e.key === "i"){
        if (isStop == false){
            isStop = true
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "white";
                ctx.font = "30px Arial";
                ctx.fillText("'w','a','s','d' to move", canvas. width / 2 - 100, canvas.height / 2)
                ctx.fillText("'space'to shot" , canvas. width /2 -100, canvas.height / 2 + 30)
                ctx.fillText("'r'to retry", canvas.width / 2 - 100,canvas.height / 2 + 60)
                ctx.fillText("'t'to stop", canvas.width / 2 - 100, canvas.height / 2 + 90)
                ctx.fillText("'i'to information", canvas.width / 2 - 100, canvas.height / 2 + 120)
            }
        else if(isStop == true)isStop = false
    }
})