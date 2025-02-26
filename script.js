let rnd = (l, u) => Math.random() * (u - l) + l;
let camera, cursor, gun, player;
let bosss = [], animatronics = [], bullets = [], fastzombies = [], foods = [], heals = [], ammos = [], waters = [], trees = [], rocks = [];
let isShooting = false, isWalking = false, isReloading = false, isJumping = false, isSprinting = false;
let player_health = 100, score = 0, bullet = 30, maxHealth = 100, maxAmmo = 30;
let food_collected = -3, ammo_collected = -3, health_collected = -3, water_collected = -3;
let zombiesKilled = 0;
let startTime = Date.now();
const walkKeys = new Set(['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const sprintKey = 'Shift';
const jumpKey = ' ';
let lastDamageTime = 0;
const damageCooldown = 2000; // 2 seconds cooldown between damage instances

const sprintDuration = 5000; // 5 seconds
const sprintCooldown = 5000; // 5 seconds cooldown
let sprintStartTime = null;
let sprintCooldownStartTime = null;
let canSprint = true;

const questTargets = {
    food: 50,
    water: 100,
    ammo: 20,
    health: 5
};

window.onload = function () {
    scene = document.querySelector("a-scene");
    camera = document.querySelector("a-camera");
    cursor = document.querySelector("a-cursor");
    gun = document.querySelector("#gun1");
    q1 = document.getElementById("Quest1");
    q2 = document.getElementById("Quest2");
    q3 = document.getElementById("Quest3");
    q4 = document.getElementById("Quest4");
    healthElement = document.getElementById("health");

    q1.setAttribute("value", `Quest #1: ${food_collected} / ${questTargets.food} food collected`);
    q2.setAttribute("value", `Quest #2: ${water_collected} / ${questTargets.water} water collected`);
    q3.setAttribute("value", `Quest #3: ${ammo_collected} / ${questTargets.ammo} ammo collected`);
    q4.setAttribute("value", `Quest #4: ${health_collected} / ${questTargets.health} health collected`);
    healthElement.setAttribute('value', `Health: ${player_health}`);
    player = document.querySelector("#player");
    console.log("Camera initial position:", camera.object3D.position);

    setInterval(() => {
        for (let i = 0; i < rnd(4,6); i++) {
            let x = rnd(-100, 100);
            let z = rnd(-100, 100);
            animatronics.push(new Animatronic(x, 0, z));
        }
        for (let zombie of animatronics) {
            setInterval(() => {
                zombie.chase();
            }, 100);
        }
    }, 10000);  

    setInterval(() => {
        for (let i = 0; i < rnd(2,4); i++) {
            let x = rnd(-100, 100);
            let z = rnd(-100, 100);
            fastzombies.push(new FastZombie(x, 0.1, z));
        }
        for (let fastzom of fastzombies) {
            setInterval(() => {
                fastzom.chase();
            }, 100);
        }
    }, 30000); 

    window.addEventListener("keydown", function (e) {
        if (walkKeys.has(e.key) && !isWalking && !isReloading) {
            isWalking = true;
            updateAnimation();
        } else if (e.key === 'r' && !isReloading) {
            isReloading = true;
            bullet = maxAmmo; 
            updateAnimation();
            console.log("Reloading started");
            setTimeout(() => {
                console.log("Reloading animation finished, Ammo left:", bullet);
                isReloading = false;
                updateAnimation();
                updatePlayerInfo(); // Update bullet count
            }, 2000);
        } else if (e.key === sprintKey && walkKeys.has('w') && !isSprinting && canSprint) {
            isSprinting = true;
            sprintStartTime = Date.now();
            updateAnimation();
            camera.setAttribute('wasd-controls', 'acceleration: 50');
        }
    });

    window.addEventListener("keyup", function (e) {
        if (walkKeys.has(e.key)) {
            isWalking = false;
            updateAnimation();
        } else if (e.key === sprintKey) {
            isSprinting = false;
            updateAnimation();
            camera.setAttribute('wasd-controls', 'acceleration: 25');
        }
    });

    window.addEventListener('mousedown', function (e) {
        if (e.button === 0 && bullet > 0 && !isReloading) { // Left mouse button and has ammo and not reloading
            isShooting = true;
            updateAnimation();
            console.log("Shooting animation triggered");
            let newBullet = new Bullet();
            newBullet.shoot();
            bullet--; // Decrement the bullet count
            console.log(`Bullets left: ${bullet}`);
            updatePlayerInfo(); // Update bullet count
        }
    });

    window.addEventListener('mouseup', function (e) {
        if (e.button === 0) { // Left mouse button
            isShooting = false;
            updateAnimation();
            console.log("Stopped shooting");
        }
    });

    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            let x = rnd(-150, 100);
            let z = rnd(-150, 150);
            foods.push(new food(x, 0, z));
        }, i * 1000); 
    }

    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            let x = rnd(-150, 150);
            let z = rnd(-150, 150);
            waters.push(new water(x, 0, z));
        }, i * 1000); 
    }

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            let x = rnd(-150, 150);
            let z = rnd(-150, 150);
            ammos.push(new ammo(x, 0, z));
        }, i * 1000); 
    }

    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            let x = rnd(-150, 150);
            let z = rnd(-150, 150);
            heals.push(new heal(x, 0, z));
        }, i * 1000); 
    }

    for (let i = 0; i < 150; i++) {
        let x = rnd(-150, -10);
        let z = rnd(-150, 150);
        trees.push(new tree(x, 0, z));
    }

    for (let i = 0; i < 100; i++) {
        let x = rnd(-150, -10);
        let z = rnd(-150, 150);
        rocks.push(new rock(x, -0.6, z));
    }

    for (let i = 0; i < 150; i++) {
        let x = rnd(10, 150);
        let z = rnd(-150, 150);
        trees.push(new tree(x, 0, z));
    }

    for (let i = 0; i < 100; i++) {
        let x = rnd(10, 150);
        let z = rnd(-150, 150);
        rocks.push(new rock(x, -0.6, z));
    }

    setTimeout(loop, 500);

    // Add cheat code listener
    window.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            completeAllQuests();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            loseGame();
        }
    });
};

