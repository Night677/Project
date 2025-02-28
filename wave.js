let rnd = (l, u) => Math.random() * (u - l) + l;
let camera, cursor, gun, player;
let bosss = [], animatronics = [], bullets = [], fastzombies = [], foods = [], heals = [], ammos = [], waters = [], trees = [], rocks = [];
let isShooting = false, isWalking = false, isReloading = false, isJumping = false, isSprinting = false, rintStartTime = null, sprintcdst = null, canSprint = true;
let health = 115, score = 0, bullet = 30, wave = 0, maxWave = 30, maxHealth = 115, maxAmmo = 30;
let food_collected = 0, ammo_collected = 0, health_collected = 0, water_collected = 0, sprintDuration = 5000,sprintCooldown = 5000, zomberpw = 0, lastHealthReductionTime = 0;
const walkKeys = new Set(['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']),  jumpKey = ' ', sprintKey = 'Shift';
const healthReductionCooldown = 1000;

window.onload = function () {
    scene = document.querySelector("a-scene");
    camera = document.querySelector("a-camera");
    cursor = document.querySelector("a-cursor");
    gun = document.getElementById("#gun1");
    player = document.getElementById("#player");
    loop();

    window.addEventListener("keydown", function (e) {
            if (walkKeys.has(e.key) && !isWalking && !isReloading) {
            isWalking = true;
            updateAnimation();
        } else if (e.key == 'r' && !isReloading) {
            isReloading = true;
            bullet = maxAmmo;
            updateAnimation();
            setTimeout(() => {
            isReloading = false;
            updateAnimation();
        }, 2000); 
        } else if (e.key == sprintKey && walkKeys.has('w') && !isSprinting && canSprint) {
            isSprinting = true;
// the date is alot more better the doing timer ++ 1 because it's not to exact
            sst = Date.now();
            updateAnimation();
            camera.setAttribute('wasd-controls', 'acceleration: 50');
        } else if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        loseGame();
        }
    });

    window.addEventListener("keyup", function (e) {
        if (walkKeys.has(e.key)) {
            isWalking = false;
            updateAnimation();
        } else if (e.key == sprintKey) {
            isSprinting = false;
            updateAnimation();
            camera.setAttribute('wasd-controls', 'acceleration: 25');
        }
    });

    window.addEventListener('mousedown', function (e) {
        if (e.button == 0 && bullet > 0 && !isReloading) { 
            isShooting = true;
            updateAnimation();
            let newBullet = new Bullet();
            newBullet.shoot();
            bullet--;
            UpWaveinfo();
        }
    });
    window.addEventListener('mouseup', function (e) {
        if (e.button === 0) { 
            isShooting = false;
            updateAnimation();
            console.log("Stopped shooting");
        }
    });
};

window.reduceHealth = function(amount) {
    health -= amount;
    if (health <= 0) {
        loseGame();
    }
    UpWaveinfo(); 
};
// This part is pain because it what use for the gun animation 
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
    for (let i = 0; i < zomberpw; i++) {
        let x = rnd(-20, 20);
        let z = rnd(-250, 250);
        let animatronic = new Animatronic(x, 0.1, z);
//I did little research and use interval to change the animation of the zombie 
        animatronic.intervalId = setInterval(() => {
            animatronic.chase();
        }, 100);
        animatronics.push(animatronic);
    }

    for (let i = 0; i < zomberpw; i++) {
        let x = rnd(-20, 20);
        let z = rnd(-250, 250);
        let fastzombie = new FastZombie(x, 0.1, z);
//I did little research and use interval to change the animation of the zombie 
        fastzombie.intervalId = setInterval(() => {
            fastzombie.chase();
        }, 100);
        fastzombies.push(fastzombie);
    }
}

function checkWaveCompletion() {
    if (animatronics.length === 0 && fastzombies.length === 0) {
        if (wave < maxWave) {
            wave++;
            zomberpw += 5;
            startWave();
        } 
    }
}

function UpWaveinfo() {
//using <p> looks more cleaner then using <a-text>
    const waveInfo = document.getElementById('wave-info');
    waveInfo.innerHTML = `Wave: ${wave}<br>Zombies: ${animatronics.length + fastzombies.length}`;
    
    const playerInfo = document.getElementById('player-info');
    playerInfo.innerHTML = `Health: ${health}<br>Bullets: ${bullet}`;
}

function loop() {
    for (let i = fastzombies.length - 1; i >= 0; i--) {
        let zombiefast = fastzombies[i];
        if (zombiefast.pendingRemoval) continue; 
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombiefast.obj) < 3) {
                
                zombiefast.takeDamage(10); 
                bullets.splice(j, 1);
                bullet.obj.parentNode.removeChild(bullet.obj);
                if (zombiefast.health <= 0) {
                    zombiefast.isDead = true; 
                    zombiefast.die(); 
                    zombiefast.pendingRemoval = true; 
                    setTimeout(() => {
                        fastzombies.splice(fastzombies.indexOf(zombiefast), 1); 
                        UpWaveinfo(); 
                    }, 1000); 
                }
                break;
            }
        }
    }

    for (let i = animatronics.length - 1; i >= 0; i--) {
        let zombie = animatronics[i];
        if (zombie.pendingRemoval) continue; 
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombie.obj) < 3) {
                zombie.takeDamage(10);
                bullets.splice(j, 1);
                bullet.obj.parentNode.removeChild(bullet.obj);
                if (zombie.health <= 0) {
                    zombie.isDead = true; 
                    zombie.die();
                    zombie.pendingRemoval = true; 
                    setTimeout(() => {
                        animatronics.splice(animatronics.indexOf(zombie), 1);
                        UpWaveinfo(); 
                    }, 1000);
                }
                break;
            }
        }
    }

    checkZombiePlayerCollision();
    checkWaveCompletion();
    UpWaveinfo();

    if (isSprinting && Date.now() - sst >= sprintDuration) {
        isSprinting = false;
        canSprint = false;
        sprintcdst = Date.now();
        camera.setAttribute('wasd-controls', 'acceleration: 25');
    }

    if (!canSprint && Date.now() - sprintcdst >= sprintCooldown) {
        canSprint = true;
    }

    requestAnimationFrame(loop); 
}

function checkZombiePlayerCollision() {
    const currentTime = Date.now();
    if (currentTime - lastHealthReductionTime < healthReductionCooldown) {
        return; 
    }

    let healthReduced = false;

    for (let i = fastzombies.length - 1; i >= 0; i--) {
        let zombiefast = fastzombies[i];
        if (distance(zombiefast.obj, camera) < 3) {
            reduceHealth(2); 
            healthReduced = true;
            break;
        }
    }

    for (let i = animatronics.length - 1; i >= 0; i--) {
        let zombie = animatronics[i];
        if (distance(zombie.obj, camera) < 3) {
            reduceHealth(3); 
            healthReduced = true;
            break;
        }
    }

    if (healthReduced) {
        lastHealthReductionTime = currentTime; 
        
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
