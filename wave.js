let rnd = (l, u) => Math.random() * (u - l) + l;
let camera, cursor, gun, player;
let bosss = [], animatronics = [], bullets = [], fastzombies = [], foods = [], heals = [], ammos = [], waters = []; trees = []; rocks = [];
let isShooting = false, isWalking = false, isReloading = false, isJumping = false;
let health = 20, score = 0, bullet = 30, wave = 1, maxWave = 30, maxHealth = 100, maxAmmo = 100;
let food_collected = 0, ammo_collected = 0, health_collected = 0, water_collected = 0;
const walkKeys = new Set(['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const jumpKey = ' ';

let zombiesPerWave = 10;

window.onload = function () {
    scene = document.querySelector("a-scene");
    camera = document.querySelector("a-camera");
    cursor = document.querySelector("a-cursor");
    gun = document.querySelector("#gun1");
  
    player = document.querySelector("#player");
    loop()
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
        }
    });

    // Handle keyup events
    window.addEventListener("keyup", function (e) {
        if (walkKeys.has(e.key)) {
            isWalking = false;
            updateAnimation();
        }
    });

    // Handle mouse down (shooting)
    window.addEventListener('mousedown', function (e) {
        if (e.button === 0 && bullet > 0 && !isReloading) { // Left mouse button and has ammo and not reloading
            isShooting = true;
            updateAnimation();
            console.log("Shooting animation triggered");
            let bullet = new Bullet();
            bullet.shoot();
            bullet--;
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
       
    }
    startWave();
};


function updateAnimation() {
    if (isReloading) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|reload; loop: once; timeScale: 1");
    } else if (isShooting) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|shooting; loop: once; timeScale: 2");
    } else if (isWalking) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|run cycle; loop: repeat; timeScale: 2");
    } else {
        gun.setAttribute('animation-mixer', "clip: Armature.003|idle; loop: repeat; timeScale: 1");
    }
}


function startWave() {
    console.log(`Starting wave ${wave}`);
    for (let i = 0; i < zombiesPerWave; i++) {
        let x = rnd(-100, 100);
        let z = rnd(-100, 100);
        let animatronic = new Animatronic(x, 0.1, z);
        animatronic.intervalId = setInterval(() => {
            animatronic.chase();
        }, 100);
        animatronics.push(animatronic);
    }

    for (let i = 0; i < zombiesPerWave; i++) {
        let x = rnd(-100, 100);
        let z = rnd(-100, 100);
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


function loop() {

    
   
    for (let i = fastzombies.length - 1; i >= 0; i--) {
        let zombiefast = fastzombies[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombiefast.obj) <3  ) {
                console.log("Fast Zombie hit! Calling takeDamage() function");
                zombiefast.takeDamage(10); // Pass the damage value
                bullets.splice(j, 1);
                bullet.obj.parentNode.removeChild(bullet.obj);
                if (zombiefast.health <= 0) {
                    zombiefast.isDead = true; // Set the flag to indicate the zombie is dead
                    zombiefast.die(); // Play dying animation
                    setTimeout(() => {
                        fastzombies.splice(i, 1); // Remove zombie after animation
                    }, 1000); // Adjust the timeout to match the animation duration
                }
                break;
            }
        }
    }

    for (let i = animatronics.length - 1; i >= 0; i--) {
        let zombie = animatronics[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombie.obj) < 3) {
                console.log("Zombie hit! Calling die() function");
                zombie.takeDamage(10); // Pass the damage value
                bullets.splice(j, 1);
                bullet.obj.parentNode.removeChild(bullet.obj);
                if (zombie.health <= 0) {
                    zombie.isDead = true; // Set the flag to indicate the zombie is dead
                    zombie.die(); // Play dying animation
                    setTimeout(() => {
                        animatronics.splice(i, 1); // Remove zombie after animation
                    }, 1000); // Adjust the timeout to match the animation duration
                }
                break;
            }
        }
    }

  checkWaveCompletion();
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