function updateAnimation() {
    if (isReloading) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|reload; loop: once; timeScale: 1");
        console.log("Reloading animation set");
    } else if (isShooting) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|shooting; loop: once; timeScale: 2");
        console.log("Shooting animation set");
    } else if (isWalking) {
        if (isSprinting) {
            gun.setAttribute('animation-mixer', "clip: Armature.003|run cycle; loop: repeat; timeScale: 3");
            console.log("Sprinting animation set");
        } else {
            gun.setAttribute('animation-mixer', "clip: Armature.003|walk; loop: repeat; timeScale: 1");
            console.log("Walking animation set");
        }
    } else {
        gun.setAttribute('animation-mixer', "clip: Armature.003|idle; loop: repeat; timeScale: 1");
        console.log("Idle animation set");
    }
}

function takePlayerDamage(damage) {
    const currentTime = Date.now();
    if (currentTime - lastDamageTime >= damageCooldown) {
        player_health -= damage;
        if (player_health < 0) player_health = 0;
        lastDamageTime = currentTime;
        console.log(`Player took ${damage} damage. Current health: ${player_health}`);
        healthElement.setAttribute('value', `Health: ${player_health}`);
        if (player_health <= 0) {
            loseGame();
        }
    }
}

function updatePlayerInfo() {
    const playerInfo = document.getElementById('player-info');
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    playerInfo.innerHTML = `Health: ${player_health}<br>Bullets: ${bullet}<br>Zombies Killed: ${zombiesKilled}<br>Time: ${elapsedTime}s`;
}

function checkQuestCompletion() {
    if (food_collected >= questTargets.food &&
        water_collected >= questTargets.water &&
        ammo_collected >= questTargets.ammo &&
        health_collected >= questTargets.health) {
        showWinScreen();
    }
}

function showWinScreen() {
    const winScreen = document.createElement('div');
    winScreen.style.position = 'absolute';
    winScreen.style.top = '50%';
    winScreen.style.left = '50%';
    winScreen.style.transform = 'translate(-50%, -50%)';
    winScreen.style.color = 'white';
    winScreen.style.fontSize = '50px';
    winScreen.style.textAlign = 'center';
    winScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    winScreen.style.padding = '20px';
    winScreen.style.borderRadius = '10px';
    winScreen.innerHTML = `Congratulations! You have completed all the quests!<br>Zombies Killed: ${zombiesKilled}<br>Time: ${Math.floor((Date.now() - startTime) / 1000)}s`;
    document.body.appendChild(winScreen);
}

function loseGame() {
    const loseScreen = document.createElement('div');
    loseScreen.style.position = 'absolute';
    loseScreen.style.top = '50%';
    loseScreen.style.left = '50%';
    loseScreen.style.transform = 'translate(-50%, -50%)';
    loseScreen.style.color = 'white';
    loseScreen.style.fontSize = '50px';
    loseScreen.style.textAlign = 'center';
    loseScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    loseScreen.style.padding = '20px';
    loseScreen.style.borderRadius = '10px';
    loseScreen.innerHTML = `Game Over! You have lost the game.<br>Zombies Killed: ${zombiesKilled}<br>Time: ${Math.floor((Date.now() - startTime) / 1000)}s`;
    document.body.appendChild(loseScreen);
}

