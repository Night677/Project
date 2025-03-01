let rnd = (l, u) => Math.random() * (u - l) + l;
let camera, cursor, gun, player;
let bosss = [], animatronics = [], bullets = [], fastzombies = [], foods = [], heals = [], ammos = [], waters = [], trees = [], rocks = [];
let isShooting = false, isWalking = false, isReloading = false, isJumping = false, isSprinting = false;
let health = 115, score = 0, bullet = 30, wave = 0, maxWave = 30, maxHealth = 115, maxAmmo = 30;
let food_collected = 0, ammo_collected = 0, health_collected = 0, water_collected = 0;
const walkKeys = new Set(['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const sprintKey = 'Shift';
const jumpKey = ' ';

const sprintDuration = 5000; // 5 seconds
const sprintCooldown = 5000; // 5 seconds cooldown
let sprintStartTime = null;
let sprintCooldownStartTime = null;
let canSprint = true;

let zombiesPerWave = 0;
let lastHealthReductionTime = 0;
const healthReductionCooldown = 1000; // Cooldown period in milliseconds

window.onload = function () {
    scene = document.querySelector("a-scene");
    camera = document.querySelector("a-camera");
    cursor = document.querySelector("a-cursor");
    gun = document.querySelector("#gun1");
  
    player = document.querySelector("#player");
    loop();
    console.log("Camera initial position:", camera.object3D.position);

    window.addEventListener("keydown", function (e) {
        if (walkKeys.has(e.key) && !isWalking && !isReloading) {
            isWalking = true;
            updateAnimation();
        } else if (e.key === 'r' && !isReloading) {
            isReloading = true;
            bullet = maxAmmo; // Refill ammo instantly
            updateAnimation();
            setTimeout(() => {
                console.log("Reloading animation finished, Ammo left:", bullet);
                isReloading = false;
                updateAnimation();
            }, 2000); 
        } else if (e.key === sprintKey && walkKeys.has('w') && !isSprinting && canSprint) {
            isSprinting = true;
            sprintStartTime = Date.now();
            updateAnimation();
            camera.setAttribute('wasd-controls', 'acceleration: 50');
        } else if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            loseGame();
        }
    });

    // Handle keyup events
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

    // Handle mouse down (shooting)
    window.addEventListener('mousedown', function (e) {
        if (e.button === 0 && bullet > 0 && !isReloading) { // Left mouse button and has ammo and not reloading
            isShooting = true;
            updateAnimation();
            console.log("Shooting animation triggered");
            let newBullet = new Bullet();
            newBullet.shoot();
            bullet--; // Decrease bullet count
            updateWaveInfo(); // Update bullet count
        }
    });

    // Handle mouse up (stop shooting)
    window.addEventListener('mouseup', function (e) {
        if (e.button === 0) { // Left mouse button
            isShooting = false;
            updateAnimation();
            console.log("Stopped shooting");
        }
    });
};

window.reduceHealth = function(amount) {
    health -= amount;
    console.log(`Health reduced by ${amount}. Current health: ${health}`);
    if (health <= 0) {
        console.log("Player is dead");
        loseGame();
    }
    updateWaveInfo(); // Update health info
};

function updateAnimation() {
    if (isReloading) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|reload; loop: once; timeScale: 1");
    } else if (isShooting) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|shooting; loop: once; timeScale: 2");
    } else if (isWalking) {
        if (isSprinting) {
            gun.setAttribute('animation-mixer', "clip: Armature.003|run cycle; loop: repeat; timeScale: 3");
        } else {
            gun.setAttribute('animation-mixer', "clip: Armature.003|walk; loop: repeat; timeScale: 2");
        }
    } else {
        gun.setAttribute('animation-mixer', "clip: Armature.003|idle; loop: repeat; timeScale: 1");
    }
}

function startWave() {
    console.log(`Starting wave ${wave}`);
    for (let i = 0; i < zombiesPerWave; i++) {
        let x = rnd(-20, 20);
        let z = rnd(-250, 250);
        let animatronic = new Animatronic(x, 0.1, z);
        animatronic.intervalId = setInterval(() => {
            animatronic.chase();
        }, 100);
        animatronics.push(animatronic);
    }

    for (let i = 0; i < zombiesPerWave; i++) {
        let x = rnd(-20, 20);
        let z = rnd(-250, 250);
        let fastzombie = new FastZombie(x, 0.1, z);
        fastzombie.intervalId = setInterval(() => {
            fastzombie.chase();
        }, 100);
        fastzombies.push(fastzombie);
    }
}

function checkWaveCompletion() {
    console.log(`Checking wave completion: animatronics.length=${animatronics.length}, fastzombies.length=${fastzombies.length}`);
    if (animatronics.length === 0 && fastzombies.length === 0) {
        if (wave < maxWave) {
            wave++;
            zombiesPerWave += 5; // Increase the number of zombies per wave
            console.log(`Wave ${wave} starting with ${zombiesPerWave} zombies`);
            startWave();
        } else {
            console.log("All waves completed!");
        }
    }
}

function updateWaveInfo() {
    const waveInfo = document.getElementById('wave-info');
    waveInfo.innerHTML = `Wave: ${wave}<br>Zombies: ${animatronics.length + fastzombies.length}`;
    
    const playerInfo = document.getElementById('player-info');
    playerInfo.innerHTML = `Health: ${health}<br>Bullets: ${bullet}`;
}

function loop() {
    for (let i = fastzombies.length - 1; i >= 0; i--) {
        let zombiefast = fastzombies[i];
        if (zombiefast.pendingRemoval) continue; // Skip zombies pending removal
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombiefast.obj) < 3) {
                console.log("Fast Zombie hit! Calling takeDamage() function");
                zombiefast.takeDamage(10); // Pass the damage value
                bullets.splice(j, 1);
                bullet.obj.parentNode.removeChild(bullet.obj);
                if (zombiefast.health <= 0) {
                    zombiefast.isDead = true; // Set the flag to indicate the zombie is dead
                    zombiefast.die(); // Play dying animation
                    zombiefast.pendingRemoval = true; // Mark for removal
                    setTimeout(() => {
                        fastzombies.splice(fastzombies.indexOf(zombiefast), 1); // Remove zombie after animation
                        updateWaveInfo(); // Update wave info after removal
                    }, 1000); // Adjust the timeout to match the animation duration
                }
                break;
            }
        }
    }

    for (let i = animatronics.length - 1; i >= 0; i--) {
        let zombie = animatronics[i];
        if (zombie.pendingRemoval) continue; // Skip zombies pending removal
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombie.obj) < 3) {
                console.log("Zombie hit! Calling takeDamage() function");
                zombie.takeDamage(10); // Pass the damage value
                bullets.splice(j, 1);
                bullet.obj.parentNode.removeChild(bullet.obj);
                if (zombie.health <= 0) {
                    zombie.isDead = true; // Set the flag to indicate the zombie is dead
                    zombie.die(); // Play dying animation
                    zombie.pendingRemoval = true; // Mark for removal
                    setTimeout(() => {
                        animatronics.splice(animatronics.indexOf(zombie), 1); // Remove zombie after animation
                        updateWaveInfo(); // Update wave info after removal
                    }, 1000); // Adjust the timeout to match the animation duration
                }
                break;
            }
        }
    }

    checkZombiePlayerCollision(); // Check for collisions between zombies and the player
    checkWaveCompletion();
    updateWaveInfo(); // Update wave info continuously

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

function checkZombiePlayerCollision() {
    const currentTime = Date.now();
    if (currentTime - lastHealthReductionTime < healthReductionCooldown) {
        return; // Skip health reduction if cooldown period has not passed
    }

    let healthReduced = false;

    for (let i = fastzombies.length - 1; i >= 0; i--) {
        let zombiefast = fastzombies[i];
        if (distance(zombiefast.obj, camera) < 3) {
            console.log("Fast Zombie collided with player! Reducing health");
            reduceHealth(2); // Reduce player's health by 2 for fast zombies
            healthReduced = true;
            break;
        }
    }

    for (let i = animatronics.length - 1; i >= 0; i--) {
        let zombie = animatronics[i];
        if (distance(zombie.obj, camera) < 3) {
            console.log("Zombie collided with player! Reducing health");
            reduceHealth(3); // Reduce player's health by 3 for normal zombies
            healthReduced = true;
            break;
        }
    }

    if (healthReduced) {
        lastHealthReductionTime = currentTime; // Update the last health reduction time
    }
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
    loseScreen.innerHTML = `Game Over! You have lost the game.<br>Wave: ${wave}<br>Zombies Remaining: ${animatronics.length + fastzombies.length}<br>Time: ${Math.floor((Date.now() - startTime) / 1000)}s`;
    document.body.appendChild(loseScreen);
}