function completeAllQuests() {
    food_collected = questTargets.food;
    water_collected = questTargets.water;
    ammo_collected = questTargets.ammo;
    health_collected = questTargets.health;
    q1.setAttribute("value", `Quest #1: ${food_collected} / ${questTargets.food} food collected`);
    q2.setAttribute("value", `Quest #2: ${water_collected} / ${questTargets.water} water collected`);
    q3.setAttribute("value", `Quest #3: ${ammo_collected} / ${questTargets.ammo} ammo collected`);
    q4.setAttribute("value", `Quest #4: ${health_collected} / ${questTargets.health} health collected`);
    checkQuestCompletion();
}

// Modify the loop function to include player damage
function loop() {
    for (let i = fastzombies.length - 1; i >= 0; i--) {
        let zombiefast = fastzombies[i];      
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombiefast.obj) < 3) { 
                console.log("Fast Zombie hit! Calling takeDamage() function");
                zombiefast.takeDamage(10); // Pass the damage value
                bullets.splice(j, 1);
                if (bullet.obj.parentNode) {
                    bullet.obj.parentNode.removeChild(bullet.obj);
                }
                if (zombiefast.health <= 0) {
                    fastzombies.splice(i, 1);
                    zombiesKilled++;
                }
                break; 
            }
        }
        if (distance(camera, zombiefast.obj) < 3) {
            takePlayerDamage(5); // Fast zombie does 5 damage
        }
    }
    for (let i = animatronics.length - 1; i >= 0; i--) {
        let zombie = animatronics[i];   
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombie.obj) < 5) { 
                console.log("Zombie hit! Calling takeDamage() function");
                zombie.takeDamage(10);
                if (zombie.health <= 0) {
                    animatronics.splice(i, 1);
                    zombiesKilled++;
                }
                if (bullet.obj.parentNode) {
                    bullet.obj.parentNode.removeChild(bullet.obj);
                }
                break; 
            }
        }
        if (distance(camera, zombie.obj) < 3) {
            takePlayerDamage(3); // Normal zombie does 3 damage
        }
    }
    
    for(let ammo of ammos){
        ammo.spin();
        if (distance(camera, ammo.obj) < 3 && ammo.available) {
            ammo.collect();
            q3.setAttribute("value", `Quest #3: ${ammo_collected} / ${questTargets.ammo} ammo collected`);
        }
    }
    for(let food of foods){
        food.spin();
        if (distance(camera, food.obj) < 3 && food.available) {
            food.collect();
            q1.setAttribute("value", `Quest #1: ${food_collected} / ${questTargets.food} food collected`);
        }
    }
    for(let heal of heals){
        heal.spin();
        if (distance(camera, heal.obj) < 3 && heal.available) {
            heal.collect();
            player_health = Math.min(player_health + 25, maxHealth); // Add 25 health, but not exceed maxHealth
            q4.setAttribute("value", `Quest #4: ${health_collected} / ${questTargets.health} health collected`);
            healthElement.setAttribute('value', `Health: ${player_health}`);
        }
    }
    for(let water of waters){
        water.spin();
        if (distance(camera, water.obj) < 3 && water.available) {
            water.collect();
            q2.setAttribute("value", `Quest #2: ${water_collected} / ${questTargets.water} water collected`);
        }
    }
    
    updatePlayerInfo(); // Update player info continuously
    checkQuestCompletion(); // Check quest completion status

    // Check sprint duration
    if (isSprinting && Date.now() - sprintStartTime >= sprintDuration) {
        isSprinting = false;
        canSprint = false;
        sprintCooldownStartTime = Date.now();
        camera.setAttribute('wasd-controls', 'acceleration: 25');
    }

    // Check sprint cooldown
    if (!canSprint && Date.now() - sprintCooldownStartTime >= sprintCooldown) {
        canSprint = true;
    }

    requestAnimationFrame(loop); // Ensure continuous checking
}

function distance(obj1, obj2) {
    let x1 = obj1.object3D.position.x;
    let y1 = obj1.object3D.position.y;
    let z1 = obj1.object3D.position.z;
    let x2 = obj2.object3D.position.x;
    let y2 = obj2.object3D.position.y;
    let z2 = obj2.object3D.position.z;

    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
}